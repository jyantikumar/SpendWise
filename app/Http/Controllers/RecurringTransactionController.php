<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class RecurringTransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $recurringRules = RecurringTransaction::where('user_id', $user->id)
            ->with(['account', 'category'])
            ->orderBy('next_due_date', 'asc')
            ->get();

        $today = Carbon::today();
        $lookaheadDate = $today->copy()->addDays(30);

        $paidTransactions = Transaction::where('user_id', $user->id)
            ->whereNotNull('recurring_transaction_id')
            ->get(['recurring_transaction_id', 'transaction_date'])
            ->groupBy('recurring_transaction_id');

        $pendingInstances = [];
        $todayInstances = [];

        foreach ($recurringRules as $rule) {
            if (!$rule->is_active) {
                continue;
            }

            $endDate = $rule->end_date ? Carbon::parse($rule->end_date) : null;
            $skippedDates = $rule->skipped_dates ?? [];
            $weekdays = $this->normalizeWeekdays($rule->weekdays);

            $currentDueDate = $this->resolveFirstDueDate(
                Carbon::parse($rule->start_date),
                $rule->frequency,
                $weekdays
            );

            $rulePaidDates = $paidTransactions->get($rule->id, collect())
                ->pluck('transaction_date')
                ->map(fn ($d) => Carbon::parse($d)->format('Y-m-d'))
                ->toArray();

            while (
                $currentDueDate->lte($lookaheadDate)
                && (!$endDate || $currentDueDate->lte($endDate))
            ) {
                $formattedDate = $currentDueDate->format('Y-m-d');

                $isPaid = in_array($formattedDate, $rulePaidDates, true);
                $isSkipped = in_array($formattedDate, $skippedDates, true);

                if (!$isPaid && !$isSkipped) {
                    $instance = [
                        'rule_id'     => $rule->id,
                        'title'       => $rule->title,
                        'amount'      => $rule->amount,
                        'type'        => $rule->type,
                        'frequency'   => $rule->frequency,
                        'weekdays'    => $weekdays,
                        'due_date'    => $formattedDate,
                        'account_id'  => $rule->account_id,
                        'category_id' => $rule->category_id,
                        'account'     => $rule->account,
                        'category'    => $rule->category,
                        'is_overdue'  => $currentDueDate->lt($today),
                    ];

                    if ($currentDueDate->isSameDay($today)) {
                        $todayInstances[] = $instance;
                    }

                    $pendingInstances[] = $instance;
                }

                $currentDueDate = RecurringTransaction::advanceDate(
                    $currentDueDate,
                    $rule->frequency,
                    $weekdays
                );
            }
        }

        usort($pendingInstances, fn ($a, $b) => strcmp($a['due_date'], $b['due_date']));
        usort($todayInstances, fn ($a, $b) => strcmp($a['due_date'], $b['due_date']));

        return Inertia::render('Subscriptions/SubscriptionsView', [
            'recurringTransactions' => $recurringRules,
            'pendingInstances'      => $pendingInstances,
            'todayInstances'        => $todayInstances,
            'accounts'              => $user->accounts()->orderBy('name')->get(),
            'categories'            => $user->categories()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatePayload($request);

        $validated['user_id'] = $request->user()->id;
        $validated['weekdays'] = $this->normalizeWeekdays($validated['weekdays'] ?? null);
        $validated['next_due_date'] = $this->resolveFirstDueDate(
            Carbon::parse($validated['start_date']),
            $validated['frequency'],
            $validated['weekdays'] ?? []
        )->format('Y-m-d');

        RecurringTransaction::create($validated);

        return back();
    }

    public function update(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $this->validatePayload($request);

        $validated['weekdays'] = $this->normalizeWeekdays($validated['weekdays'] ?? null);

        if ($this->scheduleChanged($recurringTransaction, $validated)) {
            $validated['next_due_date'] = $this->resolveFirstDueDate(
                Carbon::parse($validated['start_date']),
                $validated['frequency'],
                $validated['weekdays'] ?? []
            )->format('Y-m-d');
        }

        $recurringTransaction->update($validated);

        return back();
    }

    public function process(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'due_date'     => 'required|date',
            'account_id'   => [
                'required',
                Rule::exists('accounts', 'id')->where('user_id', $request->user()->id),
            ],
            'amount'       => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
        ]);

        // Guard: if the rule's stored category is missing, owned by another
        // user, or its `type` doesn't match the rule's type, drop it rather
        // than writing a category onto the transaction that the edit modal
        // would be unable to render (which was the original bug).
        $categoryId = $this->resolveSafeCategoryId(
            $recurringTransaction->user_id,
            $recurringTransaction->category_id,
            $recurringTransaction->type
        );

        DB::transaction(function () use ($recurringTransaction, $validated, $categoryId) {
            Transaction::create([
                'user_id'                  => $recurringTransaction->user_id,
                'account_id'               => $validated['account_id'],
                'category_id'              => $categoryId,
                'recurring_transaction_id' => $recurringTransaction->id,
                'amount'                   => $validated['amount'],
                'type'                     => $recurringTransaction->type,
                'description'              => $recurringTransaction->title . ' (Rec.)',
                'transaction_date'         => $validated['payment_date'],
            ]);

            $account = Account::findOrFail($validated['account_id']);
            if ($recurringTransaction->type === 'income') {
                $account->increment('balance', $validated['amount']);
            } else {
                $account->decrement('balance', $validated['amount']);
            }

            $assignedDue = Carbon::parse($validated['due_date'])->format('Y-m-d');
            $currentNextDue = Carbon::parse($recurringTransaction->next_due_date)->format('Y-m-d');

            if ($assignedDue === $currentNextDue) {
                $nextDate = RecurringTransaction::advanceDate(
                    Carbon::parse($recurringTransaction->next_due_date),
                    $recurringTransaction->frequency,
                    $this->normalizeWeekdays($recurringTransaction->weekdays)
                );

                $isFinished = $recurringTransaction->end_date
                    && $nextDate->greaterThan(Carbon::parse($recurringTransaction->end_date));

                $recurringTransaction->update([
                    'last_generated_at' => Carbon::now(),
                    'next_due_date'     => $nextDate->format('Y-m-d'),
                    'is_active'         => $isFinished ? false : $recurringTransaction->is_active,
                ]);
            }
        });

        return back();
    }

    public function skip(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'due_date' => 'required|date',
        ]);

        $skippedDate = Carbon::parse($validated['due_date'])->format('Y-m-d');
        $currentSkipped = $recurringTransaction->skipped_dates ?? [];

        if (!in_array($skippedDate, $currentSkipped, true)) {
            $currentSkipped[] = $skippedDate;
            $recurringTransaction->update(['skipped_dates' => $currentSkipped]);
        }

        return back();
    }

    public function toggle(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $recurringTransaction->update([
            'is_active' => !$recurringTransaction->is_active,
        ]);

        return back();
    }

    public function destroy(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $recurringTransaction->delete();

        return back();
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private function validatePayload(Request $request): array
    {
        $userId = $request->user()->id;

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'amount'      => 'required|numeric|min:0.01',
            'type'        => 'required|in:income,expense',
            'frequency'   => 'required|in:daily,weekly,monthly,yearly',
            'weekdays'    => 'nullable|array|required_if:frequency,weekly',
            'weekdays.*'  => 'integer|between:0,6',
            'account_id'  => [
                'required',
                Rule::exists('accounts', 'id')->where('user_id', $userId),
            ],
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where('user_id', $userId),
            ],
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'auto_create' => 'boolean',
        ]);

        if ($validated['frequency'] !== 'weekly') {
            $validated['weekdays'] = null;
        }

        return $validated;
    }

    /**
     * Return a category_id that is safe to attach to a generated transaction,
     * or null if the rule's stored category is invalid / mismatched.
     *
     * A mismatched category would later be filtered out of the edit modal's
     * dropdown (because the modal only offers categories whose type matches
     * the transaction type), causing the Select to render empty even though
     * category_id is set — the original bug.
     */
    private function resolveSafeCategoryId(int $userId, $categoryId, string $ruleType): ?int
    {
        if (empty($categoryId)) {
            return null;
        }

        $category = Category::where('user_id', $userId)
            ->where('id', $categoryId)
            ->first();

        if (!$category) {
            Log::warning('Recurring rule references missing/foreign category', [
                'user_id'     => $userId,
                'category_id' => $categoryId,
            ]);
            return null;
        }

        // Categories with no type are treated as "neutral" and allowed.
        // A typed category must match the rule's type.
        if (!empty($category->type) && $category->type !== $ruleType) {
            Log::warning('Dropping mismatched category on recurring process', [
                'user_id'         => $userId,
                'category_id'     => $categoryId,
                'category_type'   => $category->type,
                'rule_type'       => $ruleType,
            ]);
            return null;
        }

        return (int) $category->id;
    }

    private function normalizeWeekdays($value): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : [];
        }

        if (!is_array($value)) {
            return [];
        }

        $cleaned = [];
        foreach ($value as $v) {
            if (!is_numeric($v)) {
                continue;
            }
            $day = (int) $v;
            if ($day >= 0 && $day <= 6) {
                $cleaned[$day] = $day;
            }
        }

        ksort($cleaned);
        return array_values($cleaned);
    }

    private function resolveFirstDueDate(Carbon $start, string $frequency, array $weekdays): Carbon
    {
        $date = $start->copy();

        if ($frequency !== 'weekly' || empty($weekdays)) {
            return $date;
        }

        $allowed = array_map('intval', $weekdays);

        if (in_array($date->dayOfWeek, $allowed, true)) {
            return $date;
        }

        for ($i = 0; $i < 7; $i++) {
            $date->addDay();
            if (in_array($date->dayOfWeek, $allowed, true)) {
                return $date;
            }
        }

        return $date;
    }

    private function scheduleChanged(RecurringTransaction $rule, array $validated): bool
    {
        $currentWeekdays = $this->normalizeWeekdays($rule->weekdays);
        $newWeekdays = $this->normalizeWeekdays($validated['weekdays'] ?? null);

        $currentStart = optional($rule->start_date)->format('Y-m-d');
        $currentEnd = optional($rule->end_date)->format('Y-m-d');

        return $rule->frequency !== $validated['frequency']
            || $currentWeekdays !== $newWeekdays
            || $currentStart !== Carbon::parse($validated['start_date'])->format('Y-m-d')
            || $currentEnd !== (!empty($validated['end_date'])
                ? Carbon::parse($validated['end_date'])->format('Y-m-d')
                : null);
    }
}