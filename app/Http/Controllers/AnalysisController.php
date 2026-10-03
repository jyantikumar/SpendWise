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

        // Filter Inputs
        $range          = $request->input('range', 'this_month');
        $type           = $request->input('type', 'expense'); // 'expense', 'income', 'all'
        $accountId      = $request->input('account_id', 'all');
        $startDateInput = $request->input('start_date');
        $endDateInput   = $request->input('end_date');
        $calendarMonth  = $request->input('calendar_month', Carbon::now()->format('Y-m'));

        // Calculate Date Range Boundaries
        $today = Carbon::today();

        if ($range === '1_week') {
            $startDate = Carbon::now()->subDays(6)->startOfDay();
            $endDate   = Carbon::now()->endOfDay();
        } elseif ($range === '6_months') {
            $startDate = Carbon::now()->subMonths(6)->startOfDay();
            $endDate   = Carbon::now()->endOfDay();
        } elseif ($range === 'this_year') {
            $startDate = Carbon::now()->startOfYear();
            $endDate   = Carbon::now()->endOfDay();
        } elseif ($range === 'custom' && $startDateInput && $endDateInput) {
            $startDate = Carbon::parse($startDateInput)->startOfDay();
            $endDate   = Carbon::parse($endDateInput)->endOfDay();
        } else {
            // Default: 'this_month'
            $startDate = Carbon::now()->startOfMonth();
            $endDate   = Carbon::now()->endOfDay();
        }

        // 1. Base Query for Charts & KPIs
        $baseQuery = Transaction::where('user_id', $user->id)
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->when($accountId && $accountId !== 'all', function ($q) use ($accountId) {
                $q->where(function ($sub) use ($accountId) {
                    $sub->where('account_id', $accountId)
                        ->orWhere('destination_account_id', $accountId);
                });
            });

        // 2. Fetch Transactions matching Type filter for Chart & Metric processing
        $typeFilteredQuery = (clone $baseQuery)
            ->when($type !== 'all', function ($q) use ($type) {
                $q->where('type', $type);
            });

        $transactions = $typeFilteredQuery->with(['category', 'account', 'destinationAccount'])->get();

        // 3. Period Summary KPIs
        $totalIncome  = (clone $baseQuery)->where('type', 'income')->sum('amount');
        $totalExpense = (clone $baseQuery)->where('type', 'expense')->sum('amount');
        $netCashFlow  = $totalIncome - $totalExpense;

        $totalFilteredAmount = $transactions->sum('amount');
        $totalDays           = max(1, $startDate->diffInDays($endDate) + 1);
        $dailyAverage        = $totalFilteredAmount / $totalDays;

        // Peak Day Calculation
        $dailySums = $transactions->groupBy(function ($tx) {
            return Carbon::parse($tx->transaction_date)->format('Y-m-d');
        })->map(function ($dayTxs) {
            return $dayTxs->sum('amount');
        });

        $peakAmount = $dailySums->max() ?? 0;
        $peakDate   = $dailySums->search($peakAmount) ?? null;

        // 4. Line/Area Chart Trend Data
        $trendData    = [];
        $periodCursor = (clone $startDate)->startOfDay();
        $endCursor    = (clone $endDate)->startOfDay();

        while ($periodCursor->lte($endCursor)) {
            $dateStr      = $periodCursor->format('Y-m-d');
            $displayLabel = $periodCursor->format('M d');

            $dayTransactions = $transactions->filter(function ($tx) use ($dateStr) {
                return Carbon::parse($tx->transaction_date)->format('Y-m-d') === $dateStr;
            });

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

        // 5. Category Breakdown Bar Chart Data (Expenses Only)
        $categoryData = (clone $baseQuery)
            ->where('type', 'expense')
            ->whereNotNull('category_id')
            ->with('category')
            ->get()
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

        // 6. Selectable Calendar Grid (Eager load relationships for detail modal)
        try {
            $calendarCarbon = Carbon::parse($calendarMonth)->startOfMonth();
        } catch (\Exception $e) {
            $calendarCarbon = Carbon::now()->startOfMonth();
        }

        $startOfMonth = $calendarCarbon->copy()->startOfMonth();
        $endOfMonth   = $calendarCarbon->copy()->endOfMonth();

        $monthTransactions = Transaction::where('user_id', $user->id)
            ->whereBetween('transaction_date', [$startOfMonth, $endOfMonth])
            ->when($accountId && $accountId !== 'all', function ($q) use ($accountId) {
                $q->where(function ($sub) use ($accountId) {
                    $sub->where('account_id', $accountId)
                        ->orWhere('destination_account_id', $accountId);
                });
            })
            ->with(['category', 'account', 'destinationAccount']) // 👈 Added eager loading here
            ->orderBy('transaction_date', 'asc')
            ->get();

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
                'transactions' => $dayTransactions->values()->toArray(), // 👈 Passed transaction objects here
            ];
        }

        $accounts = $user->accounts()->orderBy('name')->get();

        return Inertia::render('Analysis/Index', [
            'accounts'     => $accounts,
            'kpis'         => [
                'totalIncome'         => (float) $totalIncome,
                'totalExpense'        => (float) $totalExpense,
                'netCashFlow'         => (float) $netCashFlow,
                'totalFilteredAmount' => (float) $totalFilteredAmount,
                'dailyAverage'        => (float) $dailyAverage,
                'peakAmount'          => (float) $peakAmount,
                'peakDate'            => $peakDate,
                'totalDays'           => $totalDays,
            ],
            'trendData'    => $trendData,
            'categoryData' => $categoryData,
            'calendar'     => [
                'month'     => $startOfMonth->format('Y-m'),
                'monthName' => $startOfMonth->format('F Y'),
                'days'      => $calendarDays,
            ],
            'filters'      => [
                'range'          => $range,
                'type'           => $type,
                'account_id'     => $accountId,
                'start_date'     => $startDate->format('Y-m-d'),
                'end_date'       => $endDate->format('Y-m-d'),
                'calendar_month' => $startOfMonth->format('Y-m'),
            ],
        ]);
    }
}