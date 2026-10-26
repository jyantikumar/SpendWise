import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    BarChart,
    Bar,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    Cell 
} from 'recharts';
import { TrendingUp, ChevronLeft, ChevronRight, Columns3, CalendarDays, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Tooltips
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

export function AnalysisChartSection({
    isChartLoading,
    range,
    monthlyComparisonData,
    yearlyComparisonData,
    trendData,
    calendar,
    calendarMonth,
    isMobile,
    formatCurrency,
    formatCompactCurrency,
    handleMonthBarClick,
    handleYearBarClick,
    setRange,
    applyFilters,
    handlePrevMonth,
    handleNextMonth,
    handleMonthSelect,
    setSelectedDayObj,
    type,
}) {
    return (
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
    );
}