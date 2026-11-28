// resources/js/Pages/Accounts/components/ReconcileBalanceModal.jsx
import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Scale, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function ReconcileBalanceModal({
    isOpen,
    onClose,
    account = null,
    userCurrency = 'PHP',
}) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        actual_balance: '',
        notes: '',
    });

    const currentBalance = parseFloat(account?.balance || 0);
    const actualBalance = parseFloat(data.actual_balance || 0);
    const variance = actualBalance - currentBalance;
    const isZeroVariance = Math.abs(variance) < 0.01;

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(val || 0);

    useEffect(() => {
        if (!isOpen) return;
        clearErrors();
        if (account) {
            setData({
                actual_balance: String(account.balance || '0.00'),
                notes: '',
            });
        } else {
            reset();
        }
    }, [isOpen, account]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!account?.id) return;

        // Direct URI string instead of route('accounts.reconcile', account.id)
        post(`/accounts/${account.id}/reconcile`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Account "${account.name}" reconciled successfully.`);
                onClose();
                reset();
            },
            onError: () => {
                toast.error('Failed to reconcile account balance.');
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[460px] border-zinc-800 bg-zinc-950 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-zinc-100 text-base sm:text-lg">
                        <Scale className="h-5 w-5 text-zinc-400" />
                        Reconcile Balance — {account?.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400">
                        Match tracked balance with physical cash or mobile wallet totals. SpendWise will automatically record an audited adjustment entry.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Current vs Actual Comparison Box */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
                        <div>
                            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Tracked Balance</span>
                            <div className="text-sm font-semibold text-zinc-300 tabular-nums mt-0.5">
                                {formatCurrency(currentBalance)}
                            </div>
                        </div>
                        <div>
                            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Calculated Variance</span>
                            <div className={`text-sm font-semibold tabular-nums mt-0.5 flex items-center gap-1 ${
                                isZeroVariance
                                    ? 'text-zinc-400'
                                    : variance > 0
                                    ? 'text-emerald-400'
                                    : 'text-rose-400'
                            }`}>
                                {!isZeroVariance && (
                                    variance > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />
                                )}
                                {formatCurrency(variance)}
                            </div>
                        </div>
                    </div>

                    {/* Actual Balance Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">
                            Actual Counted Balance
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            value={data.actual_balance}
                            onChange={(e) => setData('actual_balance', e.target.value)}
                            placeholder="0.00"
                            className="h-10 text-sm border-zinc-800 bg-zinc-900 text-zinc-100"
                        />
                        {errors.actual_balance && (
                            <p className="text-xs text-rose-500">{errors.actual_balance}</p>
                        )}
                    </div>

                    {/* Dynamic Status Preview Banner */}
                    {!isZeroVariance && (
                        <div className={`p-3 rounded-md text-xs font-medium border flex items-center gap-2 ${
                            variance > 0
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                        }`}>
                            {variance > 0 ? (
                                <ArrowUpRight className="h-4 w-4 shrink-0" />
                            ) : (
                                <ArrowDownRight className="h-4 w-4 shrink-0" />
                            )}
                            <div>
                                Spending drift detected. Will log an <strong className="underline">{variance > 0 ? 'Income Adjustment' : 'Expense Adjustment'}</strong> of {formatCurrency(Math.abs(variance))}.
                            </div>
                        </div>
                    )}

                    {isZeroVariance && data.actual_balance !== '' && (
                        <div className="p-3 rounded-md text-xs font-medium border bg-zinc-900 border-zinc-800 text-zinc-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                            Balances match perfectly. No adjustment transaction needed.
                        </div>
                    )}

                    {/* Notes Input */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-zinc-300">
                            Audit Notes (Optional)
                        </label>
                        <Input
                            type="text"
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="e.g., Unlogged jeepney fare, cash cashback, change drift"
                            className="h-9 text-xs border-zinc-800 bg-zinc-900 text-zinc-100"
                        />
                        {errors.notes && (
                            <p className="text-xs text-rose-500">{errors.notes}</p>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 h-9 text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || isZeroVariance}
                            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-9 text-xs font-medium"
                        >
                            Confirm Reconciliation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}