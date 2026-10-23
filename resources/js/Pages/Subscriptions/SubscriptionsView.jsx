import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Calendar, 
    Plus, 
    RefreshCw, 
    Wallet, 
    Power,
    Tag,
    MoreHorizontal,
    Zap,
    Pencil,
    Trash2,
    TrendingUp,
    FastForward,
    AlertCircle,
    CheckCircle2,
    Filter,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';
import { CreateRecurringDialog } from '@/components/CreateRecurringDialog';
import { PayInstanceDialog } from '@/components/PayInstanceDialog';

const ITEMS_PER_PAGE = 5;

export default function SubscriptionsView({ 
    recurringTransactions = [], 
    pendingInstances = [],
    accounts = [], 
    categories = [] 
}) {
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [dateFilter, setDateFilter] = useState('current_month'); // 'current_month' | '30_days' | 'all'
    
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [payingInstance, setPayingInstance] = useState(null);

    // Client-side pagination states
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
        setMissedPage(1);
        setUpcomingPage(1);
        setRulesPage(1);
    };

    // Filtered lists
    const overdueInstances = pendingInstances.filter((item) => {
        if (!item.is_overdue) return false;
        if (filterType === 'expense' && item.type !== 'expense') return false;
        if (filterType === 'income' && item.type !== 'income') return false;
        return true;
    });

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

        return true;
    });

    const filteredRules = recurringList.filter((item) => {
        if (filterType === 'expense' && item.type !== 'expense') return false;
        if (filterType === 'income' && item.type !== 'income') return false;

        if (filterStatus === 'active' && !item.is_active) return false;
        if (filterStatus === 'paused' && item.is_active) return false;

        return true;
    });

    // Missed Payments Pagination
    const totalMissedPages = Math.ceil(overdueInstances.length / ITEMS_PER_PAGE) || 1;
    const paginatedMissed = overdueInstances.slice(
        (missedPage - 1) * ITEMS_PER_PAGE,
        missedPage * ITEMS_PER_PAGE
    );

    // Upcoming Dues Pagination
    const totalUpcomingPages = Math.ceil(upcomingInstances.length / ITEMS_PER_PAGE) || 1;
    const paginatedUpcoming = upcomingInstances.slice(
        (upcomingPage - 1) * ITEMS_PER_PAGE,
        upcomingPage * ITEMS_PER_PAGE
    );

    // Rules Pagination
    const totalRulesPages = Math.ceil(filteredRules.length / ITEMS_PER_PAGE) || 1;
    const paginatedRules = filteredRules.slice(
        (rulesPage - 1) * ITEMS_PER_PAGE,
        rulesPage * ITEMS_PER_PAGE
    );

    const hasActiveFilters = Boolean(
        filterType !== 'all' || 
        filterStatus !== 'all' ||
        dateFilter !== 'current_month'
    );

    const activeFilterCount = [
        filterType !== 'all',
        filterStatus !== 'all',
        dateFilter !== 'current_month'
    ].filter(Boolean).length;

    const handleSkipInstance = (item) => {
        router.post(route('recurring.skip', item.rule_id), { due_date: item.due_date }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.info(`Skipped instance for ${item.due_date}`);
            },
        });
    };

    const handleToggleActive = (item) => {
        router.patch(route('recurring.toggle', item.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Rule ${item.is_active ? 'paused' : 'activated'}.`);
            },
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

    const totalMonthlyExpenses = recurringList
        .filter((item) => item.is_active && item.type === 'expense')
        .reduce((acc, item) => {
            let monthlyVal = Number(item.amount) || 0;
            if (item.frequency === 'daily') monthlyVal *= 30;
            if (item.frequency === 'weekly') monthlyVal *= 4.33;
            if (item.frequency === 'yearly') monthlyVal /= 12;
            return acc + monthlyVal;
        }, 0);

    const totalMonthlyIncome = recurringList
        .filter((item) => item.is_active && item.type === 'income')
        .reduce((acc, item) => {
            let monthlyVal = Number(item.amount) || 0;
            if (item.frequency === 'daily') monthlyVal *= 30;
            if (item.frequency === 'weekly') monthlyVal *= 4.33;
            if (item.frequency === 'yearly') monthlyVal /= 12;
            return acc + monthlyVal;
        }, 0);

    return (
        <AppLayout title="Recurring & Subscriptions" headerTitle="Recurring & Subscriptions">
            <div className="w-full space-y-6">
                {/* 1. Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Recurring & Subscriptions
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400">
                            Track scheduled dues, missed payments, and recurring cash flow.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* Filter Sheet Trigger */}
                        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="relative flex-1 sm:flex-initial gap-2 border-zinc-800 text-zinc-300 h-9 text-xs">
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
                                            <Filter className="h-4 w-4 text-zinc-400" /> Filter Rules & Schedules
                                        </SheetTitle>
                                        <SheetDescription className="text-zinc-400 text-xs">
                                            Filter your subscription and payment rules by timeframe, type, and schedule status.
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="py-6 space-y-5">
                                        {/* Date Range Filter */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400">Timeframe (Upcoming Dues)</label>
                                            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                                                {[
                                                    { id: 'current_month', label: 'This Month' },
                                                    { id: '30_days', label: 'Next 30 Days' },
                                                    { id: 'all', label: 'All Upcoming' },
                                                ].map((timeOption) => (
                                                    <button
                                                        key={timeOption.id}
                                                        type="button"
                                                        onClick={() => {
                                                            setDateFilter(timeOption.id);
                                                            setUpcomingPage(1);
                                                        }}
                                                        className={`py-1.5 px-2 rounded-md text-[11px] font-medium text-center transition-all ${
                                                            dateFilter === timeOption.id 
                                                                ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                                                                : 'text-zinc-400 hover:text-zinc-200'
                                                        }`}
                                                    >
                                                        {timeOption.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Type Filter */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400">Rule Type</label>
                                            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                                                {['all', 'expense', 'income'].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => {
                                                            setFilterType(type);
                                                            setMissedPage(1);
                                                            setUpcomingPage(1);
                                                            setRulesPage(1);
                                                        }}
                                                        className={`py-1.5 px-3 rounded-md text-[11px] font-medium capitalize text-center transition-all ${
                                                            filterType === type 
                                                                ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                                                                : 'text-zinc-400 hover:text-zinc-200'
                                                        }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Status Filter */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400">Rule Status</label>
                                            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                                                {['all', 'active', 'paused'].map((status) => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => {
                                                            setFilterStatus(status);
                                                            setRulesPage(1);
                                                        }}
                                                        className={`py-1.5 px-2 rounded-md text-[11px] font-medium capitalize text-center transition-all ${
                                                            filterStatus === status 
                                                                ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                                                                : 'text-zinc-400 hover:text-zinc-200'
                                                        }`}
                                                    >
                                                        {status}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
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

                                    <SheetClose asChild>
                                        <Button className="h-9 px-6">Done</Button>
                                    </SheetClose>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>

                        {/* Add Rule Button */}
                        <Button onClick={() => { setEditingItem(null); setIsCreateOpen(true); }} className="flex-1 sm:flex-initial gap-2 text-xs h-9">
                            <Plus className="h-4 w-4" /> Add Recurring Rule
                        </Button>
                    </div>
                </div>

                {/* 2. Top KPI Cards */}
                <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 w-full">
                    <Card className="border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-zinc-400">Estimated Monthly Expenses</CardTitle>
                            <Calendar className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-rose-500">{formatCurrency(totalMonthlyExpenses)}</div>
                            <p className="text-[11px] text-zinc-400 mt-1">Normalized active commitments</p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-zinc-400">Estimated Monthly Income</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-emerald-500">{formatCurrency(totalMonthlyIncome)}</div>
                            <p className="text-[11px] text-zinc-400 mt-1">Normalized active recurring inflows</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Active Filter Bar Badge Indicator */}
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

                        <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
                            {dateFilter !== 'current_month' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs capitalize shrink-0">
                                    <span>Timeframe: {dateFilter === '30_days' ? 'Next 30 Days' : 'All'}</span>
                                    <X className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" onClick={() => { setDateFilter('current_month'); setUpcomingPage(1); }} />
                                </span>
                            )}

                            {filterType !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs capitalize shrink-0">
                                    <span>Type: {filterType}</span>
                                    <X className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" onClick={() => { setFilterType('all'); setMissedPage(1); setUpcomingPage(1); setRulesPage(1); }} />
                                </span>
                            )}

                            {filterStatus !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs capitalize shrink-0">
                                    <span>Status: {filterStatus}</span>
                                    <X className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" onClick={() => { setFilterStatus('all'); setRulesPage(1); }} />
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* 3. Main Tabs Section */}
                <Tabs defaultValue="schedule" className="w-full flex flex-col space-y-4">
                    {/* Tabs Bar (Equal Width Grid Layout) */}
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
                                Recurring Rules ({filteredRules.length})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab 1: Action Center & Upcoming Schedule */}
                    <TabsContent value="schedule" className="w-full space-y-6 mt-0">
                        <Card className="border-zinc-800">
                            <CardHeader className="p-4 sm:p-6 pb-3">
                                <CardTitle className="text-sm font-semibold text-zinc-200">
                                    Upcoming Dues ({
                                        dateFilter === 'current_month' 
                                            ? 'This Month' 
                                            : dateFilter === '30_days' 
                                            ? 'Next 30 Days' 
                                            : 'All Scheduled'
                                    })
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 sm:pt-0">
                                {paginatedUpcoming.length > 0 ? (
                                    <>
                                        {/* Mobile Card List View */}
                                        <div className="block sm:hidden space-y-2.5">
                                            {paginatedUpcoming.map((item, idx) => (
                                                <div 
                                                    key={`${item.rule_id}-${item.due_date}-${idx}`}
                                                    className="relative p-3 rounded-lg border border-zinc-800 bg-zinc-900/40"
                                                >
                                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                                                        item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                                                    }`} />

                                                    <div className="pl-2 space-y-2">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-xs font-semibold truncate text-zinc-100">
                                                                    {item.title}
                                                                </p>
                                                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                                                    {item.account?.name || 'No account'}
                                                                </p>
                                                            </div>

                                                            <span className={`text-sm font-bold shrink-0 ${
                                                                item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                                                            }`}>
                                                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-[10px]">
                                                            <div className="flex items-center gap-1.5 text-zinc-400">
                                                                <span className="font-medium text-zinc-300">
                                                                    Due {item.due_date}
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center gap-1.5 shrink-0">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    className="h-6 text-[10px] px-2.5 border-zinc-800 text-zinc-300"
                                                                    onClick={() => setPayingInstance(item)}
                                                                >
                                                                    Pay
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="ghost" 
                                                                    className="h-6 text-[10px] px-2 text-zinc-400"
                                                                    onClick={() => handleSkipInstance(item)}
                                                                >
                                                                    Skip
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop Table View */}
                                        <div className="hidden sm:block">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                                                        <TableHead className="text-zinc-400">Title</TableHead>
                                                        <TableHead className="text-zinc-400">Due Date</TableHead>
                                                        <TableHead className="text-zinc-400">Account</TableHead>
                                                        <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                                        <TableHead className="text-right text-zinc-400">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedUpcoming.map((item, idx) => (
                                                        <TableRow key={`${item.rule_id}-${item.due_date}-${idx}`} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                                                            <TableCell className="font-medium text-zinc-200 text-xs">{item.title}</TableCell>
                                                            <TableCell className="text-xs text-zinc-400">{item.due_date}</TableCell>
                                                            <TableCell className="text-xs text-zinc-400">{item.account?.name || '—'}</TableCell>
                                                            <TableCell className={`text-right font-semibold text-xs ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                                            </TableCell>
                                                            <TableCell className="text-right space-x-2">
                                                                <Button size="sm" variant="outline" onClick={() => setPayingInstance(item)} className="h-7 px-2.5 text-xs border-zinc-800 text-zinc-300">
                                                                    Pay
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => handleSkipInstance(item)} className="h-7 px-2 text-xs text-zinc-400">
                                                                    Skip
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-8 text-center text-xs text-zinc-500">
                                        No upcoming dues scheduled for this timeframe matching your filters.
                                    </div>
                                )}
                            </CardContent>

                            {/* Upcoming Dues Pagination Footer */}
                            {upcomingInstances.length > 0 && (
                                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-4 sm:px-6 py-4 text-xs text-zinc-400">
                                    <div>
                                        Showing <span className="font-medium text-zinc-200">{(upcomingPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                                        <span className="font-medium text-zinc-200">{Math.min(upcomingPage * ITEMS_PER_PAGE, upcomingInstances.length)}</span> of{' '}
                                        <span className="font-medium text-zinc-200">{upcomingInstances.length}</span> records
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={upcomingPage === 1}
                                            onClick={() => setUpcomingPage((prev) => Math.max(prev - 1, 1))}
                                            className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                                        </Button>

                                        <span className="text-xs font-medium text-zinc-300 px-1">
                                            {upcomingPage} / {totalUpcomingPages}
                                        </span>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={upcomingPage >= totalUpcomingPages}
                                            onClick={() => setUpcomingPage((prev) => Math.min(prev + 1, totalUpcomingPages))}
                                            className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                        >
                                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </TabsContent>

                    {/* Tab 2: Missed Payments */}
                    <TabsContent value="missed" className="w-full space-y-6 mt-0">
                        <Card className="border-zinc-800 w-full">
                            <CardHeader className="p-4 sm:p-6 pb-3">
                                <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" /> Missed & Overdue Payments
                                </CardTitle>
                                <CardDescription className="text-xs text-zinc-400">
                                    Scheduled payments that passed their due date without being logged in transactions.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 sm:pt-0">
                                {paginatedMissed.length > 0 ? (
                                    <>
                                        {/* Mobile Card List View for Missed Payments */}
                                        <div className="block sm:hidden space-y-2.5">
                                            {paginatedMissed.map((item, idx) => (
                                                <div 
                                                    key={`${item.rule_id}-${item.due_date}-${idx}`}
                                                    className="relative p-3 rounded-lg border border-rose-950/60 bg-zinc-900/40 space-y-2"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 flex-1 space-y-1">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-semibold text-zinc-200">{item.title}</span>
                                                                <Badge variant="outline" className="text-[10px] border-rose-900/80 bg-rose-950/20 text-rose-400">
                                                                    Due {item.due_date}
                                                                </Badge>
                                                            </div>
                                                            <p className="text-[11px] text-zinc-400">
                                                                {item.account?.name || 'No account'} • <span className="capitalize">{item.frequency}</span>
                                                            </p>
                                                        </div>
                                                        <span className="text-sm font-bold text-rose-500 shrink-0">
                                                            -{formatCurrency(item.amount)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-800">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-6 text-[10px] px-2.5 border-rose-900/50 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"
                                                            onClick={() => setPayingInstance(item)}
                                                        >
                                                            Pay
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            className="h-6 text-[10px] px-2 text-zinc-400 hover:text-zinc-200"
                                                            onClick={() => handleSkipInstance(item)}
                                                        >
                                                            Skip
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop Table View for Missed Payments */}
                                        <div className="hidden sm:block">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                                                        <TableHead className="text-zinc-400">Title</TableHead>
                                                        <TableHead className="text-zinc-400">Due Date</TableHead>
                                                        <TableHead className="text-zinc-400">Account</TableHead>
                                                        <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                                        <TableHead className="text-right text-zinc-400">Action</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedMissed.map((item, idx) => (
                                                        <TableRow key={`${item.rule_id}-${item.due_date}-${idx}`} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                                                            <TableCell className="font-medium text-zinc-200 text-xs">{item.title}</TableCell>
                                                            <TableCell className="text-xs text-rose-400 font-medium">{item.due_date}</TableCell>
                                                            <TableCell className="text-xs text-zinc-400">{item.account?.name || '—'}</TableCell>
                                                            <TableCell className="text-right font-semibold text-xs text-rose-500">
                                                                -{formatCurrency(item.amount)}
                                                            </TableCell>
                                                            <TableCell className="text-right space-x-2">
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="outline" 
                                                                    onClick={() => setPayingInstance(item)} 
                                                                    className="h-7 px-2.5 text-xs border-rose-900/50 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"
                                                                >
                                                                    Pay
                                                                </Button>
                                                                <Button 
                                                                    size="sm" 
                                                                    variant="ghost" 
                                                                    onClick={() => handleSkipInstance(item)} 
                                                                    className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200"
                                                                >
                                                                    Skip
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-8 text-center text-xs text-zinc-500">
                                        No missed or overdue payments found.
                                    </div>
                                )}
                            </CardContent>

                            {/* Missed Payments Pagination Footer */}
                            {overdueInstances.length > 0 && (
                                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-4 sm:px-6 py-4 text-xs text-zinc-400">
                                    <div>
                                        Showing <span className="font-medium text-zinc-200">{(missedPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                                        <span className="font-medium text-zinc-200">{Math.min(missedPage * ITEMS_PER_PAGE, overdueInstances.length)}</span> of{' '}
                                        <span className="font-medium text-zinc-200">{overdueInstances.length}</span> records
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={missedPage === 1}
                                            onClick={() => setMissedPage((prev) => Math.max(prev - 1, 1))}
                                            className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                                        </Button>

                                        <span className="text-xs font-medium text-zinc-300 px-1">
                                            {missedPage} / {totalMissedPages}
                                        </span>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={missedPage >= totalMissedPages}
                                            onClick={() => setMissedPage((prev) => Math.min(prev + 1, totalMissedPages))}
                                            className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                        >
                                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Master Rules */}
                    <TabsContent value="rules" className="w-full mt-0">
                        <Card className="border-zinc-800">
                            <CardHeader className="p-4 sm:p-6 pb-3">
                                <CardTitle className="text-sm sm:text-base text-zinc-200">Scheduled Rules</CardTitle>
                                <CardDescription className="text-xs text-zinc-400">
                                    Overview of repeat processing schedules across accounts.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 sm:pt-0">
                                {/* Mobile Card List View */}
                                <div className="block sm:hidden space-y-2.5">
                                    {paginatedRules.length === 0 ? (
                                        <div className="text-center py-8 text-zinc-500 text-xs">
                                            No recurring rules found matching your filters.
                                        </div>
                                    ) : (
                                        paginatedRules.map((item) => {
                                            return (
                                                <div 
                                                    key={item.id} 
                                                    className={`relative p-3 rounded-lg border bg-zinc-900/40 transition-all ${
                                                        !item.is_active 
                                                            ? 'border-zinc-800/60 opacity-50' 
                                                            : 'border-zinc-800 hover:border-zinc-700'
                                                    }`}
                                                >
                                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                                                        item.is_active 
                                                            ? (item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500') 
                                                            : 'bg-zinc-600'
                                                    }`} />

                                                    <div className="pl-2 space-y-2">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <p className={`text-xs font-semibold truncate ${
                                                                    !item.is_active ? 'line-through text-zinc-400' : 'text-zinc-100'
                                                                }`}>
                                                                    {item.title}
                                                                </p>
                                                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                                                                    {item.account?.name || 'No account'}
                                                                </p>
                                                            </div>

                                                            <span className={`text-sm font-bold shrink-0 ${
                                                                !item.is_active 
                                                                    ? 'text-zinc-500' 
                                                                    : item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                                                            }`}>
                                                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-[10px]">
                                                            <div className="flex items-center gap-1.5 text-zinc-400 flex-wrap">
                                                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium capitalize">
                                                                    {item.frequency}
                                                                </span>
                                                                <span>Next: {item.next_due_date ? String(item.next_due_date).split('T')[0] : '—'}</span>
                                                            </div>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400">
                                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                                                    <DropdownMenuItem onClick={() => { setEditingItem(item); setIsCreateOpen(true); }} className="text-xs">
                                                                        <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleToggleActive(item)} className="text-xs">
                                                                        <Power className="mr-2 h-3.5 w-3.5 text-zinc-400" /> {item.is_active ? 'Pause' : 'Activate'}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                                    <DropdownMenuItem onClick={() => setDeletingItem(item)} className="text-xs text-rose-400">
                                                                        <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Desktop Table View */}
                                <div className="hidden sm:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                                                <TableHead className="text-zinc-400">Title</TableHead>
                                                <TableHead className="text-zinc-400">Frequency</TableHead>
                                                <TableHead className="text-zinc-400">Account</TableHead>
                                                <TableHead className="text-zinc-400">Next Due</TableHead>
                                                <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                                <TableHead className="text-right text-zinc-400">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {paginatedRules.length > 0 ? (
                                                paginatedRules.map((item) => (
                                                    <TableRow key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                                                        <TableCell className="font-medium text-zinc-200 text-xs">{item.title}</TableCell>
                                                        <TableCell className="text-xs text-zinc-400 capitalize">{item.frequency}</TableCell>
                                                        <TableCell className="text-xs text-zinc-400">{item.account?.name || '—'}</TableCell>
                                                        <TableCell className="text-xs text-zinc-400">{item.next_due_date ? String(item.next_due_date).split('T')[0] : '—'}</TableCell>
                                                        <TableCell className={`text-right font-semibold text-xs ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {formatCurrency(item.amount)}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400">
                                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                                                    <DropdownMenuItem onClick={() => { setEditingItem(item); setIsCreateOpen(true); }} className="text-xs">
                                                                        <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleToggleActive(item)} className="text-xs">
                                                                        <Power className="mr-2 h-3.5 w-3.5 text-zinc-400" /> {item.is_active ? 'Pause' : 'Activate'}
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                                    <DropdownMenuItem onClick={() => setDeletingItem(item)} className="text-xs text-rose-400">
                                                                        <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="py-8 text-center text-xs text-zinc-500">
                                                        No recurring rules found matching your filters.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>

                            {/* Rules Pagination Footer */}
                            {filteredRules.length > 0 && (
                                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-4 sm:px-6 py-4 text-xs text-zinc-400">
                                    <div>
                                        Showing <span className="font-medium text-zinc-200">{(rulesPage - 1) * ITEMS_PER_PAGE + 1}</span> to{' '}
                                        <span className="font-medium text-zinc-200">{Math.min(rulesPage * ITEMS_PER_PAGE, filteredRules.length)}</span> of{' '}
                                        <span className="font-medium text-zinc-200">{filteredRules.length}</span> records
                                    </div>

                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={rulesPage === 1}
                                            onClick={() => setRulesPage((prev) => Math.max(prev - 1, 1))}
                                            className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                                        </Button>

                                        <span className="text-xs font-medium text-zinc-300 px-1">
                                            {rulesPage} / {totalRulesPages}
                                        </span>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={rulesPage >= totalRulesPages}
                                            onClick={() => setRulesPage((prev) => Math.min(prev + 1, totalRulesPages))}
                                            className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                        >
                                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Dialogs */}
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