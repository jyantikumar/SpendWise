import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    BarChart,
    Bar,
    PieChart, 
    Pie, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    Cell 
} from 'recharts';
import { 
    BarChart3, 
    TrendingUp, 
    DollarSign, 
    Calendar as CalendarIcon, 
    SlidersHorizontal,
    Wallet,
    Zap,
    PieChart as PieIcon,
    ChevronLeft,
    ChevronRight,
    Columns3,
    CalendarDays,
    ArrowLeft,
    Filter,
    X
} from 'lucide-react';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from '@/components/ui/sheet';

import { DateTransactionsDialog } from '@/components/DateTransactionsDialog';
import { ExpenseCategoryCard } from '@/components/ExpenseCategoryCard';
import { AccountsBreakdownCard } from '@/components/AccountsBreakdownCard';

// Responsive Tooltips
const AreaFlowTooltip = ({ active, payload, label, formatCurrency, type }) => {
    if (active && payload && payload.length) {
        const rawDate = payload[0]?.payload?.rawDate;
        const val = payload[0]?.value || 0;
        const strokeColor = type === 'income' ? '#10b981' : type === 'expense' ? '#f43f5e' : '#3b82f6';

        return (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 shadow-md text-xs space-y-1">
                <p className="text-zinc-400 font-semibold text-[11px]">
                    {rawDate ? `Date: ${rawDate}` : label}
                </p>
                <p className="font-bold text-xs" style={{ color: strokeColor }}>
                    {type === 'all' ? 'Net: ' : 'Amount: '}
                    {formatCurrency(val)}
                </p>
            </div>
        );
    }
    return null;
};

