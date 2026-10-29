import React from 'react';
import { FileText, Pencil, Trash2 } from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

export function TransactionDetailSheet({
    open,
    onOpenChange,
    transaction,
    onEdit,
    onDelete,
    currentDate,
    userCurrency = 'PHP'
}) {
    if (!transaction) return null;

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: userCurrency,
            minimumFractionDigits: 2
        }).format(val || 0);

   const getAmountColor = (type) => {
    switch (type) {
        case 'income':
            return 'text-emerald-400';
        case 'expense':
            return 'text-rose-400';
        case 'transfer':
        case 'savings':
            return 'text-blue-400';
        default:
            return 'text-zinc-200';
    }
};

    const getTypeLabel = (type) => {
        if (type === 'savings') return 'Savings Deposit';
        return type;
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col justify-between">
                <div>
                    <SheetHeader className="pb-4 border-b border-zinc-800">
                        <SheetTitle className="text-zinc-100 flex items-center gap-2 text-base">
                            <FileText className="h-4 w-4 text-primary" /> Transaction Details
                        </SheetTitle>
                        <SheetDescription className="text-zinc-400 text-xs">
                            Complete information for this record.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-4 text-xs overflow-y-auto max-h-[calc(85vh-160px)] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex justify-between py-2 border-b border-zinc-800/60 items-center">
                            <span className="text-zinc-400">Type</span>
                            <span className="font-semibold uppercase tracking-wider text-zinc-200">
                                {getTypeLabel(transaction.type)}
                            </span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-zinc-800/60 items-center">
                            <span className="text-zinc-400">Amount</span>
                            <span className={`font-bold text-sm ${getAmountColor(transaction.type)}`}>
    {transaction.type === 'income' && '+'}
    {transaction.type === 'expense' && '-'}
    {formatCurrency(transaction.amount)}
</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-zinc-800/60 items-center">
                            <span className="text-zinc-400">Date</span>
                            <span className="text-zinc-200 font-medium">{transaction.date || currentDate}</span>
                        </div>

                        <div className="flex justify-between py-2 border-b border-zinc-800/60 items-center">
                            <span className="text-zinc-400">Account</span>
                            <span className="text-zinc-200 font-medium">{transaction.account?.name || '—'}</span>
                        </div>

                        {transaction.type === 'savings' && (
                            <div className="flex justify-between py-2 border-b border-zinc-800/60 items-center">
                                <span className="text-zinc-400">Savings Goal</span>
                                <span className="text-emerald-400 font-medium">
                                    {transaction.savings_goal?.title || '—'}
                                </span>
                            </div>
                        )}

                        {transaction.type === 'transfer' && (
                            <div className="flex justify-between py-2 border-b border-zinc-800/60 items-center">
                                <span className="text-zinc-400">Destination Account</span>
                                <span className="text-emerald-400 font-medium">{transaction.destination_account?.name || '—'}</span>
                            </div>
                        )}

                        {transaction.category?.name && (
                            <div className="flex justify-between py-2 border-b border-zinc-800/60 items-center">
                                <span className="text-zinc-400">Category</span>
                                <span className="text-zinc-200 font-medium">{transaction.category.name}</span>
                            </div>
                        )}

                        <div className="space-y-1.5 pt-2">
                            <span className="text-zinc-400 block">Description / Notes</span>
                            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-200 min-h-[60px]">
                                {transaction.description || <span className="text-zinc-500 italic">No description provided</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="pt-4 border-t border-zinc-800 flex flex-row items-center justify-between gap-2">
                    {onDelete ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                onOpenChange(false);
                                onDelete(transaction);
                            }}
                            className="h-9 gap-1.5 border-rose-500/30 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 text-xs"
                        >
                            <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                    ) : <div />}

                    <div className="flex items-center gap-2">
                        {onEdit && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    onOpenChange(false);
                                    onEdit(transaction);
                                }}
                                className="h-9 gap-1.5 text-xs px-4"
                            >
                                <Pencil className="h-4 w-4" /> Edit
                            </Button>
                        )}
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}