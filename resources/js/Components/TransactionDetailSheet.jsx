import React from 'react';
import { 
    ArrowUpRight, 
    ArrowDownRight, 
    ArrowRight, 
    ArrowLeftRight, 
    Calendar, 
    Wallet, 
    Tag, 
    FileText, 
    Clock, 
    Pencil, 
    Trash2,
    Copy,
    Check
} from 'lucide-react';

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function TransactionDetailSheet({ 
    open, 
    onOpenChange, 
    transaction, 
    onEdit, 
    onDelete 
}) {
    const [copied, setCopied] = React.useState(false);

    if (!transaction) return null;

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { 
            style: 'currency', 
            currency: 'PHP',
            minimumFractionDigits: 2 
        }).format(val || 0);

    const formatDate = (rawDate) => {
        if (!rawDate) return null;
        const dateObj = new Date(rawDate);
        if (isNaN(dateObj.getTime())) return null;
        return dateObj.toLocaleDateString('en-PH', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const handleCopyId = () => {
        if (transaction.id) {
            navigator.clipboard.writeText(String(transaction.id));
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getTypeBadge = (type) => {
        switch (type) {
            case 'income':
                return (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1.5 font-medium px-2.5 py-1 text-xs">
                        <ArrowUpRight className="h-3.5 w-3.5" /> Income
                    </Badge>
                );
            case 'expense':
                return (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 gap-1.5 font-medium px-2.5 py-1 text-xs">
                        <ArrowDownRight className="h-3.5 w-3.5" /> Expense
                    </Badge>
                );
            case 'transfer':
                return (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1.5 font-medium px-2.5 py-1 text-xs">
                        <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="text-xs">{type}</Badge>;
        }
    };

    const getAmountColor = (type) => {
        switch (type) {
            case 'income':
                return 'text-emerald-600 dark:text-emerald-400';
            case 'expense':
                return 'text-foreground';
            case 'transfer':
                return 'text-blue-600 dark:text-blue-400';
            default:
                return 'text-foreground';
        }
    };

    const rawTransactionDate = transaction.transaction_date || transaction.date;
    const formattedDate = formatDate(rawTransactionDate);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-md flex flex-col justify-between p-0 gap-0">
                
                {/* Scrollable Main Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Header Section */}
                    <SheetHeader className="text-left space-y-4">
                        <div className="flex items-center justify-between">
                            {getTypeBadge(transaction.type)}
                            {transaction.id && (
                                <button
                                    onClick={handleCopyId}
                                    className="flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors bg-muted/50 hover:bg-muted px-2 py-1 rounded-md border border-border/50"
                                    title="Copy Transaction ID"
                                >
                                    <span>#{transaction.id}</span>
                                    {copied ? (
                                        <Check className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                        <Copy className="h-3 w-3" />
                                    )}
                                </button>
                            )}
                        </div>

                        {/* High-end Hero Display */}
                        <div className="bg-muted/30 border border-border/60 rounded-xl p-5 text-center sm:text-left space-y-1 backdrop-blur-sm">
                            <SheetTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Transaction Amount
                            </SheetTitle>
                            <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${getAmountColor(transaction.type)}`}>
                                {transaction.type === 'income' && '+'}
                                {transaction.type === 'expense' && '-'}
                                {formatCurrency(transaction.amount)}
                            </div>
                            <SheetDescription className="text-xs text-muted-foreground pt-1">
                                {formattedDate ? `Recorded on ${formattedDate}` : 'Date unavailable'}
                            </SheetDescription>
                        </div>
                    </SheetHeader>

                    {/* Transfer Flow Visualizer */}
                    {transaction.type === 'transfer' && (
                        <div className="space-y-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Transfer Flow
                            </span>
                            <div className="grid grid-cols-11 items-center gap-2 p-3.5 bg-muted/20 rounded-xl border border-border/60">
                                <div className="col-span-5 space-y-1">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">From</span>
                                    <p className="text-sm font-semibold text-foreground truncate">
                                        {transaction.account?.name || <span className="text-muted-foreground italic font-normal">Unknown</span>}
                                    </p>
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    <div className="p-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                                <div className="col-span-5 text-right space-y-1">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">To</span>
                                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                                        {transaction.destination_account?.name || <span className="text-muted-foreground italic font-normal">Destination</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Information Grid Cards */}
                    <div className="space-y-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Details
                        </span>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Date */}
                            <div className="p-3 bg-muted/20 border border-border/50 rounded-lg flex items-start gap-3">
                                <div className="p-2 rounded-md bg-background border border-border/60 text-muted-foreground shrink-0">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5 overflow-hidden">
                                    <p className="text-[11px] font-medium text-muted-foreground">Date</p>
                                    <p className="text-xs font-semibold text-foreground truncate">
                                        {formattedDate || <span className="text-muted-foreground font-normal italic">Unspecified</span>}
                                    </p>
                                </div>
                            </div>

                            {/* Account (for non-transfers) */}
                            {transaction.type !== 'transfer' && (
                                <div className="p-3 bg-muted/20 border border-border/50 rounded-lg flex items-start gap-3">
                                    <div className="p-2 rounded-md bg-background border border-border/60 text-muted-foreground shrink-0">
                                        <Wallet className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-0.5 overflow-hidden">
                                        <p className="text-[11px] font-medium text-muted-foreground">Account</p>
                                        <p className="text-xs font-semibold text-foreground truncate">
                                            {transaction.account?.name || <span className="text-muted-foreground font-normal italic">Unspecified</span>}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Category (for non-transfers) */}
                            {transaction.type !== 'transfer' && (
                                <div className="p-3 bg-muted/20 border border-border/50 rounded-lg flex items-start gap-3 col-span-1 sm:col-span-2">
                                    <div className="p-2 rounded-md bg-background border border-border/60 text-muted-foreground shrink-0">
                                        <Tag className="h-4 w-4" />
                                    </div>
                                    <div className="space-y-0.5 overflow-hidden">
                                        <p className="text-[11px] font-medium text-muted-foreground">Category</p>
                                        <p className="text-xs font-semibold text-foreground truncate">
                                            {transaction.category?.name || <span className="text-muted-foreground font-normal italic">Uncategorized</span>}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="p-3.5 bg-muted/20 border border-border/50 rounded-lg space-y-1.5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <FileText className="h-3.5 w-3.5" />
                                <span className="text-[11px] font-medium">Description</span>
                            </div>
                            <p className="text-xs text-foreground leading-relaxed">
                                {transaction.description ? (
                                    transaction.description
                                ) : (
                                    <span className="text-muted-foreground italic">No description provided for this transaction.</span>
                                )}
                            </p>
                        </div>

                        {/* Timestamps */}
                        
                    </div>
                </div>

                {/* Fixed Accessible Footer */}
                <SheetFooter className="p-4 border-t bg-background/95 backdrop-blur gap-2 sm:gap-2 flex-row justify-end items-center">
                    {onDelete && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                                onOpenChange(false);
                                onDelete(transaction);
                            }}
                            className="gap-1.5 border-rose-500/30 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 dark:hover:text-rose-300 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                    )}
                    {onEdit && (
                        <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => {
                                onOpenChange(false);
                                onEdit(transaction);
                            }}
                            className="gap-1.5"
                        >
                            <Pencil className="h-4 w-4" /> Edit
                        </Button>
                    )}
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}