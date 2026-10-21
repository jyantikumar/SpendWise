<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalysisController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Default range remains 'monthly' for macro-first experience
        $range          = $request->input('range', 'monthly'); 
        $type           = $request->input('type', 'expense');
        $accountId      = $request->input('account_id', 'all');
        $startDateInput = $request->input('start_date');
        $endDateInput   = $request->input('end_date');
        $calendarMonth  = $request->input('calendar_month', Carbon::now()->format('Y-m'));
        $targetYear     = $request->input('year', Carbon::now()->format('Y'));

        $today = Carbon::today();

        // 1. Resolve Date Range Boundaries
        if ($range === '1_week') {
            $startDate = Carbon::now()->subDays(6)->startOfDay();
            $endDate   = Carbon::now()->endOfDay();
        } elseif ($range === '6_months') {
            $startDate = Carbon::now()->subMonths(6)->startOfDay();
            $endDate   = Carbon::now()->endOfDay();
        } elseif ($range === 'this_year') {
            $startDate = Carbon::now()->startOfYear();
            $endDate   = Carbon::now()->endOfDay();
        } elseif ($range === 'monthly') {
            $startDate = Carbon::createFromDate($targetYear, 1, 1)->startOfYear();
            $endDate   = Carbon::createFromDate($targetYear, 12, 31)->endOfYear();
        } elseif ($range === 'yearly') {
            $firstTxDate = Transaction::where('user_id', $user->id)->min('transaction_date');
            $startDate   = $firstTxDate ? Carbon::parse($firstTxDate)->startOfYear() : Carbon::now()->subYears(3)->startOfYear();
            $endDate     = Carbon::now()->endOfYear();
        } elseif ($range === 'custom' && $startDateInput && $endDateInput) {
            $startDate = Carbon::parse($startDateInput)->startOfDay();
            $endDate   = Carbon::parse($endDateInput)->endOfDay();
        } else {
            $startDate = Carbon::parse($calendarMonth)->startOfMonth();
            $endDate   = Carbon::parse($calendarMonth)->endOfMonth();
        }

        // 2. Base Query Filter Scope
        $accountFilter = function ($q) use ($accountId) {
            if ($accountId && $accountId !== 'all') {
                $q->where(function ($sub) use ($accountId) {
                    $sub->where('account_id', $accountId)
                        ->orWhere('destination_account_id', $accountId);
                });
            }
        };

        // 3. Single Eager-Loaded Batch Fetch for the Selected Timeline
        $allPeriodTransactions = Transaction::where('user_id', $user->id)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->tap($accountFilter)
            ->with(['category', 'account', 'destinationAccount'])
            ->get();

        // Non-transfer flow transactions (Expenses & Income)
        $flowTransactions = $allPeriodTransactions->whereIn('type', ['income', 'expense']);

        // Type-Filtered Transactions
        $transactions = $type === 'all' 
            ? $flowTransactions 
            : $flowTransactions->where('type', $type);

        // 4. Period Summary KPIs
        $totalIncome  = $allPeriodTransactions->where('type', 'income')->sum('amount');
        $totalExpense = $allPeriodTransactions->where('type', 'expense')->sum('amount');
        $netCashFlow  = $totalIncome - $totalExpense;

        $totalFilteredAmount = $transactions->sum('amount');
        $totalDays           = max(1, $startDate->diffInDays($endDate) + 1);
        $dailyAverage        = $totalFilteredAmount / $totalDays;

        // Peak Day Calculation (Optimized in memory)
        $dailySums = $transactions->groupBy(function ($tx) {
            return Carbon::parse($tx->transaction_date)->format('Y-m-d');
        })->map->sum('amount');

        $peakAmount  = $dailySums->max() ?? 0;
        $peakDateRaw = $dailySums->search($peakAmount) ?? null;
        $peakDate    = $peakDateRaw ? Carbon::parse($peakDateRaw)->format('M d, Y') : null;

        // 5. Line/Area Chart Trend Data (Optimized via memory lookup)
        $trendData    = [];
        $periodCursor = (clone $startDate)->startOfDay();
        $endCursor    = (clone $endDate)->startOfDay();

        $txsByDate = $transactions->groupBy(function ($tx) {
            return Carbon::parse($tx->transaction_date)->format('Y-m-d');
        });

        while ($periodCursor->lte($endCursor)) {
            $dateStr      = $periodCursor->format('Y-m-d');
            $displayLabel = $periodCursor->format('M d');
            $dayTransactions = $txsByDate->get($dateStr, collect());

            if ($type === 'all') {
                $inc         = $dayTransactions->where('type', 'income')->sum('amount');
                $exp         = $dayTransactions->where('type', 'expense')->sum('amount');
                $trendData[] = [
                    'date'    => $displayLabel,
                    'rawDate' => $dateStr,
                    'Income'  => (float) $inc,
                    'Expense' => (float) $exp,
                    'Net'     => (float) ($inc - $exp),
                ];
            } else {
                $amount      = $dayTransactions->sum('amount');
                $trendData[] = [
                    'date'    => $displayLabel,
                    'rawDate' => $dateStr,
                    'Amount'  => (float) $amount,
                ];
            }

            $periodCursor->addDay();
        }

        // 6. Monthly Comparison Bar Chart Data (In-Memory Grouping)
        $monthlyComparisonData = [];
        $monthlyCursor = Carbon::createFromDate($targetYear, 1, 1)->startOfYear();
        $monthlyEnd    = Carbon::createFromDate($targetYear, 12, 31)->endOfYear();

        $txsByMonth = $flowTransactions->groupBy(function ($tx) {
            return Carbon::parse($tx->transaction_date)->format('Y-m');
        });

        while ($monthlyCursor->lte($monthlyEnd)) {
            $yearMonth  = $monthlyCursor->format('Y-m');
            $monthLabel = $monthlyCursor->format('M Y');
            $monthTxs   = $txsByMonth->get($yearMonth, collect());

            $inc = $monthTxs->where('type', 'income')->sum('amount');
            $exp = $monthTxs->where('type', 'expense')->sum('amount');

            $monthlyComparisonData[] = [
                'month'     => $monthLabel,
                'rawMonth'  => $yearMonth,
                'Income'    => (float) $inc,
                'Expense'   => (float) $exp,
                'Net'       => (float) ($inc - $exp),
            ];

            $monthlyCursor->addMonth();
        }

        // 7. Yearly Comparison Bar Chart Data (Single Query Batch)
        $yearlyComparisonData = [];
        $allYearsTransactions = Transaction::where('user_id', $user->id)
            ->whereIn('type', ['income', 'expense'])
            ->tap($accountFilter)
            ->get()
            ->groupBy(function ($tx) {
                return Carbon::parse($tx->transaction_date)->format('Y');
            });

        $startYr = $allYearsTransactions->keys()->min() ?? (int) Carbon::now()->format('Y');
        $endYr   = (int) Carbon::now()->format('Y');

        for ($yr = (int) $startYr; $yr <= $endYr; $yr++) {
            $yrKey = (string) $yr;
            $yrTxs = $allYearsTransactions->get($yrKey, collect());

            $inc = $yrTxs->where('type', 'income')->sum('amount');
            $exp = $yrTxs->where('type', 'expense')->sum('amount');

            $yearlyComparisonData[] = [
                'year'    => $yrKey,
                'rawYear' => $yrKey,
                'Income'  => (float) $inc,
                'Expense' => (float) $exp,
                'Net'     => (float) ($inc - $exp),
            ];
        }

        // 8. Category Breakdown Data
        $categoryData = $allPeriodTransactions
            ->where('type', 'expense')
            ->whereNotNull('category_id')
            ->groupBy('category_id')
            ->map(function ($group) {
                $category = $group->first()->category;
                return [
                    'id'    => $category->id ?? 0,
                    'name'  => $category->name ?? 'Uncategorized',
                    'color' => $category->color ?? '#64748b',
                    'total' => (float) $group->sum('amount'),
                    'count' => $group->count(),
                ];
            })
            ->sortByDesc('total')
            ->values()
            ->take(8);

        // 9. Calendar Grid Assembly
        try {
            $calendarCarbon = Carbon::parse($calendarMonth)->startOfMonth();
        } catch (\Exception $e) {
            $calendarCarbon = Carbon::now()->startOfMonth();
        }

        $startOfMonth = $calendarCarbon->copy()->startOfMonth();
        $endOfMonth   = $calendarCarbon->copy()->endOfMonth();

        $monthTransactions = $allPeriodTransactions->filter(function ($tx) use ($startOfMonth, $endOfMonth) {
            $dt = Carbon::parse($tx->transaction_date);
            return $dt->gte($startOfMonth) && $dt->lte($endOfMonth);
        });

        $calendarDays   = [];
        $firstDayOfWeek = $startOfMonth->dayOfWeek;

        for ($i = 0; $i < $firstDayOfWeek; $i++) {
            $calendarDays[] = null;
        }

        for ($day = 1; $day <= $startOfMonth->daysInMonth; $day++) {
            $currentDateStr  = Carbon::createFromDate($startOfMonth->year, $startOfMonth->month, $day)->format('Y-m-d');
            $dayTransactions = $monthTransactions->filter(function ($tx) use ($currentDateStr) {
                return Carbon::parse($tx->transaction_date)->format('Y-m-d') === $currentDateStr;
            });

            $incomeSum  = $dayTransactions->where('type', 'income')->sum('amount');
            $expenseSum = $dayTransactions->where('type', 'expense')->sum('amount');

            $calendarDays[] = [
                'dayNumber'    => $day,
                'date'         => $currentDateStr,
                'income'       => (float) $incomeSum,
                'expense'      => (float) $expenseSum,
                'isToday'      => $currentDateStr === $today->format('Y-m-d'),
                'transactions' => $dayTransactions->values()->toArray(),
            ];
        }

        // Dynamic Range Label Construction
        if ($range === 'this_month') {
            $rangeLabel = Carbon::parse($calendarMonth)->format('F Y');
        } elseif ($range === 'monthly') {
            $rangeLabel = 'Monthly Comparison (' . $targetYear . ')';
        } elseif ($range === 'yearly') {
            $rangeLabel = 'Yearly Comparison';
        } elseif ($range === '1_week') {
            $rangeLabel = '1 Week';
        } elseif ($range === '6_months') {
            $rangeLabel = '6 Months';
        } elseif ($range === 'this_year') {
            $rangeLabel = 'This Year';
        } else {
            $rangeLabel = 'Custom Range';
        }

        $accounts = $user->accounts()->orderBy('name')->get();

        return Inertia::render('Analysis/Index', [
            'accounts'              => $accounts,
            'kpis'                  => [
                'totalIncome'         => (float) $totalIncome,
                'totalExpense'        => (float) $totalExpense,
                'netCashFlow'         => (float) $netCashFlow,
                'totalFilteredAmount' => (float) $totalFilteredAmount,
                'dailyAverage'        => (float) $dailyAverage,
                'peakAmount'          => (float) $peakAmount,
                'peakDate'            => $peakDate,
                'totalDays'           => $totalDays,
            ],
            'trendData'             => $trendData,
            'monthlyComparisonData' => $monthlyComparisonData,
            'yearlyComparisonData'  => $yearlyComparisonData,
            'categoryData'          => $categoryData,
            'calendar'              => [
                'month'     => $startOfMonth->format('Y-m'),
                'monthName' => $startOfMonth->format('F Y'),
                'days'      => $calendarDays,
            ],
            'filters'               => [
                'range'          => $range,
                'range_label'    => $rangeLabel,
                'type'           => $type,
                'account_id'     => $accountId,
                'start_date'     => $startDate->format('Y-m-d'),
                'end_date'       => $endDate->format('Y-m-d'),
                'calendar_month' => $startOfMonth->format('Y-m'),
                'year'           => (string) $targetYear,
            ],
        ]);
    }
}