import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Calendar, 
    Plus, 
    RefreshCw, 
    Wallet, 
    CheckCircle2, 
    Power,
    Tag,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Zap,
    Loader2,
    Pencil,
    Trash2,
    TrendingUp,
    FastForward,
    Filter,
    X
} from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export default function SubscriptionsView({ 
    recurringTransactions = [], 
    accounts = [], 
    categories = [] 
}) {
    const [filterType, setFilterType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [processingId, setProcessingId] = useState(null);

    const recurringList = Array.isArray(recurringTransactions) 
        ? recurringTransactions 
        : (recurringTransactions?.data || []);

    const prevLink = recurringTransactions?.prev_page_url || recurringTransactions?.links?.find(l => l.label.includes('Previous'))?.url;
    const nextLink = recurringTransactions?.next_page_url || recurringTransactions?.links?.find(l => l.label.includes('Next'))?.url;
    const currentPage = recurringTransactions?.current_page || 1;
    const lastPage = recurringTransactions?.last_page || 1;
    const fromRecord = recurringTransactions?.from || (recurringList.length > 0 ? 1 : 0);
    const toRecord = recurringTransactions?.to || recurringList.length;
    const totalRecords = recurringTransactions?.total || recurringList.length;

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const isExpired = (endDate) => {
        if (!endDate) return false;
        return new Date(endDate) < new Date(new Date().setHours(0, 0, 0, 0));
    };

    const handleProcess = (item) => {
        setProcessingId(item.id);
        router.post(route('recurring.process', item.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Processed "${item.title}" successfully!`, {
                    description: `${formatCurrency(item.amount)} logged to your transactions.`,
                });
            },
            onError: () => {
                toast.error('Failed to process recurring transaction.');
            },
            onFinish: () => {
                setProcessingId(null);
            },
        });
    };

    const handleSkip = (item) => {
        router.post(route('recurring.skip', item.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.info(`Skipped next payment for "${item.title}".`);
            },
            onError: () => {
                toast.error('Failed to skip payment.');
            },
        });
    };

    const handleToggleActive = (item) => {
        router.patch(route('recurring.toggle', item.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Schedule ${item.is_active ? 'paused' : 'activated'}.`);
            },
        });
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('recurring.destroy', deletingItem.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Recurring rule "${deletingItem.title}" deleted.`);
                setDeletingItem(null);
            },
            onError: () => {
                toast.error('Failed to delete recurring transaction rule.');
            },
        });
    };

    const handleResetFilters = () => {
        setFilterType('all');
        setFilterStatus('all');
    };

    const filteredItems = recurringList.filter((item) => {
        const expired = isExpired(item.end_date);
        
        if (filterType === 'expense' && item.type !== 'expense') return false;
        if (filterType === 'income' && item.type !== 'income') return false;

        if (filterStatus === 'active' && (!item.is_active || expired)) return false;
        if (filterStatus === 'paused' && (item.is_active || expired)) return false;
        if (filterStatus === 'expired' && !expired) return false;

        return true;
    });

    const hasActiveFilters = Boolean(
        filterType !== 'all' || 
        filterStatus !== 'all'
    );

    const activeFilterCount = [
        filterType !== 'all',
        filterStatus !== 'all'
    ].filter(Boolean).length;

    const totalMonthlyExpenses = recurringList
        .filter((item) => item.is_active && !isExpired(item.end_date) && item.type === 'expense')
        .reduce((acc, item) => {
            let monthlyVal = Number(item.amount) || 0;
            if (item.frequency === 'daily') monthlyVal *= 30;
            if (item.frequency === 'weekly') monthlyVal *= 4.33;
            if (item.frequency === 'yearly') monthlyVal /= 12;
            return acc + monthlyVal;
        }, 0);

    const totalMonthlyIncome = recurringList
        .filter((item) => item.is_active && !isExpired(item.end_date) && item.type === 'income')
        .reduce((acc, item) => {
            let monthlyVal = Number(item.amount) || 0;
            if (item.frequency === 'daily') monthlyVal *= 30;
            if (item.frequency === 'weekly') monthlyVal *= 4.33;
            if (item.frequency === 'yearly') monthlyVal /= 12;
            return acc + monthlyVal;
        }, 0);

    const openCreateModal = () => {
        setEditingItem(null);
        setIsCreateOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setIsCreateOpen(true);
    };

    return (
        <AppLayout title="Recurring & Subscriptions" headerTitle="Recurring & Subscriptions">
            <div className="space-y-6">
                {/* Header Action Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Recurring & Subscriptions
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400">
                            Manage fixed operational cash outflows, memberships, and automated repeat income.
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
                                            <Filter className="h-4 w-4 text-zinc-400" /> Filter Recurring Rules
                                        </SheetTitle>
                                        <SheetDescription className="text-zinc-400 text-xs">
                                            Filter your subscription and payment rules by type and schedule status.
                                        </SheetDescription>
                                    </SheetHeader>

                                    <div className="py-6 space-y-5">
                                        {/* Type Filter */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400">Rule Type</label>
                                            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                                                {['all', 'expense', 'income'].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        onClick={() => setFilterType(type)}
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
                                            <label className="text-xs font-medium text-zinc-400">Status</label>
                                            <div className="grid grid-cols-4 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                                                {['all', 'active', 'paused', 'expired'].map((status) => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => setFilterStatus(status)}
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
                        <Button onClick={openCreateModal} className="flex-1 sm:flex-initial gap-2 text-xs h-9">
                            <Plus className="h-4 w-4" /> Add Recurring Rule
                        </Button>
                    </div>
                </div>

                {/* KPI Summary Grid */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
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

                    <Card className="border-zinc-800">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs sm:text-sm font-medium text-zinc-400">Auto-Created Rules</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl sm:text-2xl font-bold text-emerald-500">
                                {recurringList.filter(i => i.auto_create).length}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-1">Managed via background scheduler</p>
                        </CardContent>
                    </Card>
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
                            {filterType !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs capitalize shrink-0">
                                    <span>Type: {filterType}</span>
                                    <X className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" onClick={() => setFilterType('all')} />
                                </span>
                            )}

                            {filterStatus !== 'all' && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs capitalize shrink-0">
                                    <span>Status: {filterStatus}</span>
                                    <X className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" onClick={() => setFilterStatus('all')} />
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Rules Container Card */}
                <Card className="border-zinc-800">
                    <CardHeader className="p-4 sm:p-6 pb-3">
                        <CardTitle className="text-sm sm:text-base text-zinc-200">Scheduled Rules</CardTitle>
                        <CardDescription className="text-xs text-zinc-400">
                            Overview of repeat processing schedules across accounts.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        {/* Mobile List View (Visible on screens smaller than `sm`) */}
                        <div className="block sm:hidden divide-y divide-zinc-800/80 px-4">
                            {filteredItems.length === 0 ? (
                                <div className="text-center py-8 text-zinc-500 text-xs">
                                    No recurring schedules found.
                                </div>
                            ) : (
                                filteredItems.map((item) => {
                                    const expired = isExpired(item.end_date);
                                    const effectiveActive = item.is_active && !expired;

                                    return (
                                        <div 
                                            key={item.id} 
                                            className={`py-3.5 flex items-center justify-between gap-2 transition-opacity ${
                                                !effectiveActive ? 'opacity-40 bg-zinc-950/40' : ''
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
                                                        {effectiveActive && (
                                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                        )}
                                                        <span className={`relative inline-flex h-2 w-2 rounded-full ${
                                                            effectiveActive ? 'bg-emerald-500' : (expired ? 'bg-zinc-500' : 'bg-rose-500')
                                                        }`} />
                                                    </span>

                                                    <span className={`text-xs font-semibold truncate ${
                                                        !effectiveActive ? 'line-through text-zinc-400' : 'text-zinc-200'
                                                    }`}>
                                                        {item.title}
                                                    </span>

                                                    {expired ? (
                                                        <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider border border-zinc-700 px-1 rounded">
                                                            Expired
                                                        </span>
                                                    ) : !item.is_active && (
                                                        <span className="text-[9px] text-rose-400 font-medium uppercase tracking-wider">
                                                            Paused
                                                        </span>
                                                    )}

                                                    <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase border-zinc-800 text-zinc-400">
                                                        {item.frequency}
                                                    </Badge>

                                                    {item.auto_create && effectiveActive && (
                                                        <span className="inline-flex items-center text-[9px] text-emerald-400 font-medium">
                                                            <Zap className="h-2.5 w-2.5 mr-0.5" /> Auto
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2 text-[11px] text-zinc-400 pl-4">
                                                    <span className="truncate">{item.account?.name || 'No account'}</span>
                                                    <span>•</span>
                                                    <span>Due {item.next_due_date ? String(item.next_due_date).split('T')[0] : '—'}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className={`text-xs font-bold ${
                                                    !effectiveActive 
                                                        ? 'text-zinc-500' 
                                                        : item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                                                }`}>
                                                    {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                                </span>

                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    disabled={processingId === item.id || !effectiveActive}
                                                    className="h-7 text-[11px] px-2 border-zinc-800 text-zinc-200 hover:bg-zinc-800 disabled:opacity-40"
                                                    onClick={() => handleProcess(item)}
                                                >
                                                    {processingId === item.id ? (
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                        'Pay'
                                                    )}
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400">
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                                        <DropdownMenuLabel className="text-xs">Rule Actions</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                                        <DropdownMenuItem onClick={() => openEditModal(item)} className="cursor-pointer text-xs">
                                                            <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit
                                                        </DropdownMenuItem>
                                                        {!expired && (
                                                            <>
                                                                <DropdownMenuItem onClick={() => handleSkip(item)} disabled={!item.is_active} className="cursor-pointer text-xs">
                                                                    <FastForward className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Skip Next Payment
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleToggleActive(item)} className="cursor-pointer text-xs">
                                                                    <Power className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                                                                    {item.is_active ? 'Pause' : 'Activate'}
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                                        <DropdownMenuItem 
                                                            onClick={() => setDeletingItem(item)} 
                                                            className="cursor-pointer text-xs text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30"
                                                        >
                                                            <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Desktop Table View (Visible on `sm` and larger screens) */}
                        <div className="hidden sm:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-800">
                                        <TableHead className="text-zinc-400">Title</TableHead>
                                        <TableHead className="text-zinc-400">Frequency</TableHead>
                                        <TableHead className="text-zinc-400">Account</TableHead>
                                        <TableHead className="text-zinc-400">Next Due Date</TableHead>
                                        <TableHead className="text-zinc-400">End Date</TableHead>
                                        <TableHead className="text-zinc-400 text-center">Auto-Post</TableHead>
                                        <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                        <TableHead className="text-right text-zinc-400">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredItems.length > 0 ? (
                                        filteredItems.map((item) => {
                                            const expired = isExpired(item.end_date);
                                            const effectiveActive = item.is_active && !expired;

                                            return (
                                                <TableRow 
                                                    key={item.id} 
                                                    className={`border-b border-zinc-800 transition-colors ${
                                                        !effectiveActive ? 'opacity-40 bg-zinc-950/65' : 'hover:bg-muted/50'
                                                    }`}
                                                >
                                                    <TableCell className="font-medium text-zinc-300 text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                                                                {effectiveActive && (
                                                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                                                )}
                                                                <span className={`relative inline-flex h-2 w-2 rounded-full ${
                                                                    effectiveActive ? 'bg-emerald-500' : (expired ? 'bg-zinc-500' : 'bg-rose-500')
                                                                }`} />
                                                            </span>

                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className={`font-semibold ${!effectiveActive ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                                                                        {item.title}
                                                                    </p>
                                                                    {expired ? (
                                                                        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider border border-zinc-700 px-1 rounded">
                                                                            Expired
                                                                        </span>
                                                                    ) : !item.is_active && (
                                                                        <span className="text-[10px] text-rose-400 font-medium uppercase tracking-wider">
                                                                            Paused
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <p className="text-xs text-zinc-500 capitalize">{item.type}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-xs text-zinc-400">
                                                        <Badge variant="outline" className="text-xs capitalize border-zinc-800 text-zinc-300">
                                                            {item.frequency}
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell className="text-xs text-zinc-400">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5 text-zinc-300">
                                                                <Wallet className="h-3.5 w-3.5 text-zinc-500" />
                                                                <span>{item.account?.name || '—'}</span>
                                                            </div>
                                                            {item.category && (
                                                                <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                                                    <Tag className="h-3 w-3" />
                                                                    <span>{item.category.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="font-medium whitespace-nowrap text-zinc-300 text-xs">
                                                        {item.next_due_date ? String(item.next_due_date).split('T')[0] : '—'}
                                                    </TableCell>

                                                    <TableCell className="whitespace-nowrap text-zinc-400 text-xs">
                                                        {item.end_date ? String(item.end_date).split('T')[0] : 'Indefinite'}
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        {item.auto_create ? (
                                                            <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1">
                                                                <Zap className="h-3 w-3" /> Auto
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs border-zinc-800 text-zinc-400">
                                                                Manual
                                                            </Badge>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className={`text-right font-semibold text-sm whitespace-nowrap ${
                                                        !effectiveActive 
                                                            ? 'text-zinc-500' 
                                                            : item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                                                    }`}>
                                                        {item.type === 'income' ? '+' : '-'}
                                                        {formatCurrency(item.amount)}
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                disabled={processingId === item.id || !effectiveActive}
                                                                className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs disabled:opacity-40"
                                                                onClick={() => handleProcess(item)}
                                                            >
                                                                {processingId === item.id ? (
                                                                    <>
                                                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-zinc-400" />
                                                                        Posting...
                                                                    </>
                                                                ) : (
                                                                    'Pay Now'
                                                                )}
                                                            </Button>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-200">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                                                    <DropdownMenuLabel className="text-xs">Rule Actions</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                                    <DropdownMenuItem onClick={() => openEditModal(item)} className="cursor-pointer text-xs">
                                                                        <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit
                                                                    </DropdownMenuItem>
                                                                    {!expired && (
                                                                        <>
                                                                            <DropdownMenuItem onClick={() => handleSkip(item)} disabled={!item.is_active} className="cursor-pointer text-xs">
                                                                                <FastForward className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Skip Next Payment
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => handleToggleActive(item)} className="cursor-pointer text-xs">
                                                                                <Power className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                                                                                {item.is_active ? 'Pause' : 'Activate'}
                                                                            </DropdownMenuItem>
                                                                        </>
                                                                    )}
                                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                                    <DropdownMenuItem
                                                                        onClick={() => setDeletingItem(item)}
                                                                        className="cursor-pointer text-xs text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30"
                                                                    >
                                                                        <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={8} className="py-8 text-center text-xs text-zinc-500">
                                                No recurring schedules found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>

                    {totalRecords > 0 && (
                        <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-4 sm:px-6 py-4 text-xs text-zinc-400">
                            <div>
                                Showing <span className="font-medium text-zinc-200">{fromRecord}</span> to{' '}
                                <span className="font-medium text-zinc-200">{toRecord}</span> of{' '}
                                <span className="font-medium text-zinc-200">{totalRecords}</span> records
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!prevLink}
                                    onClick={() => prevLink && router.visit(prevLink, { preserveState: true, preserveScroll: true })}
                                    className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                                </Button>

                                <span className="text-xs font-medium text-zinc-300 px-1">
                                    {currentPage} / {lastPage}
                                </span>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={!nextLink}
                                    onClick={() => nextLink && router.visit(nextLink, { preserveState: true, preserveScroll: true })}
                                    className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                >
                                    Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>

            <CreateRecurringDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                editingItem={editingItem}
                accounts={accounts}
                categories={categories}
            />

            <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
                <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Recurring Rule?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400 text-xs">
                            Are you sure you want to delete <strong>{deletingItem?.title}</strong>? 
                            This will stop future automated processing for this rule. Existing logged transactions will remain untouched.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                        <AlertDialogCancel className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 h-9 text-xs w-full sm:w-auto">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white h-9 text-xs w-full sm:w-auto">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}