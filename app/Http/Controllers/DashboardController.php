<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $filter = $request->input('range', 'this_month');

        // Resolve date boundaries based on global filter
        [$startDate, $endDate] = match ($filter) {
            'last_30_days' => [now()->subDays(30)->startOfDay(), now()->endOfDay()],
            'this_year'    => [now()->startOfYear(), now()->endOfYear()],
            default        => [now()->startOfMonth(), now()->endOfMonth()],
        };

        // 1. KPI Aggregations
        $totalBalance = Account::where('user_id', $userId)->sum('balance');

        $periodIncomes = Transaction::where('user_id', $userId)
            ->where('type', 'income')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');

        $periodExpenses = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');

        $netCashFlow = $periodIncomes - $periodExpenses;

        // 2. Daily Trends & Comparison Data
        $dailyRaw = Transaction::where('user_id', $userId)
            ->whereIn('type', ['income', 'expense'])
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->selectRaw('transaction_date as date, type, SUM(amount) as total')
            ->groupBy('transaction_date', 'type')
            ->orderBy('transaction_date')
            ->get();

        $dailyTrends = [];
        $current = $startDate->copy();
        while ($current <= $endDate) {
            $formattedDate = $current->format('Y-m-d');
            $incomeMatch = $dailyRaw->firstWhere(fn ($i) => $i->date === $formattedDate && $i->type === 'income');
            $expenseMatch = $dailyRaw->firstWhere(fn ($i) => $i->date === $formattedDate && $i->type === 'expense');

            $dailyTrends[] = [
                'transaction_date' => $current->format('M d'),
                'income' => (float) ($incomeMatch->total ?? 0),
                'expense' => (float) ($expenseMatch->total ?? 0),
            ];
            $current->addDay();
        }

        // 3. Category Breakdown Data
        $categoryBreakdown = Transaction::where('transactions.user_id', $userId)
            ->whereIn('transactions.type', ['income', 'expense'])
            ->whereBetween('transactions.transaction_date', [$startDate, $endDate])
            ->join('categories', 'transactions.category_id', '=', 'categories.id')
            ->selectRaw('categories.id, categories.name, categories.type, categories.color, SUM(transactions.amount) as total')
            ->groupBy('categories.id', 'categories.name', 'categories.type', 'categories.color')
            ->get()
            ->groupBy('type');

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
            'accounts' => Account::where('user_id', $userId)->get(['id', 'name', 'type', 'balance']),
            'categories' => Category::where('user_id', $userId)->get(['id', 'name', 'type', 'color', 'icon']),
            'currentFilter' => $filter,
        ]);
    }
}