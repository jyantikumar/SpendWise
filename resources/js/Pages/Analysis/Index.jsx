// resources/js/Pages/Analysis/Index.jsx
import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateTransactionsDialog } from '@/Pages/Analysis/components/DateTransactionsDialog';
import ExpensePieChart from '@/Pages/DashboardComponents/ExpensePieChart';
import CategoryTransactionsModal from '@/Pages/Categories/components/CategoryTransactionsModal';
import { AccountsBreakdownCard } from '@/components/AccountsBreakdownCard';

import { AnalysisFilterSheet } from '@/Pages/Analysis/components/AnalysisFilterSheet';
import { AnalysisActiveFiltersBar } from '@/Pages/Analysis/components/AnalysisActiveFiltersBar';
import { AnalysisKpiGrid } from '@/Pages/Analysis/components/AnalysisKpiGrid';
import { AnalysisChartSection } from '@/Pages/Analysis/components/AnalysisChartSection';

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
    const [type, setType] = useState(filters.type || 'all');
    const [accountId, setAccountId] = useState(filters.account_id || 'all');
    const [range, setRange] = useState(filters.range || 'monthly');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [calendarMonth, setCalendarMonth] = useState(filters.calendar_month || new Date().toISOString().slice(0, 7));

    const [tempType, setTempType] = useState(type);
    const [tempAccountId, setTempAccountId] = useState(accountId);
    const [tempRange, setTempRange] = useState(range);
    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);

    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [selectedDayObj, setSelectedDayObj] = useState(null);
    const [isChartLoading, setIsChartLoading] = useState(false);

    const [isMobile, setIsMobile] = useState(false);

    // 👇 NEW: Category transactions modal state
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    // Get user's preferred currency from auth props (defaults to PHP if not set)
    const userCurrency = auth?.user?.currency || 'PHP';

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
        new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(val || 0);

    const formatCompactCurrency = (val) => {
        if (!val || val === 0) return '';
        const symbol = userCurrency === 'PHP' ? '₱' : userCurrency === 'USD' ? '$' : userCurrency === 'EUR' ? '€' : userCurrency;
        if (val >= 1000) {
            return `${symbol}${(val / 1000).toFixed(0)}k`;
        }
        return `${symbol}${Math.round(val)}`;
    };

    const getTimeHorizonLabel = (selectedRange) => {
        if (selectedRange === 'this_month') {
            try {
                const dateObj = new Date(`${calendarMonth}-01`);
                return dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            } catch (e) {
                return 'This Month';
            }
        }

        const rangeLabels = {
            monthly: 'Monthly',
            yearly: 'Yearly',
            '1_week': '1 Week',
            '6_months': '6 Months',
            this_year: 'This Year',
            custom: 'Custom Range',
        };

        return rangeLabels[selectedRange] || 'Select Horizon';
    };

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
        setTempType('all');
        setTempAccountId('all');
        setTempRange('monthly');
        setTempStartDate('');
        setTempEndDate('');

        setType('all');
        setAccountId('all');
        setRange('monthly');
        setStartDate('');
        setEndDate('');

        router.get(route('analysis.index'), {}, { preserveState: true, preserveScroll: true, replace: true });
    };

    const hasActiveFilters = Boolean(
        type !== 'all' || 
        accountId !== 'all' || 
        range !== 'monthly'
    );

    const activeFilterCount = [
        type !== 'all',
        accountId !== 'all',
        range !== 'monthly'
    ].filter(Boolean).length;

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
        const currentVal = calendar.month || calendarMonth;
        const [year, month] = currentVal.split('-').map(Number);
        const prevDate = new Date(year, month - 2, 1); 
        const formatted = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
        
        setCalendarMonth(formatted);
        applyFilters({ calendar_month: formatted });
    };

    const handleNextMonth = () => {
        const currentVal = calendar.month || calendarMonth;
        const [year, month] = currentVal.split('-').map(Number);
        const nextDate = new Date(year, month, 1); 
        const formatted = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
        
        setCalendarMonth(formatted);
        applyFilters({ calendar_month: formatted });
    };

    const handleMonthSelect = (e) => {
        const val = e.target.value;
        setCalendarMonth(val);
        applyFilters({ calendar_month: val });
    };

    // 👇 NEW: derive date boundaries for the category transactions modal
    const getModalDateBoundaries = () => {
        // Prefer explicit custom range from active filters
        if (filters.start_date && filters.end_date) {
            return { startDate: filters.start_date, endDate: filters.end_date };
        }

        const today = new Date();
        const fmt = (d) => d.toISOString().split('T')[0];

        switch (filters.range) {
            case '1_week': {
                const past = new Date();
                past.setDate(today.getDate() - 7);
                return { startDate: fmt(past), endDate: fmt(today) };
            }
            case '6_months': {
                const past = new Date();
                past.setMonth(today.getMonth() - 6);
                return { startDate: fmt(past), endDate: fmt(today) };
            }
            case 'yearly':
            case 'this_year': {
                return { startDate: fmt(new Date(today.getFullYear(), 0, 1)), endDate: fmt(today) };
            }
            case 'this_month': {
                const [y, m] = (filters.calendar_month || calendarMonth).split('-').map(Number);
                const start = new Date(y, m - 1, 1);
                const end = new Date(y, m, 0);
                return { startDate: fmt(start), endDate: fmt(end) };
            }
            case 'monthly':
            default: {
                const start = new Date(today.getFullYear(), today.getMonth(), 1);
                return { startDate: fmt(start), endDate: fmt(today) };
            }
        }
    };

    const { startDate: modalStart, endDate: modalEnd } = getModalDateBoundaries();

    // 👇 NEW: category click handler — opens transactions drill-down modal
    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setIsCategoryModalOpen(true);
    };

    const incomeVal = kpis?.totalIncome || 0;
    const expenseVal = kpis?.totalExpense || 0;
    const totalFlow = incomeVal + expenseVal;

    const incomeVsExpenseData = [
        { name: 'Income', value: incomeVal, color: '#10b981' },
        { name: 'Expense', value: expenseVal, color: '#f43f5e' },
    ];

    return (
        <AppLayout title="Financial Analysis" headerTitle="Visual Analytics">
            <div className="space-y-6">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2 text-zinc-100"></h2>
                        <p className="text-xs sm:text-sm text-zinc-400">
                            Track cash velocity, daily spending activity, and category distribution.
                        </p>
                    </div>

                    <AnalysisFilterSheet 
                        isFilterSheetOpen={isFilterSheetOpen}
                        handleSheetOpenChange={handleSheetOpenChange}
                        activeFilterCount={activeFilterCount}
                        tempType={tempType}
                        setTempType={setTempType}
                        tempAccountId={tempAccountId}
                        setTempAccountId={setTempAccountId}
                        tempRange={tempRange}
                        setTempRange={setTempRange}
                        tempStartDate={tempStartDate}
                        setTempStartDate={setTempStartDate}
                        tempEndDate={tempEndDate}
                        setTempEndDate={setTempEndDate}
                        accounts={accounts}
                        getTimeHorizonLabel={getTimeHorizonLabel}
                        hasActiveFilters={hasActiveFilters}
                        handleResetFilters={handleResetFilters}
                        handleApplyAllFilters={handleApplyAllFilters}
                    />
                </div>

                {/* Active Filter Bar */}
                {hasActiveFilters && (
                    <AnalysisActiveFiltersBar 
                        activeFilterCount={activeFilterCount}
                        handleResetFilters={handleResetFilters}
                        type={type}
                        setType={setType}
                        applyFilters={applyFilters}
                        accountId={accountId}
                        setAccountId={setAccountId}
                        accounts={accounts}
                        range={range}
                        setRange={setRange}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                        calendarMonth={calendarMonth}
                        startDate={startDate}
                        endDate={endDate}
                    />
                )}

                {/* KPI Summary Grid */}
                <AnalysisKpiGrid 
                    kpis={kpis}
                    formatCurrency={formatCurrency}
                    totalFlow={totalFlow}
                    incomeVal={incomeVal}
                    expenseVal={expenseVal}
                    incomeVsExpenseData={incomeVsExpenseData}
                />

                {/* Main Charts & Calendar Section */}
                <AnalysisChartSection 
                    isChartLoading={isChartLoading}
                    range={range}
                    monthlyComparisonData={monthlyComparisonData}
                    yearlyComparisonData={yearlyComparisonData}
                    trendData={trendData}
                    calendar={calendar}
                    calendarMonth={calendarMonth}
                    isMobile={isMobile}
                    formatCurrency={formatCurrency}
                    formatCompactCurrency={formatCompactCurrency}
                    handleMonthBarClick={handleMonthBarClick}
                    handleYearBarClick={handleYearBarClick}
                    setRange={setRange}
                    applyFilters={applyFilters}
                    handlePrevMonth={handlePrevMonth}
                    handleNextMonth={handleNextMonth}
                    handleMonthSelect={handleMonthSelect}
                    setSelectedDayObj={setSelectedDayObj}
                    type={type}
                />

                {/* Bottom Section: Side-by-Side Distribution Cards */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
                    <Card className="border-zinc-800 flex flex-col">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-semibold text-zinc-200">
                                Expense Categories
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <ExpensePieChart 
                                data={categoryData} 
                                formatCurrency={formatCurrency}
                                onCategoryClick={handleCategoryClick}
                            />
                        </CardContent>
                    </Card>

                    <AccountsBreakdownCard 
                        accounts={accounts} 
                        categories={categories}
                        userCurrency={userCurrency}
                    />
                </div>

                <DateTransactionsDialog
                    open={!!selectedDayObj}
                    onOpenChange={(open) => !open && setSelectedDayObj(null)}
                    dayData={selectedDayObj}
                    userCurrency={userCurrency}
                />

                {/* 👇 NEW: Category transactions drill-down modal */}
                <CategoryTransactionsModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    category={selectedCategory}
                    accounts={accounts}
                    initialStartDate={modalStart}
                    initialEndDate={modalEnd}
                    userCurrency={userCurrency}
                />
            </div>
        </AppLayout>
    );
}