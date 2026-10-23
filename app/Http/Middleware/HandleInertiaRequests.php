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
            'overdue' => [],
            'count' => 0,
        ];

        if ($user) {
            $today = Carbon::today();

            // Fetch active recurring rules
            $recurringRules = RecurringTransaction::where('user_id', $user->id)
                ->where('is_active', true)
                ->get();

            // Fetch paid recurring transactions
            $paidTransactions = Transaction::where('user_id', $user->id)
                ->whereNotNull('recurring_transaction_id')
                ->get(['recurring_transaction_id', 'transaction_date'])
                ->groupBy('recurring_transaction_id');

            foreach ($recurringRules as $rule) {
                $currentDueDate = Carbon::parse($rule->start_date);
                $endDate = $rule->end_date ? Carbon::parse($rule->end_date) : null;
                $skippedDates = $rule->skipped_dates ?? [];

                $rulePaidDates = $paidTransactions->get($rule->id, collect())
                    ->pluck('transaction_date')
                    ->map(fn ($d) => Carbon::parse($d)->format('Y-m-d'))
                    ->toArray();

                // Loop up to today to collect current and missed payments
                // Inside HandleInertiaRequests.php

while ($currentDueDate->lte($today) && (! $endDate || $currentDueDate->lte($endDate))) {
    $formattedDate = $currentDueDate->format('Y-m-d');
    $isPaid = in_array($formattedDate, $rulePaidDates);
    $isSkipped = in_array($formattedDate, $skippedDates);

    if (! $isPaid && ! $isSkipped) {
        $item = [
            'id' => $rule->id,
            'title' => $rule->title,
            'amount' => $rule->amount,
            'due_date' => $formattedDate,
            'type' => $rule->type,
        ];

        if ($currentDueDate->isToday()) {
            $notifications['due_today'][] = $item;
        } elseif ($currentDueDate->lt($today)) {
            $notifications['overdue'][] = $item;
        }
    }

    // Move switch OUTSIDE the if statement so it always increments
    switch ($rule->frequency) {
        case 'daily':   $currentDueDate->addDay(); break;
        case 'weekly':  $currentDueDate->addWeek(); break;
        case 'monthly': $currentDueDate->addMonth(); break;
        case 'yearly':  $currentDueDate->addYear(); break;
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
                'error' => fn () => $request->session()->get('error'),
            ],
        ]);
    }
}