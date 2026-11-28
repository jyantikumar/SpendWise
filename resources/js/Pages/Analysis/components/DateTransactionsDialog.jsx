// resources/js/Pages/Analysis/components/DateTransactionsDialog.jsx
import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    Filter,
    Search,
    X,
    Plus,
    ChevronDown,
    SlidersHorizontal
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
} from '@/components/ui/sheet';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TransactionDetailSheet } from '@/Pages/Transactions/components/TransactionDetailSheet';

export function DateTransactionsDialog({ 
    open, 
    onOpenChange, 
    date, 
    dayData, 
    onEdit, 
    onDelete,
    onQuickAdd,
    userCurrency = 'PHP'
}) {
    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sheetType, setSheetType] = useState('all');
    const [selectedAccount, setSelectedAccount] = useState('all');
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    useEffect(() => {
        if (open) {
            setSearchQuery('');
            setSheetType('all');
            setSelectedAccount('all');
            setSelectedTransaction(null);
        }
    }, [open, dayData]);

    if (!dayData) return null;

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(val || 0);

    const formatDate = (rawDate) => {
        if (!rawDate) return '';
        
        if (typeof rawDate === 'string' && rawDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = rawDate.split('-');
            const dateObj = new Date(year, month - 1, day);
            return dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        }

        const dateObj = new Date(rawDate);
        return dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const rawTransactions = dayData.transactions || [];
    const targetDate = date || dayData.date;

    const availableAccounts = Array.from(
        new Map(
            rawTransactions
                .flatMap(tx => [tx.account, tx.destination_account])
                .filter(Boolean)
                .map(acc => [acc.id, acc])
        ).values()
    );

    const hasActiveFilters = searchQuery !== '' || sheetType !== 'all' || selectedAccount !== 'all';
    const activeFilterCount = [
        searchQuery !== '',
        sheetType !== 'all',
        selectedAccount !== 'all'
    ].filter(Boolean).length;

    const handleResetFilters = () => {
        setSearchQuery('');
        setSheetType('all');
        setSelectedAccount('all');
    };
    
    const transactions = rawTransactions.filter((tx) => {
        if (sheetType !== 'all' && tx.type !== sheetType) return false;

        if (selectedAccount !== 'all') {
            const accIdNum = Number(selectedAccount);
            const matchesSource = tx.account?.id === accIdNum;
            const matchesDest = tx.destination_account?.id === accIdNum;
            if (!matchesSource && !matchesDest) return false;
        }

        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            const desc = (tx.description || '').toLowerCase();
            const cat = (tx.category?.name || '').toLowerCase();
            const accName = (tx.account?.name || '').toLowerCase();
            if (!desc.includes(query) && !cat.includes(query) && !accName.includes(query)) {
                return false;
            }
        }

        return true;
    });

    const netRemaining = (dayData.income || 0) - (dayData.expense || 0);

    const renderSummaryBadge = () => {
        if (sheetType === 'expense') {
            return (
                <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                    Total Expense: {formatCurrency(dayData.expense)}
                </Badge>
            );
        }

        if (sheetType === 'income') {
            return (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                    Total Income: {formatCurrency(dayData.income)}
                </Badge>
            );
        }

        return (
            <Badge 
                variant="outline" 
                className={`text-xs font-semibold px-2.5 py-1 whitespace-nowrap ${
                    netRemaining >= 0 
                        ? 'bg-zinc-800 text-zinc-200 border-zinc-700' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
            >
                Net: {netRemaining >= 0 ? '+' : ''}{formatCurrency(netRemaining)}
            </Badge>
        );
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-4 sm:p-6 border-zinc-800 bg-background overflow-hidden">
                    {/* Header */}
                    <DialogHeader className="pb-3 border-b border-zinc-800 shrink-0">
                        <div className="flex items-center justify-between pr-8 sm:pr-10 gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <Calendar className="h-5 w-5 text-primary shrink-0" /> 
                                <div className="min-w-0">
                                    <DialogTitle className="text-base sm:text-lg font-bold text-zinc-200 truncate">
                                        {formatDate(targetDate)}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-zinc-400 truncate">
                                        Transactions recorded on this date. Click a row to view details.
                                    </DialogDescription>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {renderSummaryBadge()}
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Filter Controls Bar with Split Dropdown Button Group */}
                    <div className="py-3 border-b border-zinc-800 bg-zinc-900/40 -mx-4 px-4 sm:-mx-6 sm:px-6 shrink-0 flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="Search description, category, or account..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8 h-9 border-zinc-800 text-zinc-300 bg-zinc-900 text-xs w-full"
                            />
                        </div>

                        {/* Split button: [ + Add | ▾ ] */}
                        <div className="flex items-center shrink-0 rounded-md overflow-hidden divide-x divide-zinc-300">
                            <Button
                                size="sm"
                                onClick={() => onQuickAdd && onQuickAdd(targetDate)}
                                className="rounded-none border-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs h-9 px-3 gap-1.5 shadow-none"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Add</span>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="rounded-none border-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 h-9 px-2 shadow-none relative"
                                        aria-label="More actions"
                                    >
                                        <ChevronDown className="h-3.5 w-3.5" />
                                        {activeFilterCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-zinc-900 text-zinc-100 px-0.5 text-[9px] font-bold border border-zinc-100">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="border-zinc-800 bg-zinc-950 text-zinc-300 text-xs w-[180px]"
                                >
                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1.5">
                                        Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                    <DropdownMenuItem
                                        onClick={() => setIsFilterSheetOpen(true)}
                                        className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                    >
                                        <SlidersHorizontal className="mr-2 h-3 w-3 text-zinc-400" />
                                        <span className="flex-1">Filter</span>
                                        {activeFilterCount > 0 && (
                                            <span className="text-[10px] text-zinc-500">
                                                {activeFilterCount}
                                            </span>
                                        )}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Filter Sheet Triggered from Dropdown */}
                    <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                        <SheetContent side="right" className="w-full sm:max-w-md border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col justify-between">
                            <div>
                                <SheetHeader className="pb-4 border-b border-zinc-800">
                                    <SheetTitle className="text-zinc-100 flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-zinc-400" /> Filter Date Transactions
                                    </SheetTitle>
                                    <SheetDescription className="text-zinc-400 text-xs">
                                        Refine transactions by description, type, or account.
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="py-6 space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-xs font-medium text-zinc-400">Search</label>
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                                            <Input
                                                placeholder="Search description or category..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="pl-8 h-9 border-zinc-800 text-zinc-300 bg-zinc-900 text-xs"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400">Type</label>
                                            <Select 
                                                value={sheetType} 
                                                onValueChange={(val) => setSheetType(val)}
                                            >
                                                <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300 bg-zinc-900 text-xs">
                                                    <SelectValue placeholder="All Types" />
                                                </SelectTrigger>
                                                <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-300 text-xs">
                                                    <SelectItem value="all">All Types</SelectItem>
                                                    <SelectItem value="expense">Expense</SelectItem>
                                                    <SelectItem value="income">Income</SelectItem>
                                                    <SelectItem value="transfer">Transfer</SelectItem>
                                                    <SelectItem value="adjustment">Adjustment</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-medium text-zinc-400">Account</label>
                                            <Select 
                                                value={selectedAccount} 
                                                onValueChange={(val) => setSelectedAccount(val)}
                                            >
                                                <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300 bg-zinc-900 text-xs">
                                                    <SelectValue placeholder="All Accounts" />
                                                </SelectTrigger>
                                                <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-300 max-h-60 text-xs">
                                                    <SelectItem value="all">All Accounts</SelectItem>
                                                    {availableAccounts.map((acc) => (
                                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                                            {acc.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
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

                                <Button onClick={() => setIsFilterSheetOpen(false)} className="h-9 px-6 text-xs">
                                    Done
                                </Button>
                            </SheetFooter>
                        </SheetContent>
                    </Sheet>

                    {/* Table View */}
                    <div className="flex-1 overflow-y-auto my-2 border border-zinc-800 rounded-lg [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <Table>
                            <TableHeader className="bg-muted/40 sticky top-0 z-10">
                                <TableRow className="border-b border-zinc-800">
                                    <TableHead className="text-xs font-semibold text-zinc-400">Description</TableHead>
                                    <TableHead className="text-xs font-semibold text-zinc-400">Account</TableHead>
                                    <TableHead className="text-xs font-semibold text-right text-zinc-400">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length > 0 ? (
                                    transactions.map((tx) => (
                                        <TableRow 
                                            key={tx.id} 
                                            onClick={() => setSelectedTransaction({
                                                ...tx, 
                                                date: tx.date || targetDate
                                            })}
                                            className="border-b border-zinc-800 hover:bg-muted/50 transition-colors cursor-pointer"
                                        >
                                            <TableCell className="py-2.5 max-w-[180px] truncate">
                                                <span className="text-xs font-medium text-zinc-200 block truncate">
                                                    {tx.description || <span className="text-zinc-500 italic">No description</span>}
                                                </span>
                                            </TableCell>
                                            <TableCell className="py-2.5 text-xs text-zinc-300">
                                                {tx.type === 'transfer' ? (
                                                    <span className="inline-flex items-center gap-1">
                                                        <span>{tx.account?.name || '—'}</span>
                                                        <span className="text-zinc-500">→</span>
                                                        <span className="text-emerald-400">
                                                            {tx.destination_account?.name || '—'}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    tx.account?.name || '—'
                                                )}
                                            </TableCell>
                                            <TableCell className={`py-2.5 text-right text-xs font-semibold whitespace-nowrap ${
                                                tx.type === 'income' 
                                                    ? 'text-emerald-400' 
                                                    : tx.type === 'expense' 
                                                    ? 'text-rose-400' 
                                                    : tx.type === 'adjustment'
                                                    ? ((tx.description || '').toLowerCase().includes('decrease') ? 'text-rose-400' : 'text-emerald-400')
                                                    : 'text-blue-400'
                                            }`}>
                                                {tx.type === 'income' && '+'}
                                                {tx.type === 'expense' && '-'}
                                                {tx.type === 'adjustment' && ((tx.description || '').toLowerCase().includes('decrease') ? '-' : '+')}
                                                {formatCurrency(tx.amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow className="border-b border-zinc-800">
                                        <TableCell colSpan={3} className="h-24 text-center text-xs text-zinc-400">
                                            No transaction records available for this filter.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            <TransactionDetailSheet
                open={!!selectedTransaction}
                onOpenChange={(isOpen) => !isOpen && setSelectedTransaction(null)}
                transaction={selectedTransaction}
                currentDate={targetDate}
                onEdit={onEdit}
                onDelete={onDelete}
                userCurrency={userCurrency}
            />
        </>
    );
}