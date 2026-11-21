<?php

namespace App\Http\Middleware;

use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $notifications = [
            'due_today' => [],
            'overdue'   => [],
            'count'     => 0,
        ];

        if ($user) {
            $today = Carbon::today();

            // 1. Fetch active recurring rules with categories eager-loaded outside the loop
            $recurringRules = RecurringTransaction::with('category')
                ->where('user_id', $user->id)
                ->where('is_active', true)
                ->get();

            // 2. Fetch paid recurring transactions
            $paidTransactions = Transaction::where('user_id', $user->id)
                ->whereNotNull('recurring_transaction_id')
                ->get(['recurring_transaction_id', 'transaction_date'])
                ->groupBy('recurring_transaction_id');

            foreach ($recurringRules as $rule) {
                if (!$rule->start_date) continue;

                $currentDueDate = Carbon::parse($rule->start_date)->startOfDay();
                $endDate = $rule->end_date ? Carbon::parse($rule->end_date)->endOfDay() : null;
                $skippedDates = $rule->skipped_dates ?? [];

                $rulePaidDates = $paidTransactions->get($rule->id, collect())
                    ->pluck('transaction_date')
                    ->map(fn ($d) => Carbon::parse($d)->format('Y-m-d'))
                    ->toArray();

                $safetyCounter = 0;
                $maxIterations = 100; // Safeguard against infinite execution

                while ($currentDueDate->lte($today) && (!$endDate || $currentDueDate->lte($endDate)) && $safetyCounter < $maxIterations) {
                    $safetyCounter++;
                    $formattedDate = $currentDueDate->format('Y-m-d');
                    $isPaid = in_array($formattedDate, $rulePaidDates, true);
                    $isSkipped = in_array($formattedDate, $skippedDates, true);

                    if (!$isPaid && !$isSkipped) {
                        $item = [
                            'id'            => $rule->id,
                            'title'         => $rule->title,
                            'amount'        => (float) $rule->amount,
                            'due_date'      => $formattedDate,
                            'type'          => $rule->type,
                            'account_id'    => $rule->account_id,
                            'category_id'   => $rule->category_id,
                            'category_name' => $rule->category?->name ?? 'Uncategorized',
                        ];

                        if ($currentDueDate->isToday()) {
                            $notifications['due_today'][] = $item;
                        } elseif ($currentDueDate->lt($today)) {
                            $notifications['overdue'][] = $item;
                        }
                    }

                    $previousDate = $currentDueDate->copy();

                    // Advance using model method or fallback switch
                    if (method_exists($rule, 'advanceDate')) {
                        $currentDueDate = $rule::advanceDate($currentDueDate, $rule->frequency, $rule->weekdays ?? []);
                    } else {
                        switch ($rule->frequency) {
                            case 'daily':   $currentDueDate->addDay(); break;
                            case 'weekly':  $currentDueDate->addWeek(); break;
                            case 'monthly': $currentDueDate->addMonthNoOverflow(); break;
                            case 'yearly':  $currentDueDate->addYearNoOverflow(); break;
                            default:        $currentDueDate->addDay(); break;
                        }
                    }

                    // Strict protection: ensure date always moves forward by at least 1 day
                    if ($currentDueDate->lte($previousDate)) {
                        $currentDueDate = $previousDate->copy()->addDay();
                    }
                }
            }

            $notifications['count'] = count($notifications['due_today']) + count($notifications['overdue']);
        }

        return array_merge(parent::share($request), [
            'auth' => [
                'user' => $user,
            ],
            'notifications' => $notifications,
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}