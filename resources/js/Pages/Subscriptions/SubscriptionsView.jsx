import { useState } from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { CreateRecurringDialog } from '@/Pages/Subscriptions/Components/CreateRecurringDialog';
import { PayInstanceDialog } from '@/Pages/Subscriptions/Components/PayInstanceDialog';

// Local Component Imports
import { SubscriptionHeader } from './Components/SubscriptionHeader';
import { SubscriptionKpiCards } from './Components/SubscriptionKpiCards';
import { ActiveFiltersBar } from './Components/ActiveFiltersBar';
import { FilterSheet } from './Components/FilterSheet';
import { UpcomingDuesTab } from './Components/UpcomingDuesTab';
import { MissedPaymentsTab } from './Components/MissedPaymentsTab';
import { MasterRulesTab } from './Components/MasterRulesTab';

const ITEMS_PER_PAGE = 5;

export default function SubscriptionsView({ 
    recurringTransactions = [], 
    pendingInstances = [],
    accounts = [], 
    categories = [] 
}) {
    // Filter States
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState('current_month'); // 'current_month' | '30_days' | 'all' | 'custom'
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    
    // UI Dialog & Sheet States
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [payingInstance, setPayingInstance] = useState(null);

    // Pagination States
    const [missedPage, setMissedPage] = useState(1);
    const [upcomingPage, setUpcomingPage] = useState(1);
    const [rulesPage, setRulesPage] = useState(1);

    const recurringList = Array.isArray(recurringTransactions) 
        ? recurringTransactions 
        : (recurringTransactions?.data || []);

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const handleResetFilters = () => {
        setFilterType('all');
        setFilterStatus('all');
        setDateFilter('current_month');
        setCustomStartDate('');
        setCustomEndDate('');
        setMissedPage(1);
        setUpcomingPage(1);
        setRulesPage(1);
    };

    // 1. Filter Overdue Payments
    const overdueInstances = pendingInstances.filter((item) => {
        if (!item.is_overdue) return false;
        if (filterType === 'expense' && item.type !== 'expense') return false;
        if (filterType === 'income' && item.type !== 'income') return false;
        return true;
    });

    // 2. Filter Upcoming Dues
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const upcomingInstances = pendingInstances.filter((item) => {
        if (item.is_overdue) return false;
        if (filterType === 'expense' && item.type !== 'expense') return false;
        if (filterType === 'income' && item.type !== 'income') return false;

        if (dateFilter === 'current_month') {
            const itemDate = new Date(item.due_date);
            return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
        }

        if (dateFilter === 'custom') {
            const itemDate = item.due_date;
            if (customStartDate && itemDate < customStartDate) return false;
            if (customEndDate && itemDate > customEndDate) return false;
            return true;
        }

        return true; // '30_days' or 'all'
    });

    // 3. Filter Master Rules
    const filteredRules = recurringList.filter((item) => {
        if (filterType === 'expense' && item.type !== 'expense') return false;
        if (filterType === 'income' && item.type !== 'income') return false;
        if (filterStatus === 'all' && !item.is_active) return false;
    if (filterStatus === 'active' && !item.is_active) return false;
    if (filterStatus === 'paused' && item.is_active) return false;
        return true;
    });

    // Pagination Calculation
    const totalMissedPages = Math.ceil(overdueInstances.length / ITEMS_PER_PAGE) || 1;
    const paginatedMissed = overdueInstances.slice((missedPage - 1) * ITEMS_PER_PAGE, missedPage * ITEMS_PER_PAGE);

    const totalUpcomingPages = Math.ceil(upcomingInstances.length / ITEMS_PER_PAGE) || 1;
    const paginatedUpcoming = upcomingInstances.slice((upcomingPage - 1) * ITEMS_PER_PAGE, upcomingPage * ITEMS_PER_PAGE);

    const totalRulesPages = Math.ceil(filteredRules.length / ITEMS_PER_PAGE) || 1;
    const paginatedRules = filteredRules.slice((rulesPage - 1) * ITEMS_PER_PAGE, rulesPage * ITEMS_PER_PAGE);

    const hasActiveFilters = Boolean(
        filterType !== 'all' || 
        filterStatus !== 'all' || 
        dateFilter !== 'current_month' ||
        customStartDate !== '' ||
        customEndDate !== ''
    );

    const activeFilterCount = [
        filterType !== 'all',
        filterStatus !== 'all',
        dateFilter !== 'current_month' || customStartDate !== '' || customEndDate !== ''
    ].filter(Boolean).length;

    // Route Actions
    const handleSkipInstance = (item) => {
        router.post(route('recurring.skip', item.rule_id), { due_date: item.due_date }, {
            preserveScroll: true,
            onSuccess: () => toast.info(`Skipped instance for ${item.due_date}`),
        });
    };

    const handleToggleActive = (item) => {
        router.patch(route('recurring.toggle', item.id), {}, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Rule ${item.is_active ? 'paused' : 'activated'}.`),
        });
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('recurring.destroy', deletingItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Rule "${deletingItem.title}" deleted.`);
                setDeletingItem(null);
            },
        });
    };

    // KPI Calculations
    // KPI Calculations based on active timeframe
const totalMonthlyExpenses = upcomingInstances
    .filter((item) => item.type === 'expense')
    .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);

