import { useState } from 'react';
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
    ChevronRight
} from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { DateTransactionsDialog } from '@/components/DateTransactionsDialog';

// Custom Tooltip for Desktop Bar Chart
const CategoryBarTooltip = ({ active, payload, formatCurrency }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const color = data.color || '#3b82f6';

        return (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 shadow-md text-xs space-y-1">
                <p className="font-semibold" style={{ color }}>
                    {data.name}
                </p>
                <p className="text-zinc-200">
                    <span className="text-zinc-400">Total Expense: </span>
                    <span className="font-semibold text-zinc-100">{formatCurrency(data.total)}</span>
                </p>
            </div>
        );
    }

    return null;
};

// Custom Tooltip for Cash Flow Trajectory Area Chart
const AreaFlowTooltip = ({ active, payload, label, formatCurrency, type }) => {
    if (active && payload && payload.length) {
        const rawDate = payload[0]?.payload?.rawDate;
        const val = payload[0]?.value || 0;
        const strokeColor = type === 'income' ? '#10b981' : type === 'expense' ? '#f43f5e' : '#3b82f6';

        return (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 shadow-md text-xs space-y-1">
                <p className="text-zinc-400 font-semibold">
                    {rawDate ? `Date: ${rawDate} (${label})` : `Date: ${label}`}
                </p>
                <p className="font-bold" style={{ color: strokeColor }}>
                    {type === 'all' ? 'Net Flow: ' : 'Amount: '}
                    {formatCurrency(val)}
                </p>
            </div>
        );
    }

    return null;
};

