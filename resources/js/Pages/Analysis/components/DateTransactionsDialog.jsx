import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    ArrowUpRight, 
    ArrowDownRight, 
    ArrowLeftRight 
} from 'lucide-react';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function DateTransactionsDialog({ open, onOpenChange, date, dayData }) {
    const [selectedType, setSelectedType] = useState('all');

    // Reset filter when dialog opens or dayData changes
    useEffect(() => {
        if (open) {
            setSelectedType('all');
        }
    }, [open, dayData]);

    if (!dayData) return null;

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const formatDate = (rawDate) => {
        if (!rawDate) return '';
        const dateObj = new Date(rawDate);
        return dateObj.toLocaleDateString('en-PH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const rawTransactions = dayData.transactions || [];
    
    // Client-side filtering based on selected type pill
    const transactions = rawTransactions.filter((tx) => {
        if (selectedType === 'all') return true;
        return tx.type === selectedType;
    });

    const netRemaining = (dayData.income || 0) - (dayData.expense || 0);

    // Dynamic Summary Pill Badge matching AccountTransactionsModal
    const renderSummaryBadge = () => {
        if (selectedType === 'expense') {
            return (
                <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                    Total Expense: {formatCurrency(dayData.expense)}
                </Badge>
            );
        }

        if (selectedType === 'income') {
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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-4 sm:p-6 border-zinc-800 bg-background overflow-hidden">
                {/* Header with inline summary pill badge */}
                <DialogHeader className="pb-3 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center justify-between pr-8 sm:pr-10 gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <Calendar className="h-5 w-5 text-primary shrink-0" /> 
                            <div className="min-w-0">
                                <DialogTitle className="text-base sm:text-lg font-bold text-zinc-200 truncate">
                                    {formatDate(date || dayData.date)}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-zinc-400 truncate">
                                    Transactions recorded on this date.
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Summary Pill Badge */}
                        <div className="shrink-0">
                            {renderSummaryBadge()}
                        </div>
                    </div>
                </DialogHeader>

                {/* Filter Controls Bar */}
                <div className="py-3 border-b border-zinc-800 bg-zinc-900/40 -mx-4 px-4 sm:-mx-6 sm:px-6 shrink-0">
                    <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs w-full">
                        {[
                            { label: 'All', value: 'all' },
                            { label: 'Expenses', value: 'expense' },
                            { label: 'Income', value: 'income' },
                        ].map((pill) => (
                            <button
                                key={pill.value}
                                type="button"
                                onClick={() => setSelectedType(pill.value)}
                                className={`w-full py-1 rounded-md font-medium text-xs text-center transition-all whitespace-nowrap ${
                                    selectedType === pill.value
                                        ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                                        : 'text-zinc-400 hover:text-zinc-200'
                                }`}
                            >
                                {pill.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Non-clickable Table */}
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
                                    <TableRow key={tx.id} className="border-b border-zinc-800 hover:bg-muted/50 transition-colors">
                                        <TableCell className="py-2.5 max-w-[180px] truncate">
                                            <span className="text-xs font-medium text-zinc-200 block truncate">
                                                {tx.description || <span className="text-zinc-500 italic">No description</span>}
                                            </span>
                                            {tx.category?.name && (
                                                <span className="text-[10px] text-zinc-400">
                                                    {tx.category.name}
                                                </span>
                                            )}
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
                                                : 'text-blue-400'
                                        }`}>
                                            {tx.type === 'income' && '+'}
                                            {tx.type === 'expense' && '-'}
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
    );
}