const totalMonthlyIncome = upcomingInstances
    .filter((item) => item.type === 'income')
    .reduce((acc, item) => acc + (Number(item.amount) || 0), 0);
    return (
        <AppLayout title="Recurring & Subscriptions" headerTitle="Recurring & Subscriptions">
            <div className="w-full space-y-6">
                {/* 1. Page Header */}
                <SubscriptionHeader 
                    activeFilterCount={activeFilterCount}
                    onOpenFilter={() => setIsFilterSheetOpen(true)}
                    onOpenCreate={() => { setEditingItem(null); setIsCreateOpen(true); }}
                />

                {/* 2. Top Summary KPI Cards */}
                <SubscriptionKpiCards 
                    totalMonthlyExpenses={totalMonthlyExpenses}
                    totalMonthlyIncome={totalMonthlyIncome}
                    formatCurrency={formatCurrency}
                />

                {/* 3. Active Filters Badge Indicator Bar */}
                <ActiveFiltersBar 
                    hasActiveFilters={hasActiveFilters}
                    activeFilterCount={activeFilterCount}
                    dateFilter={dateFilter}
                    customStartDate={customStartDate}
                    customEndDate={customEndDate}
                    filterType={filterType}
                    filterStatus={filterStatus}
                    setDateFilter={setDateFilter}
                    setFilterType={setFilterType}
                    setFilterStatus={setFilterStatus}
                    handleResetFilters={handleResetFilters}
                    resetPages={{ setMissedPage, setUpcomingPage, setRulesPage }}
                />

                {/* 4. Main Navigation Tabs */}
                <Tabs defaultValue="schedule" className="w-full flex flex-col space-y-4">
                    <div className="w-full">
                        <TabsList className="bg-zinc-900 border border-zinc-800 text-zinc-400 h-9 p-1 grid grid-cols-3 w-full">
                            <TabsTrigger 
                                value="schedule" 
                                className="text-xs px-4 h-7 w-full data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
                            >
                                Upcoming
                            </TabsTrigger>
                            <TabsTrigger 
                                value="missed" 
                                className="text-xs px-4 h-7 w-full gap-1.5 data-[state=active]:bg-zinc-800 data-[state=active]:text-rose-400"
                            >
                                Missed
                                {overdueInstances.length > 0 && (
                                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500/20 px-1 text-[10px] font-bold text-rose-400 border border-rose-500/30">
                                        {overdueInstances.length}
                                    </span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger 
                                value="rules" 
                                className="text-xs px-4 h-7 w-full data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100"
                            >
                                Recurring ({filteredRules.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab 1: Upcoming Dues Schedule */}
                    <TabsContent value="schedule" className="w-full space-y-6 mt-0">
                        <UpcomingDuesTab 
                            dateFilter={dateFilter}
                            upcomingInstances={upcomingInstances}
                            paginatedUpcoming={paginatedUpcoming}
                            upcomingPage={upcomingPage}
                            setUpcomingPage={setUpcomingPage}
                            totalUpcomingPages={totalUpcomingPages}
                            itemsPerPage={ITEMS_PER_PAGE}
                            formatCurrency={formatCurrency}
                            setPayingInstance={setPayingInstance}
                            handleSkipInstance={handleSkipInstance}
                        />
                    </TabsContent>

                    {/* Tab 2: Missed & Overdue Payments */}
                    <TabsContent value="missed" className="w-full space-y-6 mt-0">
                        <MissedPaymentsTab 
                            overdueInstances={overdueInstances}
                            paginatedMissed={paginatedMissed}
                            missedPage={missedPage}
                            setMissedPage={setMissedPage}
                            totalMissedPages={totalMissedPages}
                            itemsPerPage={ITEMS_PER_PAGE}
                            formatCurrency={formatCurrency}
                            setPayingInstance={setPayingInstance}
                            handleSkipInstance={handleSkipInstance}
                        />
                    </TabsContent>

                    {/* Tab 3: Master Schedule Rules */}
                    <TabsContent value="rules" className="w-full mt-0">
                        <MasterRulesTab 
    filteredRules={filteredRules}
    paginatedRules={paginatedRules}
    rulesPage={rulesPage}
    setRulesPage={setRulesPage}
    totalRulesPages={totalRulesPages}
    itemsPerPage={ITEMS_PER_PAGE}
    formatCurrency={formatCurrency}
    setEditingItem={setEditingItem}
    setIsCreateOpen={setIsCreateOpen}
    handleToggleActive={handleToggleActive}
    setDeletingItem={setDeletingItem}
    filterStatus={filterStatus}
    setFilterStatus={setFilterStatus}
/>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Filter Sheet Modal */}
            <FilterSheet 
                open={isFilterSheetOpen}
                onOpenChange={setIsFilterSheetOpen}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                customStartDate={customStartDate}
                setCustomStartDate={setCustomStartDate}
                customEndDate={customEndDate}
                setCustomEndDate={setCustomEndDate}
                filterType={filterType}
                setFilterType={setFilterType}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                hasActiveFilters={hasActiveFilters}
                handleResetFilters={handleResetFilters}
                resetPages={{ setMissedPage, setUpcomingPage, setRulesPage }}
            />

            {/* Dialogs & Action Modals */}
            <CreateRecurringDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                editingItem={editingItem}
                accounts={accounts}
                categories={categories}
            />

            <PayInstanceDialog
    open={!!payingInstance}
    onOpenChange={() => setPayingInstance(null)}
    instance={payingInstance}
    accounts={accounts}
    categories={categories}
    isAccountLocked={true}
    isAmountLocked={true}
    isCategoryLocked={true}
/>

            <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
                <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Recurring Rule?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400 text-xs">
                            Are you sure you want to delete <strong>{deletingItem?.title}</strong>? Existing logged transactions will remain untouched.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                        <AlertDialogCancel className="border-zinc-800 text-zinc-300 w-full sm:w-auto text-xs h-9">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white w-full sm:w-auto text-xs h-9">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}