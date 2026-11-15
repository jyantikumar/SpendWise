<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\AccountType;
use App\Models\Category;
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
        // Change default filter from 'this_day' to 'this_month'
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

        // 1. KPI Aggregations (Total Balance remains constant across all filters)
        $totalBalance = Account::where('user_id', $userId)->sum('balance');

        $periodIncomes = Transaction::where('user_id', $userId)
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$startStr, $endStr])
            ->sum('amount');

        $periodExpenses = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startStr, $endStr])
            ->sum('amount');

        $netCashFlow = $periodIncomes - $periodExpenses;

        // 2. Daily Trends
        $dailyRaw = Transaction::where('user_id', $userId)
            ->whereIn('type', ['income', 'expense'])
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
                'income'  => (float) ($incomeMatch->total ?? 0),
                'expense' => (float) ($expenseMatch->total ?? 0),
            ];
            $current->addDay();
        }

        // 3. Category Breakdown Data
        $categoryBreakdown = Transaction::where('transactions.user_id', $userId)
            ->whereIn('transactions.type', ['income', 'expense'])
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

        // 4. Latest 10 Transactions
        $latestTransactions = Transaction::where('user_id', $userId)
            ->with(['account', 'destinationAccount', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->take(10)
            ->get();

        // 5. Active savings goals for the TransactionFormModal dropdown
        $savingsGoals = SavingsGoal::where('user_id', $userId)
            ->where('status', 'active')
            ->orderBy('title')
            ->get(['id', 'title', 'status', 'target_amount', 'current_amount']);

        return Inertia::render('Dashboard', [
            'kpis' => [
                'totalBalance' => (float) $totalBalance,
                'netCashFlow'  => (float) $netCashFlow,
                'totalIncome'  => (float) $periodIncomes,
                'totalExpense' => (float) $periodExpenses,
            ],
            'dailyTrends' => $dailyTrends,
            'categoryBreakdown' => [
                'expense' => $categoryBreakdown->get('expense', collect())->values(),
                'income'  => $categoryBreakdown->get('income', collect())->values(),
            ],
            'latestTransactions' => $latestTransactions,
            'accounts' => Account::where('user_id', $userId)
                ->orderBy('name')
                ->get(['id', 'name', 'type', 'balance', 'is_active','color']),
            'accountTypes' => AccountType::where('user_id', $userId)
                ->orderBy('name')
                ->get(['id', 'name', 'color', 'icon']),
            'categories' => Category::where('user_id', $userId)
                ->orderBy('name')
                ->get(['id', 'name', 'type', 'color', 'icon']),
            'savingsGoals' => $savingsGoals,                 // 👈 top-level, matches JSX destructure
            'currentFilter' => $filter,
            'customDates' => [
                'startDate' => $customStartDate ?? $startDate->format('Y-m-d'),
                'endDate'   => $customEndDate ?? $endDate->format('Y-m-d'),
            ],
        ]);
    }
}