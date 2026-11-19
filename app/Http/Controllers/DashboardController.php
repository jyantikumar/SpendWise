<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\AccountType;
use App\Models\Category;
use App\Models\RecurringTransaction;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $filter = $request->input('range', 'this_month');

        $customStartDate = $request->input('start_date');
        $customEndDate   = $request->input('end_date');

        // Resolve date boundaries based on filter
        if ($filter === 'custom' && $customStartDate && $customEndDate) {
            $startDate = Carbon::parse($customStartDate)->startOfDay();
            $endDate   = Carbon::parse($customEndDate)->endOfDay();
        } else {
            [$startDate, $endDate] = match ($filter) {
                'this_day'     => [now()->startOfDay(), now()->endOfDay()],
                'this_week'    => [now()->startOfWeek(), now()->endOfWeek()],
                'this_month'   => [now()->startOfMonth(), now()->endOfMonth()],
                'last_30_days' => [now()->subDays(30)->startOfDay(), now()->endOfDay()],
                'this_year'    => [now()->startOfYear(), now()->endOfYear()],
                default        => [now()->startOfMonth(), now()->endOfMonth()],
            };
        }

        $startStr = $startDate->format('Y-m-d H:i:s');
        $endStr   = $endDate->format('Y-m-d H:i:s');

        // 1. Only active accounts should contribute to balances and flows
        $activeAccountIds = Account::where('user_id', $userId)
            ->where('is_active', true)
            ->pluck('id');

        // 2. Total Balance — only active accounts
        $totalBalance = Account::where('user_id', $userId)
            ->where('is_active', true)
            ->sum('balance');

        // 3. Period income/expense — exclude transactions tied to inactive accounts
        $periodIncomes = Transaction::where('user_id', $userId)
            ->where('type', 'income')
            ->whereIn('account_id', $activeAccountIds)
            ->whereBetween('transaction_date', [$startStr, $endStr])
            ->sum('amount');

        $periodExpenses = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereIn('account_id', $activeAccountIds)
            ->whereBetween('transaction_date', [$startStr, $endStr])
            ->sum('amount');

        $netCashFlow = $periodIncomes - $periodExpenses;

        // 4. Actual Period Transactions (recorded transactions for the sheet drawer)
        $periodTransactions = Transaction::where('user_id', $userId)
            ->whereIn('account_id', $activeAccountIds)
            ->whereBetween('transaction_date', [$startStr, $endStr])
            ->with(['account', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->get()
            ->map(function ($tx) {
                return [
                    'id'           => $tx->id,
                    'title'        => $tx->description ?: ($tx->category->name ?? ucfirst($tx->type)),
                    'amount'       => (float) $tx->amount,
                    'type'         => $tx->type,
                    'date'         => Carbon::parse($tx->transaction_date)->format('M d, Y'),
                    'is_recurring' => false,
                    'category'     => $tx->category->name ?? null,
                ];
            });

        // 5. Daily Trends — only active accounts
        $dailyRaw = Transaction::where('user_id', $userId)
            ->whereIn('type', ['income', 'expense'])
            ->whereIn('account_id', $activeAccountIds)
            ->whereBetween('transaction_date', [$startStr, $endStr])
            ->selectRaw('DATE(transaction_date) as date, type, SUM(amount) as total')
            ->groupBy('date', 'type')
            ->orderBy('date')
            ->get();

        $dailyTrends = [];
        $current = $startDate->copy();
        while ($current <= $endDate) {
            $formattedDate = $current->format('Y-m-d');

            $incomeMatch = $dailyRaw->firstWhere(function ($i) use ($formattedDate) {
                $rawDate = $i->date instanceof Carbon ? $i->date->format('Y-m-d') : (string) $i->date;
                return $rawDate === $formattedDate && $i->type === 'income';
            });

            $expenseMatch = $dailyRaw->firstWhere(function ($i) use ($formattedDate) {
                $rawDate = $i->date instanceof Carbon ? $i->date->format('Y-m-d') : (string) $i->date;
                return $rawDate === $formattedDate && $i->type === 'expense';
            });

            $dailyTrends[] = [
                'transaction_date' => $current->format('M d'),
                'rawDate'          => $formattedDate,
                'income'           => (float) ($incomeMatch->total ?? 0),
                'expense'          => (float) ($expenseMatch->total ?? 0),
            ];
            $current->addDay();
        }

        // 6. Category Breakdown — only active accounts
        $categoryBreakdown = Transaction::where('transactions.user_id', $userId)
            ->whereIn('transactions.type', ['income', 'expense'])
            ->whereIn('transactions.account_id', $activeAccountIds)
            ->whereBetween('transactions.transaction_date', [$startStr, $endStr])
            ->leftJoin('categories', 'transactions.category_id', '=', 'categories.id')
            ->selectRaw("
                COALESCE(categories.id, 0) as id,
                COALESCE(categories.name, 'Uncategorized') as name,
                transactions.type as type,
                COALESCE(categories.color, '#94a3b8') as color,
                SUM(transactions.amount) as total
            ")
            ->groupBy('categories.id', 'categories.name', 'transactions.type', 'categories.color')
            ->get()
            ->groupBy('type');

        // 7. Latest 10 Transactions — only from active accounts
        $latestTransactions = Transaction::where('user_id', $userId)
            ->whereIn('account_id', $activeAccountIds)
            ->with(['account', 'destinationAccount', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();

        // 8. Active savings goals
        $savingsGoals = SavingsGoal::where('user_id', $userId)
            ->where('status', 'active')
            ->orderBy('title')
            ->get(['id', 'title', 'status', 'target_amount', 'current_amount']);

        // 9. Recurring Net Flow & Itemized Recurring Instances
        $recurringRules = RecurringTransaction::where('user_id', $userId)
            ->where('is_active', true)
            ->whereIn('account_id', $activeAccountIds)
            ->get();

        $paidTransactions = Transaction::where('user_id', $userId)
            ->whereNotNull('recurring_transaction_id')
            ->get(['recurring_transaction_id', 'transaction_date'])
            ->groupBy('recurring_transaction_id');

        $recurringIncome = 0.0;
        $recurringExpense = 0.0;
        $recurringInstances = [];

        // Lookahead to the end of the current month
        $lookaheadStr = now()->endOfMonth()->format('Y-m-d');
        $todayStr = Carbon::today()->format('Y-m-d');

        foreach ($recurringRules as $rule) {
            $startDateStr = optional($rule->start_date)->format('Y-m-d');
            if (!$startDateStr) continue;

            $skippedDates = $rule->skipped_dates ?? [];
            $weekdays = $this->normalizeWeekdays($rule->weekdays);

            $currentDueDate = $this->resolveFirstDueDate(
                Carbon::parse($startDateStr),
                $rule->frequency,
                $weekdays
            );

            $rulePaidDates = $paidTransactions->get($rule->id, collect())
                ->pluck('transaction_date')
                ->map(fn ($d) => Carbon::parse($d)->format('Y-m-d'))
                ->toArray();

            while ($currentDueDate->format('Y-m-d') <= $lookaheadStr) {
                $formattedDate = $currentDueDate->format('Y-m-d');

                // Stop iterating if we've gone past the end date
                if ($rule->end_date && $formattedDate > Carbon::parse($rule->end_date)->format('Y-m-d')) {
                    break;
                }

                // Only count it if it's in the future (or today) AND unpaid AND not skipped
                if ($formattedDate >= $todayStr) {
                    $isPaid = in_array($formattedDate, $rulePaidDates, true);
                    $isSkipped = in_array($formattedDate, $skippedDates, true);

                    if (!$isPaid && !$isSkipped) {
                        $amount = (float) $rule->amount;

                        if ($rule->type === 'income') {
                            $recurringIncome += $amount;
                        } else {
                            $recurringExpense += $amount;
                        }

                        $recurringInstances[] = [
                            'rule_id'      => $rule->id,
                            'title'        => $rule->description ?? $rule->title ?? 'Recurring Item',
                            'amount'       => $amount,
                            'type'         => $rule->type,
                            'date'         => Carbon::parse($formattedDate)->format('M d, Y'),
                            'raw_date'     => $formattedDate,
                            'is_recurring' => true,
                        ];
                    }
                }

                $currentDueDate = RecurringTransaction::advanceDate(
                    $currentDueDate,
                    $rule->frequency,
                    $weekdays
                );
            }
        }

        // Sort instances chronologically by due date
        usort($recurringInstances, fn ($a, $b) => strcmp($a['raw_date'], $b['raw_date']));

        $projectedRecurringNet = (float) ($recurringIncome - $recurringExpense);

        return Inertia::render('Dashboard', [
            'kpis' => [
                'totalBalance'          => (float) $totalBalance,
                'netCashFlow'           => (float) $netCashFlow,
                'totalIncome'           => (float) $periodIncomes,
                'totalExpense'          => (float) $periodExpenses,
                'projectedAmount'       => (float) ($netCashFlow + $projectedRecurringNet),
                'projectedRecurringNet' => $projectedRecurringNet,
            ],
            'dailyTrends' => $dailyTrends,
            'categoryBreakdown' => [
                'expense' => $categoryBreakdown->get('expense', collect())->values(),
                'income'  => $categoryBreakdown->get('income', collect())->values(),
            ],
            'latestTransactions' => $latestTransactions,
            'periodTransactions' => $periodTransactions,
            'recurringInstances' => $recurringInstances,
            'accounts' => Account::where('user_id', $userId)
                ->orderBy('name')
                ->get(['id', 'name', 'type', 'balance', 'is_active', 'color']),
            'accountTypes' => AccountType::where('user_id', $userId)
                ->orderBy('name')
                ->get(['id', 'name', 'color', 'icon']),
            'categories' => Category::where('user_id', $userId)
                ->orderBy('name')
                ->get(['id', 'name', 'type', 'color', 'icon']),
            'savingsGoals'  => $savingsGoals,
            'currentFilter' => $filter,
            'customDates'   => [
                'startDate' => $customStartDate ?? $startDate->format('Y-m-d'),
                'endDate'   => $customEndDate ?? $endDate->format('Y-m-d'),
            ],
        ]);
    }

    // ------------------------------------------------------------------
    // Helpers copied from RecurringTransactionController
    // ------------------------------------------------------------------

    private function normalizeWeekdays($value): array
    {
        if ($value === null || $value === '') return [];
        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : [];
        }
        if (!is_array($value)) return [];

        $cleaned = [];
        foreach ($value as $v) {
            if (!is_numeric($v)) continue;
            $day = (int) $v;
            if ($day >= 0 && $day <= 6) $cleaned[$day] = $day;
        }
        ksort($cleaned);
        return array_values($cleaned);
    }

    private function resolveFirstDueDate(Carbon $start, string $frequency, array $weekdays): Carbon
    {
        $date = $start->copy()->startOfDay();
        $startStr = $date->format('Y-m-d');

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
                if ($date->format('Y-m-d') < $startStr) {
                    $date = $start->copy()->startOfDay();
                }
                return $date;
            }
        }

        return $date;
    }
}