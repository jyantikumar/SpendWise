// resources/js/Pages/Dashboard.jsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { PieChart as PieChartIcon, Wallet, SlidersHorizontal } from 'lucide-react';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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

import DashboardKpis from '@/Pages/DashboardComponents/DashboardKpis';
import CategoryTransactionsModal from '@/Pages/Categories/components/CategoryTransactionsModal';
import AccountTransactionsModal from '@/Pages/Accounts/components/AccountTransactionsModal';
import TransactionFormModal from '@/Pages/Transactions/components/TransactionFormModal';
import { TransactionDetailSheet } from '@/Pages/Transactions/components/TransactionDetailSheet';

import DashboardHeaderControls from './DashboardComponents/DashboardHeaderControls';
import DashboardActivitySection from './DashboardComponents/DashboardActivitySection';
import ExpensePieChart from './DashboardComponents/ExpensePieChart';
import AccountPieChartCard from './DashboardComponents/AccountPieChartCard';
import CashFlowTrendCard from './DashboardComponents/CashFlowTrendCard';
import CustomizeDashboardSheet from './DashboardComponents/CustomizeDashboardSheet';

export default function Dashboard({
    auth,
    kpis,
    dailyTrends = [],
    categoryBreakdown,
    latestTransactions = [],
    accounts = [],
    accountTypes = [],
    categories = [],
    savingsGoals = [],
    currentFilter = 'this_day',
    customDates = {},
    widgets = [],
}) {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [deletingTransaction, setDeletingTransaction] = useState(null);
    const [selectedDetailTransaction, setSelectedDetailTransaction] = useState(null);

    const [chartTab, setChartTab] = useState('expenses');

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    const [customizeOpen, setCustomizeOpen] = useState(false);

    const [startDateInput, setStartDateInput] = useState(customDates.startDate || '');
    const [endDateInput, setEndDateInput] = useState(customDates.endDate || '');

    const userCurrency = auth?.user?.currency || 'PHP';

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(val || 0);

    const formatDateOnly = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };

    // ── Widget helpers ──────────────────────────────────────────
    const visibleKeys = widgets.filter((w) => w.visible).map((w) => w.key);
    const show = (key) => visibleKeys.includes(key);
    const widgetMeta = (key) => widgets.find((w) => w.key === key) || {};

    // ── Filter handlers ─────────────────────────────────────────
    const handleFilterChange = (value) => {
        if (value === 'custom') {
            router.get('/dashboard', {
                range: 'custom',
                start_date: startDateInput,
                end_date: endDateInput,
            }, { preserveState: true });
        } else {
            router.get('/dashboard', { range: value }, { preserveState: true });
        }
    };

    const handleApplyCustomDates = () => {
        if (startDateInput && endDateInput) {
            router.get('/dashboard', {
                range: 'custom',
                start_date: startDateInput,
                end_date: endDateInput,
            }, { preserveState: true });
        }
    };

    const getDateBoundaries = () => {
        const today = new Date();
        const formatDate = (d) => d.toISOString().split('T')[0];

        if (currentFilter === 'this_day') {
            return { startDate: formatDate(today), endDate: formatDate(today) };
        } else if (currentFilter === 'this_week') {
            const first = today.getDate() - today.getDay();
            const last = first + 6;
            return {
                startDate: formatDate(new Date(today.setDate(first))),
                endDate: formatDate(new Date(today.setDate(last))),
            };
        } else if (currentFilter === 'last_30_days') {
            const past = new Date();
            past.setDate(today.getDate() - 30);
            return { startDate: formatDate(past), endDate: formatDate(today) };
        } else if (currentFilter === 'this_year') {
            const yearStart = new Date(today.getFullYear(), 0, 1);
            return { startDate: formatDate(yearStart), endDate: formatDate(today) };
        } else if (currentFilter === 'custom') {
            return { startDate: startDateInput, endDate: endDateInput };
        } else {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return { startDate: formatDate(monthStart), endDate: formatDate(today) };
        }
    };

    const { startDate: initialModalStart, endDate: initialModalEnd } = getDateBoundaries();

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setIsCategoryModalOpen(true);
    };

    const handleAccountClick = (acc) => {
        setSelectedAccount(acc);
        setIsAccountModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingTransaction(null);
        setIsTransactionModalOpen(true);
    };

    const openEditModal = (transaction) => {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleDelete = () => {
        if (!deletingTransaction) return;
        router.delete(`/transactions/${deletingTransaction.id}`, {
            onSuccess: () => setDeletingTransaction(null),
        });
    };

    // ── Render ──────────────────────────────────────────────────
    return (
        <AppLayout title="Dashboard" headerTitle="Personal Dashboard">
            <div className="space-y-6">
                {/* Header Controls + Customize button */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <DashboardHeaderControls
                        currentFilter={currentFilter}
                        handleFilterChange={handleFilterChange}
                        startDateInput={startDateInput}
                        setStartDateInput={setStartDateInput}
                        endDateInput={endDateInput}
                        setEndDateInput={setEndDateInput}
                        handleApplyCustomDates={handleApplyCustomDates}
                        openCreateModal={openCreateModal}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomizeOpen(true)}
                        className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 gap-2 shrink-0"
                    >
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Customize</span>
                    </Button>
                </div>

                {/* KPI Cards */}
                {show('kpis') && (
                    <DashboardKpis
                        kpis={kpis}
                        dailyTrends={dailyTrends}
                        formatCurrency={formatCurrency}
                    />
                )}

                {/* Cash Flow Trend */}
                {show('cash_flow_trend') && (
                    <CashFlowTrendCard
                        data={(dailyTrends || []).map((d) => ({
                            date: d.transaction_date,
                            rawDate: d.rawDate,
                            income: d.income,
                            expense: d.expense,
                            net: (d.income || 0) - (d.expense || 0),
                        }))}
                        formatCurrency={formatCurrency}
                    />
                )}

                {/* Activity + Chart row */}
                {(show('recent_transactions') || show('expense_chart')) && (
                    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 items-start">
                        {show('recent_transactions') && (
                            <div className="xl:col-span-2">
                                <DashboardActivitySection
                                    latestTransactions={latestTransactions}
                                    formatCurrency={formatCurrency}
                                    formatDateOnly={formatDateOnly}
                                    setSelectedDetailTransaction={setSelectedDetailTransaction}
                                />
                            </div>
                        )}

                        {show('expense_chart') && (
                            <Card className="border-zinc-800 flex flex-col justify-between min-h-[420px] lg:h-[520px]">
                                <CardHeader className="p-4 sm:p-6 pb-3 shrink-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-zinc-200">
                                            {chartTab === 'expenses' ? (
                                                <>
                                                    <PieChartIcon className="h-5 w-5 text-zinc-400" />
                                                    Expense
                                                </>
                                            ) : (
                                                <>
                                                    <Wallet className="h-5 w-5 text-emerald-500" />
                                                    Accounts
                                                </>
                                            )}
                                        </CardTitle>
                                        <CardDescription className="text-zinc-400 text-xs mt-0.5">
                                            {chartTab === 'expenses'
                                                ? 'Tap or click a category to view transactions.'
                                                : 'Overview of individual account balances.'}
                                        </CardDescription>
                                    </div>

                                    <div className="w-full sm:w-[140px] shrink-0">
                                        <Select value={chartTab} onValueChange={setChartTab}>
                                            <SelectTrigger className="w-full h-8 text-xs border-zinc-800 bg-zinc-900 text-zinc-200">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="border-zinc-800 bg-background text-zinc-300 w-[var(--radix-select-trigger-width)]">
                                                <SelectItem value="expenses">Expense</SelectItem>
                                                <SelectItem value="accounts">Accounts</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>

                                <CardContent className="p-4 sm:p-6 sm:pt-0 flex-1 flex flex-col min-h-0 overflow-hidden">
                                    {chartTab === 'expenses' ? (
                                        <ExpensePieChart
                                            data={categoryBreakdown?.expense || []}
                                            formatCurrency={formatCurrency}
                                            onCategoryClick={handleCategoryClick}
                                        />
                                    ) : (
                                        <AccountPieChartCard
                                            data={accounts}
                                            formatCurrency={formatCurrency}
                                            onAccountClick={handleAccountClick}
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {/* Placeholder slots for future widgets — remove when you build the real ones */}
                {show('budget_overview') && (
                    <Card className="border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-zinc-200">Budget Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-zinc-400">
                            Coming soon.
                        </CardContent>
                    </Card>
                )}
                {show('savings_goals') && (
                    <Card className="border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-zinc-200">Savings Goals</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-zinc-400">
                            Coming soon.
                        </CardContent>
                    </Card>
                )}
                {show('upcoming_recurring') && (
                    <Card className="border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-zinc-200">Upcoming Recurring</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-zinc-400">
                            Coming soon.
                        </CardContent>
                    </Card>
                )}
                {show('split_balances') && (
                    <Card className="border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-zinc-200">Split Balances</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-zinc-400">
                            Coming soon.
                        </CardContent>
                    </Card>
                )}
                {show('wishlist_progress') && (
                    <Card className="border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-sm text-zinc-200">Wishlist Progress</CardTitle>
                        </CardHeader>
                        <CardContent className="text-xs text-zinc-400">
                            Coming soon.
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Modals & Sheets */}
            <CategoryTransactionsModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                category={selectedCategory}
                accounts={accounts}
                initialStartDate={initialModalStart}
                initialEndDate={initialModalEnd}
            />

            <AccountTransactionsModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                account={selectedAccount}
                categories={categories}
                initialStartDate={initialModalStart}
                initialEndDate={initialModalEnd}
            />

            {isTransactionModalOpen && (
                <TransactionFormModal
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    editingTransaction={editingTransaction}
                    accounts={accounts}
                    categories={categories}
                    accountTypes={accountTypes}
                    savingsGoals={savingsGoals}
                />
            )}

            <TransactionDetailSheet
                open={!!selectedDetailTransaction}
                onOpenChange={(open) => !open && setSelectedDetailTransaction(null)}
                transaction={selectedDetailTransaction ? {
                    ...selectedDetailTransaction,
                    date: formatDateOnly(selectedDetailTransaction.date || selectedDetailTransaction.transaction_date),
                } : null}
                onEdit={openEditModal}
                onDelete={setDeletingTransaction}
                userCurrency={userCurrency}
            />

            <AlertDialog open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the transaction record.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <CustomizeDashboardSheet
                open={customizeOpen}
                onOpenChange={setCustomizeOpen}
                initialWidgets={widgets}
            />
        </AppLayout>
    );
}