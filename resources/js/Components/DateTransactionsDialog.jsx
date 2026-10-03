import React from 'react';
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

    const getTypeBadge = (type) => {
        switch (type) {
            case 'income':
                return (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1 font-medium text-xs">
                        <ArrowUpRight className="h-3.5 w-3.5" /> Income
                    </Badge>
                );
            case 'expense':
                return (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 gap-1 font-medium text-xs">
                        <ArrowDownRight className="h-3.5 w-3.5" /> Expense
                    </Badge>
                );
            case 'transfer':
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1 font-medium text-xs">
                        <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-xs">{type}</Badge>;
        }
    };

    const transactions = dayData.transactions || [];
    const netRemaining = (dayData.income || 0) - (dayData.expense || 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[620px] max-h-[85vh] flex flex-col p-6">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" /> 
                        {formatDate(date || dayData.date)}
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Summary and transactions recorded on this date.
                    </DialogDescription>
                </DialogHeader>

                {/* Day Summary Totals Header */}
                <div className="grid grid-cols-3 gap-2 my-2 p-3 bg-muted/30 border border-border/60 rounded-lg text-center sm:text-left">
                    <div className="space-y-0.5">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Total Income
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 truncate">
                            +{formatCurrency(dayData.income)}
                        </p>
                    </div>
                    <div className="space-y-0.5 border-x border-border/40 px-2">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Total Expense
                        </span>
                        <p className="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400 truncate">
                            -{formatCurrency(dayData.expense)}
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Net Remaining
                        </span>
                        <p className={`text-xs sm:text-sm font-bold truncate ${
                            netRemaining >= 0 
                                ? 'text-emerald-600 dark:text-emerald-400' 
                                : 'text-rose-600 dark:text-rose-400'
                        }`}>
                            {netRemaining >= 0 ? '+' : ''}{formatCurrency(netRemaining)}
                        </p>
                    </div>
                </div>

                {/* Non-clickable Table */}
                <div className="flex-1 overflow-y-auto border border-border/60 rounded-lg">
                    <Table>
                        <TableHeader className="bg-muted/40 sticky top-0">
                            <TableRow>
                                <TableHead className="text-xs font-semibold">Type</TableHead>
                                <TableHead className="text-xs font-semibold">Description</TableHead>
                                <TableHead className="text-xs font-semibold">Account</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length > 0 ? (
                                transactions.map((tx) => (
                                    <TableRow key={tx.id} className="border-border/50">
                                        <TableCell className="py-2.5">
                                            {getTypeBadge(tx.type)}
                                        </TableCell>
                                        <TableCell className="py-2.5 max-w-[180px] truncate">
                                            <span className="text-xs font-medium text-foreground block truncate">
                                                {tx.description || <span className="text-muted-foreground italic">No description</span>}
                                            </span>
                                            {tx.category?.name && (
                                                <span className="text-[10px] text-muted-foreground">
                                                    {tx.category.name}
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-2.5 text-xs">
                                            {tx.type === 'transfer' ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <span>{tx.account?.name || '—'}</span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400">
                                                        {tx.destination_account?.name || '—'}
                                                    </span>
                                                </span>
                                            ) : (
                                                tx.account?.name || '—'
                                            )}
                                        </TableCell>
                                        <TableCell className={`py-2.5 text-right text-xs font-semibold whitespace-nowrap ${
                                            tx.type === 'income' 
                                                ? 'text-emerald-600 dark:text-emerald-400' 
                                                : tx.type === 'expense' 
                                                ? 'text-foreground' 
                                                : 'text-blue-600 dark:text-blue-400'
                                        }`}>
                                            {tx.type === 'income' && '+'}
                                            {tx.type === 'expense' && '-'}
                                            {formatCurrency(tx.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-xs text-muted-foreground">
                                        No transaction records available for this date.
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