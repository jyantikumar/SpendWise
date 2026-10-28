import { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Plus, CheckCircle2, ArrowRight, Pencil, Trash2 } from 'lucide-react';

export default function SplitShow({ splitEvent, totalSpent, balances, debtBreakdown = [], itemizedShares = {} }) {
    const [expenseModal, setExpenseModal] = useState(false);
    const [settleModal, setSettleModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [deletingExpense, setDeletingExpense] = useState(null);

    // Expense Form
    const expenseForm = useForm({
        description: '',
        amount: '',
        paid_by: 'You',
        participants: 'You, Smith, Anna',
    });

    const settleForm = useForm({
        payer_name: 'You',
        payee_name: '',
        amount: '',
        paid_at: new Date().toISOString().split('T')[0],
    });

    const openCreateExpenseModal = () => {
        setEditingExpense(null);
        expenseForm.reset();
        expenseForm.setData({
            description: '',
            amount: '',
            paid_by: 'You',
            participants: 'You, Smith, Anna',
        });
        setExpenseModal(true);
    };

    const openEditExpenseModal = (expense) => {
        setEditingExpense(expense);
        const participantNames = expense.shares.map(s => s.participant_name).join(', ');
        expenseForm.setData({
            description: expense.description,
            amount: expense.amount,
            paid_by: expense.paid_by,
            participants: participantNames,
        });
        setExpenseModal(true);
    };

    const handleExpenseSubmit = (e) => {
        e.preventDefault();
        const participantsArray = expenseForm.data.participants
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        const payload = {
            description: expenseForm.data.description,
            amount: expenseForm.data.amount,
            paid_by: expenseForm.data.paid_by,
            participants: participantsArray,
        };

        if (editingExpense) {
            router.put(route('splits.expenses.update', [splitEvent.id, editingExpense.id]), payload, {
                onSuccess: () => {
                    expenseForm.reset();
                    setEditingExpense(null);
                    setExpenseModal(false);
                },
            });
        } else {
            router.post(route('splits.expenses.store', splitEvent.id), payload, {
                onSuccess: () => {
                    expenseForm.reset();
                    setExpenseModal(false);
                },
            });
        }
    };
    const handleDeleteExpense = () => {
        if (!deletingExpense) return;
        router.delete(route('splits.expenses.destroy', [splitEvent.id, deletingExpense.id]), {
            onSuccess: () => {
                setDeletingExpense(null);
            },
        });
    };

    const handleSettleSubmit = (e) => {
        e.preventDefault();
        settleForm.post(route('splits.settlements.store', splitEvent.id), {
            onSuccess: () => {
                settleForm.reset();
                setSettleModal(false);
            },
        });
    };

    return (
        <AppLayout title={splitEvent.title} headerTitle={splitEvent.title}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100">
                            <Link href={route('splits.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Splits
                            </Link>
                        </Button>
                        <Badge variant="outline" className={`border-zinc-800 font-mono text-[10px] tracking-wider ${splitEvent.status === 'settled' ? 'bg-zinc-900 text-zinc-200' : 'bg-zinc-900/60 text-zinc-400'}`}>
                            {splitEvent.status.toUpperCase()}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        <Dialog open={settleModal} onOpenChange={setSettleModal}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-zinc-800 text-zinc-200 hover:bg-zinc-900 hover:text-zinc-100">
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-zinc-400" /> Settle Up
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="border-zinc-800 text-zinc-100">
                                <DialogHeader>
                                    <DialogTitle className="text-zinc-100">Record Payment / Settlement</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSettleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="payer_name" className="text-zinc-300">Who Paid?</Label>
                                        <Input
                                            id="payer_name"
                                            value={settleForm.data.payer_name}
                                            onChange={(e) => settleForm.setData('payer_name', e.target.value)}
                                            className="border-zinc-800 text-zinc-100 mt-1 focus-visible:ring-zinc-600"
                                            placeholder="e.g. You or Smith"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="payee_name" className="text-zinc-300">Who Received?</Label>
                                        <Input
                                            id="payee_name"
                                            value={settleForm.data.payee_name}
                                            onChange={(e) => settleForm.setData('payee_name', e.target.value)}
                                            className="border-zinc-800 text-zinc-100 mt-1 focus-visible:ring-zinc-600"
                                            placeholder="e.g. Anna"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="amount" className="text-zinc-300">Amount (₱)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            value={settleForm.data.amount}
                                            onChange={(e) => settleForm.setData('amount', e.target.value)}
                                            className="border-zinc-800 text-zinc-100 mt-1 focus-visible:ring-zinc-600"
                                            placeholder="500.00"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="paid_at" className="text-zinc-300">Date</Label>
                                        <Input
                                            id="paid_at"
                                            type="date"
                                            value={settleForm.data.paid_at}
                                            onChange={(e) => settleForm.setData('paid_at', e.target.value)}
                                            className="border-zinc-800 text-zinc-100 mt-1 focus-visible:ring-zinc-600"
                                        />
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit" disabled={settleForm.processing} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium">
                                            Save Settlement
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        <Button onClick={openCreateExpenseModal} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium">
                            <Plus className="mr-2 h-4 w-4" /> Add Expense
                        </Button>

                        {/* Add/Edit Expense Modal */}
                        <Dialog open={expenseModal} onOpenChange={setExpenseModal}>
                            <DialogContent className="border-zinc-800 text-zinc-100">
                                <DialogHeader>
                                    <DialogTitle className="text-zinc-100">
                                        {editingExpense ? 'Edit Shared Expense' : 'Add Shared Expense'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="description" className="text-zinc-300">Expense Description</Label>
                                        <Input
                                            id="description"
                                            value={expenseForm.data.description}
                                            onChange={(e) => expenseForm.setData('description', e.target.value)}
                                            placeholder="e.g. Dinner at Seaside"
                                            className="border-zinc-800 text-zinc-100 mt-1 focus-visible:ring-zinc-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="amount" className="text-zinc-300">Total Amount (₱)</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            value={expenseForm.data.amount}
                                            onChange={(e) => expenseForm.setData('amount', e.target.value)}
                                            placeholder="1500.00"
                                            className="border-zinc-800 text-zinc-100 mt-1 focus-visible:ring-zinc-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="paid_by" className="text-zinc-300">Paid By</Label>
                                        <Input
                                            id="paid_by"
                                            value={expenseForm.data.paid_by}
                                            onChange={(e) => expenseForm.setData('paid_by', e.target.value)}
                                            placeholder="You or friend's name"
                                            className="border-zinc-800 text-zinc-100 mt-1 focus-visible:ring-zinc-600"
                                        />
                                    </div>

                                    <div>
                                        <Label className="mb-2 block text-zinc-300">Participants (comma separated)</Label>
                                        <Input
                                            value={expenseForm.data.participants}
                                            onChange={(e) => expenseForm.setData('participants', e.target.value)}
                                            placeholder="You, Smith, Anna"
                                            className="border-zinc-800 text-zinc-100 mt-1 focus-visible:ring-zinc-600"
                                        />
                                        <p className="text-xs text-zinc-500 mt-1">Split equally among listed names.</p>
                                    </div>

                                    <DialogFooter>
                                        <Button type="submit" disabled={expenseForm.processing} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium">
                                            {editingExpense ? 'Save Changes' : 'Save Expense'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Logged Expenses & History Table */}
                        <Card className="border-zinc-800 shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base text-zinc-200">Logged Expenses & History</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-0 sm:p-6 sm:pt-0">
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b border-zinc-800">
                                                <TableHead className="text-zinc-400">Description</TableHead>
                                                <TableHead className="text-zinc-400">Paid By</TableHead>
                                                <TableHead className="text-zinc-400">Split Between</TableHead>
                                                <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                                <TableHead className="text-right text-zinc-400">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {splitEvent.expenses.length === 0 ? (
                                                <TableRow className="border-b border-zinc-800">
                                                    <TableCell colSpan={5} className="h-24 text-center text-zinc-500 font-mono text-xs">
                                                        No expenses logged in this event yet.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                splitEvent.expenses.map((expense) => (
                                                    <TableRow key={expense.id} className="border-b border-zinc-800 hover:bg-zinc-900/40">
                                                        <TableCell className="font-medium text-zinc-200 text-sm">
                                                            {expense.description}
                                                        </TableCell>
                                                        <TableCell className="text-xs text-zinc-300">
                                                            <span className="font-medium text-zinc-100">{expense.paid_by}</span>
                                                        </TableCell>
                                                        <TableCell className="text-xs text-zinc-400 font-mono">
                                                            {expense.shares.length} people
                                                        </TableCell>
                                                        <TableCell className="text-right font-semibold text-zinc-100 font-mono text-sm">
                                                            ₱{Number(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => openEditExpenseModal(expense)}
                                                                    className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                                                                    title="Edit Expense"
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => setDeletingExpense(expense)}
                                                                    className="h-7 w-7 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30"
                                                                    title="Delete Expense"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="divide-y divide-zinc-800 md:hidden px-4 sm:px-0">
                                    {splitEvent.expenses.length === 0 ? (
                                        <p className="text-sm text-zinc-500 text-center py-6 font-mono">No expenses logged in this event yet.</p>
                                    ) : (
                                        splitEvent.expenses.map((expense) => (
                                            <div key={expense.id} className="py-3 flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-zinc-200 text-sm">{expense.description}</p>
                                                    <p className="text-xs text-zinc-400">
                                                        Paid by <span className="text-zinc-200">{expense.paid_by}</span> • {expense.shares.length} people
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right font-mono text-sm font-semibold text-zinc-100">
                                                        ₱{Number(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditExpenseModal(expense)} className="h-7 w-7 text-zinc-400">
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => setDeletingExpense(expense)} className="h-7 w-7 text-zinc-400 hover:text-rose-400">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {splitEvent.settlements.length > 0 && (
                                    <div className="mt-6 pt-6 border-t border-zinc-800 px-4 sm:px-0">
                                        <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-3">Settlement Paybacks Logged</h4>
                                        <div className="space-y-3">
                                            {splitEvent.settlements.map((settlement) => (
                                                <div key={settlement.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/60 border border-zinc-800">
                                                    <div className="flex items-center gap-2.5">
                                                        <CheckCircle2 className="h-4 w-4 text-zinc-400" />
                                                        <p className="text-sm text-zinc-300">
                                                            <span className="font-medium text-zinc-100">{settlement.payer_name}</span> paid <span className="font-medium text-zinc-100">{settlement.payee_name}</span>
                                                        </p>
                                                    </div>
                                                    <span className="font-semibold text-zinc-200 font-mono text-sm">₱{Number(settlement.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Itemized Share Breakdown per Participant */}
                        <Card className="border-zinc-800 shadow-none">
                            <CardHeader>
                                <CardTitle className="text-base text-zinc-200">Itemized Share Breakdown per Participant</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 p-4 sm:p-6 sm:pt-0">
                                {Object.keys(itemizedShares).length === 0 ? (
                                    <p className="text-sm text-zinc-500 font-mono py-2">No share breakdown available yet.</p>
                                ) : (
                                    Object.entries(itemizedShares).map(([person, shares]) => {
                                        const totalPersonShare = shares.reduce((acc, curr) => acc + Number(curr.share_amount), 0);
                                        return (
                                            <div key={person} className="border-b border-zinc-800 pb-4 last:border-0 last:pb-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-semibold text-zinc-100 text-sm">{person}</h4>
                                                    <span className="text-xs font-mono text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                                        Total Share: ₱{totalPersonShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div className="space-y-1.5 pl-2">
                                                    {shares.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                                                            <span>
                                                                • {item.description} (₱{Number(item.total_amount).toFixed(2)} ÷ {item.split_count})
                                                            </span>
                                                            <span className="text-zinc-200">
                                                                = ₱{Number(item.share_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Summary & Paybacks */}
                    <div className="space-y-6">
                        <Card className="border-zinc-800 shadow-none">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-zinc-200">Summary & Paybacks</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-0 sm:p-6 sm:pt-0">
                                <div className="py-3 px-4 sm:px-0 border-b border-zinc-800 flex items-center justify-between">
                                    <span className="text-sm text-zinc-400">Total Event Spend</span>
                                    <span className="font-semibold text-zinc-100 font-mono text-sm">₱{Number(totalSpent).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>

                                <div className="space-y-1 pt-1">
                                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 px-4 sm:px-0 mb-2">Who Needs to Pay Whom</h4>
                                    {debtBreakdown.length === 0 ? (
                                        <p className="text-xs text-zinc-500 font-mono px-4 sm:px-0 py-2">All balances are settled or no expenses entered.</p>
                                    ) : (
                                        <div className="divide-y divide-zinc-800 px-4 sm:px-0">
                                            {debtBreakdown.map((debt, index) => (
                                                <div key={index} className="py-3 flex items-center justify-between">
                                                    <span className="text-zinc-200 text-sm font-medium flex items-center gap-1.5">
                                                        {debt.from} <ArrowRight className="h-3.5 w-3.5 text-zinc-500" /> {debt.to}
                                                    </span>
                                                    <span className="font-mono font-semibold text-zinc-100 text-xs bg-zinc-900 px-2.5 py-1 rounded border border-zinc-800">
                                                        ₱{Number(debt.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog open={!!deletingExpense} onOpenChange={(open) => !open && setDeletingExpense(null)}>
                <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            This will permanently delete this logged expense and recalculate the shares.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteExpense} className="bg-rose-600 hover:bg-rose-700 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}