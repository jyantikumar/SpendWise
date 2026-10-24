<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

        // Fetch paid transactions linked to recurring rules
        $paidTransactions = Transaction::where('user_id', $user->id)
            ->whereNotNull('recurring_transaction_id')
            ->get(['recurring_transaction_id', 'transaction_date'])
            ->groupBy('recurring_transaction_id');

        $pendingInstances = [];

        foreach ($recurringRules as $rule) {
            if (!$rule->is_active) {
                continue;
            }

            $currentDueDate = Carbon::parse($rule->start_date);
            $endDate = $rule->end_date ? Carbon::parse($rule->end_date) : null;
            $skippedDates = $rule->skipped_dates ?? [];

            $rulePaidDates = $paidTransactions->get($rule->id, collect())
                ->pluck('transaction_date')
                ->map(fn($d) => Carbon::parse($d)->format('Y-m-d'))
                ->toArray();

            // Iterate instances up to lookahead window (30 days ahead)
            while ($currentDueDate->lte($lookaheadDate) && (!$endDate || $currentDueDate->lte($endDate))) {
                $formattedDate = $currentDueDate->format('Y-m-d');

                $isPaid = in_array($formattedDate, $rulePaidDates);
                $isSkipped = in_array($formattedDate, $skippedDates);

                if (!$isPaid && !$isSkipped) {
                    $pendingInstances[] = [
                        'rule_id'     => $rule->id,
                        'title'       => $rule->title,
                        'amount'      => $rule->amount,
                        'type'        => $rule->type,
                        'frequency'   => $rule->frequency,
                        'due_date'    => $formattedDate,
                        'account_id'  => $rule->account_id,
                        'category_id' => $rule->category_id,
                        'account'     => $rule->account,
                        'category'    => $rule->category,
                        'is_overdue'  => $currentDueDate->lt($today),
                    ];
                }

                // Advance iteration based on frequency
                switch ($rule->frequency) {
                    case 'daily':   $currentDueDate->addDay(); break;
                    case 'weekly':  $currentDueDate->addWeek(); break;
                    case 'monthly': $currentDueDate->addMonth(); break;
                    case 'yearly':  $currentDueDate->addYear(); break;
                }
            }
        }

        // Sort instances by due date ascending
        usort($pendingInstances, fn($a, $b) => strcmp($a['due_date'], $b['due_date']));

        return Inertia::render('Subscriptions/SubscriptionsView', [
            'recurringTransactions' => $recurringRules,
            'pendingInstances'      => $pendingInstances,
            'accounts'              => $user->accounts()->where('is_active', true)->orderBy('name')->get(),
            'categories'            => $user->categories()->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'amount'      => 'required|numeric|min:0.01',
            'type'        => 'required|in:income,expense',
            'frequency'   => 'required|in:daily,weekly,monthly,yearly',
            'account_id'  => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'auto_create' => 'boolean',
        ]);

        $validated['user_id'] = $request->user()->id;
        $validated['next_due_date'] = $validated['start_date'];

        RecurringTransaction::create($validated);

       return back();
    }

    public function update(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'amount'      => 'required|numeric|min:0.01',
            'type'        => 'required|in:income,expense',
            'frequency'   => 'required|in:daily,weekly,monthly,yearly',
            'account_id'  => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'auto_create' => 'boolean',
        ]);

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
            'account_id'   => 'required|exists:accounts,id',
            'amount'       => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
        ]);

        DB::transaction(function () use ($recurringTransaction, $validated) {
            // 1. Post transaction record
            Transaction::create([
                'user_id'                  => $recurringTransaction->user_id,
                'account_id'               => $validated['account_id'],
                'category_id'              => $recurringTransaction->category_id,
                'recurring_transaction_id' => $recurringTransaction->id,
                'amount'                   => $validated['amount'],
                'type'                     => $recurringTransaction->type,
                'description'              => $recurringTransaction->title . ' (Rec.)',
                'transaction_date'         => $validated['payment_date'],
            ]);

            // 2. Balance update
            $account = Account::findOrFail($validated['account_id']);
            if ($recurringTransaction->type === 'income') {
                $account->increment('balance', $validated['amount']);
            } else {
                $account->decrement('balance', $validated['amount']);
            }

            // 3. Update next_due_date to next future cycle if paid date matches current next_due_date
            $assignedDue = Carbon::parse($validated['due_date'])->format('Y-m-d');
            $currentNextDue = Carbon::parse($recurringTransaction->next_due_date)->format('Y-m-d');

            if ($assignedDue === $currentNextDue) {
                $nextDate = Carbon::parse($recurringTransaction->next_due_date);
                switch ($recurringTransaction->frequency) {
                    case 'daily':   $nextDate->addDay(); break;
                    case 'weekly':  $nextDate->addWeek(); break;
                    case 'monthly': $nextDate->addMonth(); break;
                    case 'yearly':  $nextDate->addYear(); break;
                }

                $isFinished = $recurringTransaction->end_date && $nextDate->greaterThan(Carbon::parse($recurringTransaction->end_date));

                $recurringTransaction->update([
                    'last_generated_at' => Carbon::now(),
                    'next_due_date'     => $nextDate->format('Y-m-d'),
                    'is_active'         => $isFinished ? false : $recurringTransaction->is_active,
                ]);
            }
        });

return back();}

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

        if (!in_array($skippedDate, $currentSkipped)) {
            $currentSkipped[] = $skippedDate;
            $recurringTransaction->update(['skipped_dates' => $currentSkipped]);
        }

return back();}


    public function toggle(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $recurringTransaction->update([
            'is_active' => !$recurringTransaction->is_active,
        ]);

return back();}


    public function destroy(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $recurringTransaction->delete();

return back();}

}