export default function AnalysisIndex({ auth, accounts = [], kpis = {}, trendData = [], categoryData = [], calendar = {}, filters = {} }) {
    const [range, setRange] = useState(filters.range || 'this_month');
    const [type, setType] = useState(filters.type || 'expense');
    const [accountId, setAccountId] = useState(filters.account_id || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [calendarMonth, setCalendarMonth] = useState(filters.calendar_month || new Date().toISOString().slice(0, 7));

    const [selectedDayObj, setSelectedDayObj] = useState(null);
    const [hoveredPieSlice, setHoveredPieSlice] = useState(null);

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const formatCompactCurrency = (val) => {
        if (!val || val === 0) return '';
        if (val >= 1000) {
            return `₱${(val / 1000).toFixed(1)}k`;
        }
        return `₱${Math.round(val)}`;
    };

    const applyFilters = (overrides = {}) => {
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
        });
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

    const categoryTotalSum = categoryData.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);

    return (
        <TooltipProvider>
            <SidebarProvider>
                <Head title="Financial Analysis - SpendWise" />

                <AppSidebar user={auth.user} />

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-800" />
                        <h1 className="text-lg font-semibold tracking-tight text-zinc-200">Financial Analysis & Insights</h1>
                    </header>

                    <main className="flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-zinc-100">
                                <BarChart3 className="h-6 w-6 text-primary" /> Visual Analytics
                            </h2>
                            <p className="text-sm text-zinc-400">
                                Track cash velocity, daily spending activity, and category distribution.
                            </p>
                        </div>

                        {/* Controls Bar */}
                        <div className="flex flex-wrap items-center gap-3 w-full">
                            <Select 
                                value={type} 
                                onValueChange={(val) => {
                                    setType(val);
                                    applyFilters({ type: val });
                                }}
                            >
                                <SelectTrigger className="w-[180px] h-9 border-zinc-800 text-zinc-300">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800">
                                    <SelectItem value="expense">Expenses</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="all">All Flow</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select 
                                value={accountId} 
                                onValueChange={(val) => {
                                    setAccountId(val);
                                    applyFilters({ account_id: val });
                                }}
                            >
                                <SelectTrigger className="w-[210px] h-9 border-zinc-800 text-zinc-300">
                                    <Wallet className="mr-2 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                    <SelectValue placeholder="All Accounts" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800">
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map((acc) => (
                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select 
                                value={range} 
                                onValueChange={(val) => {
                                    setRange(val);
                                    applyFilters({ range: val });
                                }}
                            >
                                <SelectTrigger className="w-[200px] h-9 border-zinc-800 text-zinc-300">
                                    <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                    <SelectValue placeholder="Range" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800">
                                    <SelectItem value="1_week">1 Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="6_months">6 Months</SelectItem>
                                    <SelectItem value="this_year">This Year</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>

                            {range === 'custom' && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="h-9 w-[140px] text-xs border-zinc-800 text-zinc-300"
                                    />
                                    <span className="text-xs text-zinc-400">to</span>
                                    <Input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="h-9 w-[140px] text-xs border-zinc-800 text-zinc-300"
                                    />
                                    <Button 
                                        size="sm" 
                                        onClick={() => applyFilters({ range: 'custom' })}
                                        className="h-9 px-3 text-xs"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* KPI Summary Tiles */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                                            <div className="h-[80px] w-[80px] shrink-0">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={incomeVsExpenseData}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={24}
                                                            outerRadius={38}
                                                            paddingAngle={3}
                                                            dataKey="value"
                                                        >
                                                            {incomeVsExpenseData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip 
                                                            formatter={(val) => [formatCurrency(val), 'Amount']}
                                                            contentStyle={{ borderRadius: '8px', fontSize: '11px', borderColor: '#27272a', backgroundColor: '#18181b', color: '#f4f4f5' }}
                                                        />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="flex flex-col justify-center gap-1.5 flex-1 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                                                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" /> Income
                                                    </span>
                                                    <span className="font-bold text-emerald-500">
                                                        {formatCurrency(incomeVal)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                                                        <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" /> Expense
                                                    </span>
                                                    <span className="font-bold text-rose-500">
                                                        {formatCurrency(expenseVal)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-[80px] text-zinc-400 text-xs">
                                            No flow recorded for this range.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Daily Average ({type})</CardTitle>
                                    <Zap className="h-4 w-4 text-amber-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-zinc-200">{formatCurrency(kpis?.dailyAverage)}</div>
                                    <p className="text-xs text-zinc-400 mt-1">Mean flow per day across {kpis?.totalDays} days</p>
                                </CardContent>
                            </Card>

                            <Card className="border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Peak Activity Day</CardTitle>
                                    <CalendarIcon className="h-4 w-4 text-zinc-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-zinc-200">{formatCurrency(kpis?.peakAmount)}</div>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        {kpis?.peakDate ? `Highest on ${kpis.peakDate}` : 'No activity recorded'}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Net Cash Flow</CardTitle>
                                    <DollarSign className="h-4 w-4 text-zinc-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${kpis?.netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {formatCurrency(kpis?.netCashFlow)}
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1">Total Income - Total Expenses</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Charts & Calendar Layout */}
                        <div className="grid gap-6 lg:grid-cols-3">
                            <Card className="border-zinc-800 lg:col-span-2 flex flex-col justify-between">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-zinc-200">
                                        <TrendingUp className="h-4 w-4 text-primary" /> Cash Flow Trajectory
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400">Daily movement and aggregate trend for the selected horizon.</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="h-[280px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                                                <YAxis 
                                                    tick={{ fontSize: 11 }} 
                                                    tickLine={false}
                                                    tickFormatter={(v) => `₱${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                                                />
                                                <Tooltip content={<AreaFlowTooltip formatCurrency={formatCurrency} type={type} />} />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey={type === 'all' ? 'Net' : 'Amount'} 
                                                    stroke={type === 'income' ? '#10b981' : type === 'expense' ? '#f43f5e' : '#3b82f6'} 
                                                    strokeWidth={2.5}
                                                    fillOpacity={1} 
                                                    fill="url(#flowGradient)" 
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-zinc-800 flex flex-col justify-between">
                                <CardHeader className="pb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-zinc-200">
                                             Daily Activity
                                        </CardTitle>

                                        <div className="flex items-center gap-1">
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
                                                className="h-7 text-xs w-[125px] px-2 border-zinc-800 text-zinc-300"
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
                                        Click any day to view recorded transactions.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-7 gap-1 text-center">
                                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                                            <div key={day} className="text-[11px] font-medium text-zinc-400 py-1">
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
                                                        className={`w-full h-full rounded-md flex flex-col items-center justify-between p-1 transition-all border border-zinc-800/60 cursor-pointer ${
                                                            dayObj.isToday 
                                                                ? 'ring-2 ring-primary ring-offset-1 border-primary bg-primary/5' 
                                                                : 'bg-card hover:bg-muted/80'
                                                        }`}
                                                    >
                                                        <span className="text-[10px] font-semibold text-zinc-400 self-start leading-none">
                                                            {dayObj.dayNumber}
                                                        </span>

                                                        <div className="flex flex-col w-full text-[9px] leading-tight font-medium overflow-hidden">
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

                            <Card className="border-zinc-800 lg:col-span-3">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold flex items-center gap-2 text-zinc-200">
                                        <PieIcon className="h-4 w-4 text-primary" /> Expense Category Distribution
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400">Top expense categories ranked by spending volume for the filtered duration.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {categoryData.length > 0 ? (
                                        <>
                                            {/* Donut Chart View (Visible on Small Screens) */}
                                            <div className="block md:hidden">
                                                <div className="flex flex-col items-center gap-4">
                                                    <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={categoryData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={55}
                                                                    outerRadius={80}
                                                                    paddingAngle={3}
                                                                    dataKey="total"
                                                                    onMouseEnter={(_, index) => setHoveredPieSlice(categoryData[index])}
                                                                    onMouseLeave={() => setHoveredPieSlice(null)}
                                                                >
                                                                    {categoryData.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} className="cursor-pointer" />
                                                                    ))}
                                                                </Pie>
                                                            </PieChart>
                                                        </ResponsiveContainer>

                                                        {/* Dynamic Interactive Center Label */}
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2 min-w-0">
                                                            <span 
                                                                className="text-[10px] uppercase font-bold tracking-wider truncate max-w-[100px]"
                                                                style={{ color: hoveredPieSlice ? (hoveredPieSlice.color || '#3b82f6') : '#a1a1aa' }}
                                                            >
                                                                {hoveredPieSlice ? hoveredPieSlice.name : 'Total'}
                                                            </span>
                                                            <span className="text-sm font-bold tracking-tight text-zinc-100 truncate max-w-[110px]">
                                                                {formatCurrency(hoveredPieSlice ? hoveredPieSlice.total : categoryTotalSum)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="w-full space-y-2 max-h-[220px] overflow-y-auto pr-1">
                                                        {categoryData.map((item, index) => {
                                                            const val = parseFloat(item.total) || 0;
                                                            const pct = categoryTotalSum > 0 ? ((val / categoryTotalSum) * 100).toFixed(0) : 0;
                                                            const isHovered = hoveredPieSlice?.name === item.name;

                                                            return (
                                                                <div 
                                                                    key={item.name || index} 
                                                                    className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer text-xs ${
                                                                        isHovered 
                                                                            ? 'bg-zinc-800/80 border-zinc-700' 
                                                                            : 'bg-zinc-900/50 border-zinc-800/60 hover:bg-zinc-800/40'
                                                                    }`}
                                                                    onMouseEnter={() => setHoveredPieSlice(item)}
                                                                    onMouseLeave={() => setHoveredPieSlice(null)}
                                                                >
                                                                    <div className="flex items-center gap-2 truncate pr-2">
                                                                        <span className="h-2.5 w-2.5 rounded-full border-none shrink-0" style={{ backgroundColor: item.color || '#3b82f6' }} />
                                                                        <span className="truncate text-zinc-300 font-medium">{item.name}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 shrink-0">
                                                                        <span className="text-zinc-500 text-[11px] font-mono">{pct}%</span>
                                                                        <span className="font-semibold text-zinc-200">{formatCurrency(val)}</span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Bar Chart View (Visible on Medium & Larger Screens) */}
                                            <div className="hidden md:block h-[260px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={categoryData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                                                        <XAxis 
                                                            dataKey="name" 
                                                            tick={{ fontSize: 11 }} 
                                                            tickLine={false}
                                                            interval={0}
                                                        />
                                                        <YAxis 
                                                            tick={{ fontSize: 11 }} 
                                                            tickLine={false}
                                                            tickFormatter={(v) => `₱${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                                                        />
                                                        <Tooltip content={<CategoryBarTooltip formatCurrency={formatCurrency} />} />
                                                        <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                                                            {categoryData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-zinc-400">
                                            <BarChart3 className="h-8 w-8 stroke-1 opacity-50 mb-2" />
                                            <p className="text-sm font-medium">No expense category data available for this range.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </SidebarInset>

                <DateTransactionsDialog
                    open={!!selectedDayObj}
                    onOpenChange={(open) => !open && setSelectedDayObj(null)}
                    dayData={selectedDayObj}
                />
            </SidebarProvider>
        </TooltipProvider>
    );
}