const BarComparisonTooltip = ({ active, payload, label, formatCurrency, subtext }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 shadow-md text-xs space-y-1">
                <p className="text-zinc-300 font-bold border-b border-zinc-800 pb-1 text-[11px]">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 font-semibold text-[11px]" style={{ color: entry.fill }}>
                        <span>{entry.name}:</span>
                        <span>{formatCurrency(entry.value)}</span>
                    </div>
                ))}
                {subtext && (
                    <p className="text-[10px] text-zinc-500 italic pt-1 border-t border-zinc-800">
                        {subtext}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

export default function AnalysisIndex({ 
    auth, 
    accounts = [], 
    kpis = {}, 
    trendData = [], 
    monthlyComparisonData = [], 
    yearlyComparisonData = [],
    categoryData = [], 
    calendar = {}, 
    filters = {}, 
    categories = [] 
}) {
    // Active applied filters
    const [type, setType] = useState(filters.type || 'expense');
    const [accountId, setAccountId] = useState(filters.account_id || 'all');
    const [range, setRange] = useState(filters.range || 'monthly');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [calendarMonth, setCalendarMonth] = useState(filters.calendar_month || new Date().toISOString().slice(0, 7));

    // Temporary pending state inside the drawer sheet
    const [tempType, setTempType] = useState(type);
    const [tempAccountId, setTempAccountId] = useState(accountId);
    const [tempRange, setTempRange] = useState(range);
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);

    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [selectedDayObj, setSelectedDayObj] = useState(null);
    const [isChartLoading, setIsChartLoading] = useState(false);

    // Dynamic Mobile Detection State
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (filters.range) setRange(filters.range);
        if (filters.calendar_month) setCalendarMonth(filters.calendar_month);
    }, [filters.range, filters.calendar_month]);

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const formatCompactCurrency = (val) => {
        if (!val || val === 0) return '';
        if (val >= 1000) {
            return `₱${(val / 1000).toFixed(0)}k`;
        }
        return `₱${Math.round(val)}`;
    };

    // Sync temp states whenever the sheet opens
    const handleSheetOpenChange = (open) => {
        if (open) {
            setTempType(type);
            setTempAccountId(accountId);
            setTempRange(range);
            setTempStartDate(startDate);
            setTempEndDate(endDate);
        }
        setIsFilterSheetOpen(open);
    };

    const applyFilters = (overrides = {}) => {
        setIsChartLoading(true);

        const query = {
            range: overrides.range !== undefined ? overrides.range : range,
            type: overrides.type !== undefined ? overrides.type : type,
            account_id: overrides.account_id !== undefined ? overrides.account_id : accountId,
            start_date: overrides.start_date !== undefined ? overrides.start_date : startDate,
            end_date: overrides.end_date !== undefined ? overrides.end_date : endDate,
            calendar_month: overrides.calendar_month !== undefined ? overrides.calendar_month : calendarMonth,
        };

        router.get(route('analysis.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setIsChartLoading(false),
        });
    };

    const handleApplyAllFilters = () => {
        setIsChartLoading(true);

        setType(tempType);
        setAccountId(tempAccountId);
        setRange(tempRange);
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);

        const query = {
            type: tempType,
            account_id: tempAccountId,
            range: tempRange,
            start_date: tempStartDate,
            end_date: tempEndDate,
            calendar_month: calendarMonth,
        };

        router.get(route('analysis.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => {
                setIsChartLoading(false);
                setIsFilterSheetOpen(false);
            },
        });
    };

    const handleResetFilters = () => {
        setTempType('expense');
        setTempAccountId('all');
        setTempRange('monthly');
        setTempStartDate('');
        setTempEndDate('');

        setType('expense');
        setAccountId('all');
        setRange('monthly');
        setStartDate('');
        setEndDate('');

        router.get(route('analysis.index'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const hasActiveFilters = Boolean(
        type !== 'expense' || 
        accountId !== 'all' || 
        range !== 'monthly'
    );

    const activeFilterCount = [
        type !== 'expense',
        accountId !== 'all',
        range !== 'monthly'
    ].filter(Boolean).length;

    // Drill down from Monthly view to Daily view
    const handleMonthBarClick = (data) => {
        const targetMonth = data?.rawMonth || data?.payload?.rawMonth;
        if (targetMonth) {
            setIsChartLoading(true);

            router.get(route('analysis.index'), {
                range: 'this_month',
                calendar_month: targetMonth,
                type: type,
                account_id: accountId,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsChartLoading(false),
            });
        }
    };

    // Drill down from Yearly view to Monthly view for that year
    const handleYearBarClick = (data) => {
        const targetYear = data?.rawYear || data?.payload?.rawYear;
        if (targetYear) {
            setIsChartLoading(true);

            router.get(route('analysis.index'), {
                range: 'monthly',
                year: targetYear,
                type: type,
                account_id: accountId,
            }, {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsChartLoading(false),
            });
        }
    };

    const handlePrevMonth = () => {
        const [year, month] = (calendar.month || calendarMonth).split('-').map(Number);
        const prevDate = new Date(year, month - 2, 1);
        const formatted = prevDate.toISOString().slice(0, 7);
        setCalendarMonth(formatted);
        applyFilters({ calendar_month: formatted });
    };

    const handleNextMonth = () => {
        const [year, month] = (calendar.month || calendarMonth).split('-').map(Number);
        const nextDate = new Date(year, month, 1);
        const formatted = nextDate.toISOString().slice(0, 7);
        setCalendarMonth(formatted);
        applyFilters({ calendar_month: formatted });
    };

    const handleMonthSelect = (e) => {
        const val = e.target.value;
        setCalendarMonth(val);
        applyFilters({ calendar_month: val });
    };

    const incomeVal = kpis?.totalIncome || 0;
    const expenseVal = kpis?.totalExpense || 0;
    const totalFlow = incomeVal + expenseVal;

    const incomeVsExpenseData = [
        { name: 'Income', value: incomeVal, color: '#10b981' },
        { name: 'Expense', value: expenseVal, color: '#f43f5e' },
    ];

    // Dynamic Daily Average Color Logic
    const getDailyAverageColorClass = () => {
        if (type === 'expense') return 'text-rose-500';
        if (type === 'income') return 'text-emerald-500';
        return 'text-zinc-200';
    };

    return (
        <AppLayout title="Financial Analysis" headerTitle="Visual Analytics">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 text-zinc-100">
                        <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Visual Analytics
                    </h2>
                    <p className="text-xs sm:text-sm text-zinc-400">
                        Track cash velocity, daily spending activity, and category distribution.
                    </p>
                </div>

                {/* Filter Sheet Trigger */}
                <Sheet open={isFilterSheetOpen} onOpenChange={handleSheetOpenChange}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="relative w-full sm:w-auto gap-2 border-zinc-800 text-zinc-300">
                            <Filter className="h-4 w-4" />
                            <span>Filter</span>
                            {activeFilterCount > 0 && (
                                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="right" className="w-full sm:max-w-md border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col justify-between">
                        <div>
                            <SheetHeader className="pb-4 border-b border-zinc-800">
                                <SheetTitle className="text-zinc-100 flex items-center gap-2">
                                    <Filter className="h-4 w-4 text-zinc-400" /> Filter Analysis
                                </SheetTitle>
                                <SheetDescription className="text-zinc-400 text-xs">
                                    Adjust flow type, selected account, and time horizons.
                                </SheetDescription>
                            </SheetHeader>

                            <div className="py-6 space-y-5">
                                {/* Flow Type Filter */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Flow Type</label>
                                    <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                                        {[
                                            { label: 'All Flow', value: 'all' },
                                            { label: 'Expenses', value: 'expense' },
                                            { label: 'Income', value: 'income' },
                                        ].map((pill) => (
                                            <button
                                                key={pill.value}
                                                type="button"
                                                onClick={() => setTempType(pill.value)}
                                                className={`w-full py-1.5 rounded-md font-medium text-xs text-center transition-all whitespace-nowrap ${
                                                    tempType === pill.value
                                                        ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                                                        : 'text-zinc-400 hover:text-zinc-200'
                                                }`}
                                            >
                                                {pill.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Account Selector */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Account</label>
                                    <Select value={tempAccountId} onValueChange={setTempAccountId}>
                                        <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300 bg-zinc-900">
                                            <Wallet className="mr-2 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                            <SelectValue placeholder="All Accounts" />
                                        </SelectTrigger>
                                        <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-300 max-h-60">
                                            <SelectItem value="all">All Accounts</SelectItem>
                                            {accounts.map((acc) => (
                                                <SelectItem key={acc.id} value={String(acc.id)}>
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Time Horizon Selector */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-zinc-400">Time Horizon</label>
                                    <Select value={tempRange} onValueChange={setTempRange}>
                                        <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300 bg-zinc-900">
                                            <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                            <SelectGroup>
                                                <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-2 py-1">
                                                    Aggregated Comparisons
                                                </SelectLabel>
                                                <SelectItem value="monthly">Monthly</SelectItem>
                                                <SelectItem value="yearly">Yearly</SelectItem>
                                            </SelectGroup>

                                            <SelectSeparator className="bg-zinc-800 my-1" />

                                            <SelectGroup>
                                                <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-2 py-1">
                                                    Time Horizons
                                                </SelectLabel>
                                                <SelectItem value="this_month">This Month</SelectItem>
                                                <SelectItem value="1_week">1 Week</SelectItem>
                                                <SelectItem value="6_months">6 Months</SelectItem>
                                                <SelectItem value="this_year">This Year</SelectItem>
                                                <SelectItem value="custom">Custom Range</SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Custom Date Range */}
                                {tempRange === 'custom' && (
                                    <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                                        <label className="text-xs font-medium text-zinc-400">Custom Date Range</label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="date"
                                                value={tempStartDate}
                                                onChange={(e) => setTempStartDate(e.target.value)}
                                                className="h-9 border-zinc-800 text-zinc-300 text-xs bg-zinc-900"
                                            />
                                            <span className="text-xs text-zinc-400">to</span>
                                            <Input
                                                type="date"
                                                value={tempEndDate}
                                                onChange={(e) => setTempEndDate(e.target.value)}
                                                className="h-9 border-zinc-800 text-zinc-300 text-xs bg-zinc-900"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <SheetFooter className="pt-4 border-t border-zinc-800 flex flex-row items-center justify-between gap-2">
                            {hasActiveFilters ? (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={handleResetFilters}
                                    className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 gap-1 h-9"
                                >
                                    <X className="h-3.5 w-3.5" /> Reset Filters
                                </Button>
                            ) : <div />}

                            <Button onClick={handleApplyAllFilters} className="h-9 px-6">
                                Apply Filters
                            </Button>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Active Filter Bar with Sub-Header */}
            {hasActiveFilters && (
                <div className="space-y-1.5 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
                    <div className="flex items-center justify-between text-[11px] sm:text-xs">
                        <span className="text-zinc-400 font-medium">
                            Active Filters ({activeFilterCount})
                        </span>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleResetFilters}
                            className="text-[11px] sm:text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 h-5 px-1.5 -mr-1"
                        >
                            Clear All
                        </Button>
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-0.5">
                        {type !== 'expense' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs capitalize shrink-0">
                                <span>Type: {type}</span>
                                <X className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" onClick={() => { setType('expense'); applyFilters({ type: 'expense' }); }} />
                            </span>
                        )}

                        {accountId !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs shrink-0 max-w-[130px]">
                                <span className="truncate">{accounts.find(a => String(a.id) === String(accountId))?.name || 'Account'}</span>
                                <X className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" onClick={() => { setAccountId('all'); applyFilters({ account_id: 'all' }); }} />
                            </span>
                        )}

                        {range !== 'monthly' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs shrink-0">
                                <span>
                                    {range === 'custom' && startDate && endDate
                                        ? `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}`
                                        : range.replace(/_/g, ' ')}
                                </span>
                                <X 
                                    className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" 
                                    onClick={() => { 
                                        setRange('monthly'); 
                                        setStartDate(''); 
                                        setEndDate(''); 
                                        applyFilters({ range: 'monthly', start_date: '', end_date: '' }); 
                                    }} 
                                />
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* KPI Summary Tiles */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-zinc-800 flex flex-col justify-between">
                    <CardHeader className="pb-1 pt-3 px-4 flex flex-row items-center justify-between space-y-0">
                        <CardTitle className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Income vs. Expense
                        </CardTitle>
                        <PieIcon className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent className="px-4 pb-3 pt-1">
                        {totalFlow > 0 ? (
                            <div className="flex items-center justify-between gap-2">
                                <div className="h-[75px] w-[75px] shrink-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={incomeVsExpenseData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={22}
                                                outerRadius={35}
                                                paddingAngle={3}
                                                dataKey="value"
                                            >
                                                {incomeVsExpenseData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="flex flex-col justify-center gap-1 flex-1 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1 text-zinc-400 font-medium text-[11px]">
                                            <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" /> Income
                                        </span>
                                        <span className="font-bold text-emerald-500 text-xs">
                                            {formatCurrency(incomeVal)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-1 text-zinc-400 font-medium text-[11px]">
                                            <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" /> Expense
                                        </span>
                                        <span className="font-bold text-rose-500 text-xs">
                                            {formatCurrency(expenseVal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-[75px] text-zinc-400 text-xs">
                                No flow recorded.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-zinc-400">Daily Average ({type})</CardTitle>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl sm:text-2xl font-bold ${getDailyAverageColorClass()}`}>
                            {formatCurrency(kpis?.dailyAverage)}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">Across {kpis?.totalDays} days</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-zinc-400">Peak Activity Day</CardTitle>
                        <CalendarIcon className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl sm:text-2xl font-bold text-zinc-200">{formatCurrency(kpis?.peakAmount)}</div>
                        <p className="text-[11px] text-zinc-400 mt-1 truncate">
                            {kpis?.peakDate ? `Peak on ${kpis.peakDate}` : 'No activity'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs sm:text-sm font-medium text-zinc-400">Net Cash Flow</CardTitle>
                        <DollarSign className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl sm:text-2xl font-bold ${kpis?.netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatCurrency(kpis?.netCashFlow)}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-1">Income - Expenses</p>
                    </CardContent>
                </Card>
            </div>

            {/* CONDITIONAL MAIN SECTION */}
            <div className="relative">
                {isChartLoading && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-xs z-20 flex flex-col items-center justify-center rounded-xl border border-zinc-800 transition-all">
                        <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-lg shadow-lg">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            <span className="text-xs font-medium text-zinc-300">Fetching trajectory data...</span>
                        </div>
                    </div>
                )}

                {range === 'monthly' ? (
                    <Card className="border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm sm:text-base font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-zinc-200">
                                <span className="flex items-center gap-2">
                                    <Columns3 className="h-4 w-4 text-primary" /> Monthly Cash Flow Comparison
                                </span>
                                <span className="text-[10px] sm:text-xs font-normal text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded-md border border-zinc-700/80 self-start sm:self-auto">
                                    💡 Tap bar to view daily details
                                </span>
                            </CardTitle>
                            <CardDescription className="text-xs text-zinc-400">
                                Comparing monthly income vs. monthly expense.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-2 sm:px-6 pt-2">
                            <div className="h-[240px] sm:h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart 
                                        data={monthlyComparisonData} 
                                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                        <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                                        <YAxis 
                                            tick={{ fontSize: 10 }} 
                                            tickLine={false}
                                            tickFormatter={(v) => `₱${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                                        />
                                        <Tooltip content={<BarComparisonTooltip formatCurrency={formatCurrency} subtext="Click bar to view daily breakdown & calendar" />} />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                        
                                        {/* Dynamically stacked on mobile, side-by-side on desktop */}
                                        <Bar 
                                            dataKey="Income" 
                                            stackId={isMobile ? "a" : undefined}
                                            fill="#10b981" 
                                            radius={isMobile ? [0, 0, 4, 4] : [4, 4, 0, 0]} 
                                            onClick={(data) => handleMonthBarClick(data)}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                        >
                                            {monthlyComparisonData.map((entry, index) => (
                                                <Cell key={`income-cell-${index}`} className="cursor-pointer" />
                                            ))}
                                        </Bar>
                                        <Bar 
                                            dataKey="Expense" 
                                            stackId={isMobile ? "a" : undefined}
                                            fill="#f43f5e" 
                                            radius={[4, 4, 0, 0]} 
                                            onClick={(data) => handleMonthBarClick(data)}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                        >
                                            {monthlyComparisonData.map((entry, index) => (
                                                <Cell key={`expense-cell-${index}`} className="cursor-pointer" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                ) : range === 'yearly' ? (
                    <Card className="border-zinc-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm sm:text-base font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-zinc-200">
                                <span className="flex items-center gap-2">
                                    <CalendarDays className="h-4 w-4 text-primary" /> Yearly Cash Flow Comparison
                                </span>
                                <span className="text-[10px] sm:text-xs font-normal text-zinc-400 bg-zinc-800/80 px-2 py-1 rounded-md border border-zinc-700/80 self-start sm:self-auto">
                                    💡 Tap year bar to drill down into monthly breakdown
                                </span>
                            </CardTitle>
                            <CardDescription className="text-xs text-zinc-400">
                                Multi-year cash flow comparison across recorded history.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-2 sm:px-6 pt-2">
                            <div className="h-[240px] sm:h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart 
                                        data={yearlyComparisonData} 
                                        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                        <XAxis dataKey="year" tick={{ fontSize: 10 }} tickLine={false} />
                                        <YAxis 
                                            tick={{ fontSize: 10 }} 
                                            tickLine={false}
                                            tickFormatter={(v) => `₱${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                                        />
                                        <Tooltip content={<BarComparisonTooltip formatCurrency={formatCurrency} subtext="Click bar to drill down into monthly comparison" />} />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                        
                                        {/* Dynamically stacked on mobile, side-by-side on desktop */}
                                        <Bar 
                                            dataKey="Income" 
                                            stackId={isMobile ? "a" : undefined}
                                            fill="#10b981" 
                                            radius={isMobile ? [0, 0, 4, 4] : [4, 4, 0, 0]} 
                                            onClick={(data) => handleYearBarClick(data)}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                        >
                                            {yearlyComparisonData.map((entry, index) => (
                                                <Cell key={`yr-income-cell-${index}`} className="cursor-pointer" />
                                            ))}
                                        </Bar>
                                        <Bar 
                                            dataKey="Expense" 
                                            stackId={isMobile ? "a" : undefined}
                                            fill="#f43f5e" 
                                            radius={[4, 4, 0, 0]} 
                                            onClick={(data) => handleYearBarClick(data)}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                        >
                                            {yearlyComparisonData.map((entry, index) => (
                                                <Cell key={`yr-expense-cell-${index}`} className="cursor-pointer" />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                        <Card className="border-zinc-800 lg:col-span-2 flex flex-col justify-between">
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
                                <div>
                                    <CardTitle className="text-sm sm:text-base font-semibold flex items-center gap-2 text-zinc-200">
                                        <TrendingUp className="h-4 w-4 text-primary" /> Cash Flow Trajectory
                                    </CardTitle>
                                    <CardDescription className="text-xs text-zinc-400">Daily movement for selected horizon.</CardDescription>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setRange('monthly');
                                        applyFilters({ range: 'monthly' });
                                    }}
                                    className="h-8 border-zinc-800 text-xs text-zinc-300 gap-1.5 self-start sm:self-auto"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Monthly Overview
                                </Button>
                            </CardHeader>
                            <CardContent className="px-2 sm:px-6 pt-2">
                                <div className="h-[220px] sm:h-[280px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="flowGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop 
                                                        offset="5%" 
                                                        stopColor={type === 'income' ? '#10b981' : type === 'expense' ? '#f43f5e' : '#3b82f6'} 
                                                        stopOpacity={0.4}
                                                    />
                                                    <stop 
                                                        offset="95%" 
                                                        stopColor={type === 'income' ? '#10b981' : type === 'expense' ? '#f43f5e' : '#3b82f6'} 
                                                        stopOpacity={0.0}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
                                            <YAxis 
                                                tick={{ fontSize: 10 }} 
                                                tickLine={false}
                                                tickFormatter={(v) => `₱${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                                            />
                                            <Tooltip content={<AreaFlowTooltip formatCurrency={formatCurrency} type={type} />} />
                                            <Area 
                                                type="monotone" 
                                                dataKey={type === 'all' ? 'Net' : 'Amount'} 
                                                stroke={type === 'income' ? '#10b981' : type === 'expense' ? '#f43f5e' : '#3b82f6'} 
                                                strokeWidth={2}
                                                fillOpacity={1} 
                                                fill="url(#flowGradient)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-800 flex flex-col justify-between">
                            <CardHeader className="pb-3 px-3 sm:px-6">
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <CardTitle className="text-sm sm:text-base font-semibold text-zinc-200">
                                        Daily Activity
                                    </CardTitle>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button 
                                            variant="outline" 
                                            size="icon-sm" 
                                            className="h-7 w-7 border-zinc-800 text-zinc-300" 
                                            onClick={handlePrevMonth}
                                            title="Previous Month"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5" />
                                        </Button>

                                        <Input 
                                            type="month"
                                            value={calendar.month || calendarMonth}
                                            onChange={handleMonthSelect}
                                            className="h-7 text-xs w-[110px] sm:w-[120px] px-1.5 border-zinc-800 text-zinc-300 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200 cursor-pointer"
                                        />

                                        <Button 
                                            variant="outline" 
                                            size="icon-sm" 
                                            className="h-7 w-7 border-zinc-800 text-zinc-300" 
                                            onClick={handleNextMonth}
                                            title="Next Month"
                                        >
                                            <ChevronRight className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <CardDescription className="text-xs text-zinc-400">
                                    Tap any day to view transactions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-2 sm:px-6">
                                <div className="grid grid-cols-7 gap-0.5 sm:gap-1 text-center">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                        <div key={day} className="text-[10px] sm:text-[11px] font-medium text-zinc-400 py-1">
                                            {day}
                                        </div>
                                    ))}
                                    {calendar.days?.map((dayObj, idx) => (
                                        <div key={idx} className="aspect-square flex items-center justify-center p-0.5">
                                            {dayObj ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedDayObj(dayObj)}
                                                    title={`${dayObj.date} | Income: ${formatCurrency(dayObj.income)} | Expense: ${formatCurrency(dayObj.expense)}`}
                                                    className={`w-full h-full rounded-md flex flex-col items-center justify-between p-0.5 sm:p-1 transition-all border border-zinc-800/60 cursor-pointer ${
                                                        dayObj.isToday 
                                                            ? 'ring-1 sm:ring-2 ring-primary ring-offset-1 border-primary bg-primary/5' 
                                                            : 'bg-card hover:bg-muted/80'
                                                    }`}
                                                >
                                                    <span className="text-[9px] sm:text-[10px] font-semibold text-zinc-400 self-start leading-none">
                                                        {dayObj.dayNumber}
                                                    </span>

                                                    <div className="flex flex-col w-full text-[8px] sm:text-[9px] leading-tight font-medium overflow-hidden">
                                                        {dayObj.income > 0 && (
                                                            <span className="text-emerald-500 truncate font-semibold">
                                                                +{formatCompactCurrency(dayObj.income)}
                                                            </span>
                                                        )}
                                                        {dayObj.expense > 0 && (
                                                            <span className="text-rose-500 truncate font-semibold">
                                                                -{formatCompactCurrency(dayObj.expense)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </button>
                                            ) : (
                                                <div className="w-full h-full rounded-md bg-transparent" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Bottom Section: Side-by-Side Distribution Cards */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                <ExpenseCategoryCard 
                    categoryData={categoryData} 
                    accounts={accounts}
                />

                <AccountsBreakdownCard 
                    accounts={accounts} 
                    categories={categories}
                />
            </div>

            <DateTransactionsDialog
                open={!!selectedDayObj}
                onOpenChange={(open) => !open && setSelectedDayObj(null)}
                dayData={selectedDayObj}
            />
        </AppLayout>
    );
}