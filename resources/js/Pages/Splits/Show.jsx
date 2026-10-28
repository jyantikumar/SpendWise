import { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Plus, CheckCircle2, ArrowRight, Pencil, Trash2, ChevronLeft, ChevronRight, MoreHorizontal, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function SplitShow({ auth, splitEvent, totalSpent, balances, debtBreakdown = [], itemizedShares = {} }) {
    const [expenseModal, setExpenseModal] = useState(false);
    const [settleModal, setSettleModal] = useState(false);
    const [editingExpense, setEditingExpense] = useState(null);
    const [deletingExpense, setDeletingExpense] = useState(null);

    // Settlement CRUD states
    const [editingSettlement, setEditingSettlement] = useState(null);
    const [deletingSettlement, setDeletingSettlement] = useState(null);

    // Filter state for Expenses & Settlements view ('all' | 'expenses' | 'settlements')
    const [historyFilter, setHistoryFilter] = useState('all');

    // Get user's preferred currency from auth props (defaults to PHP if not set)
    const userCurrency = auth?.user?.currency || 'PHP';

    // Check if everything is fully settled
    const isSettled = splitEvent.status === 'settled' || debtBreakdown.length === 0;

    // Pagination metadata from paginated splitEvent.expenses relationship
    const expensesData = splitEvent.expenses?.data || [];
    const prevLink = splitEvent.expenses?.prev_page_url;
    const nextLink = splitEvent.expenses?.next_page_url;
    const currentPage = splitEvent.expenses?.current_page || 1;
    const lastPage = splitEvent.expenses?.last_page || 1;
    const fromRecord = splitEvent.expenses?.from || 0;
    const toRecord = splitEvent.expenses?.to || 0;
    const totalRecords = splitEvent.expenses?.total || 0;

    // Expense Form
    const expenseForm = useForm({
        description: '',
        amount: '',
        paid_by: 'You',
        participants: 'You, Smith, Anna',
    });

    // Settlement Form
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

    const openCreateSettlementModal = () => {
        setEditingSettlement(null);
        settleForm.reset();
        settleForm.setData({
            payer_name: 'You',
            payee_name: '',
            amount: '',
            paid_at: new Date().toISOString().split('T')[0],
        });
        setSettleModal(true);
    };

    const openEditSettlementModal = (settlement) => {
        setEditingSettlement(settlement);
        settleForm.setData({
            payer_name: settlement.payer_name,
            payee_name: settlement.payee_name,
            amount: settlement.amount,
            paid_at: settlement.paid_at || new Date().toISOString().split('T')[0],
        });
        setSettleModal(true);
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
        if (editingSettlement) {
            settleForm.put(route('splits.settlements.update', [splitEvent.id, editingSettlement.id]), {
                onSuccess: () => {
                    settleForm.reset();
                    setEditingSettlement(null);
                    setSettleModal(false);
                },
            });
        } else {
            settleForm.post(route('splits.settlements.store', splitEvent.id), {
                onSuccess: () => {
                    settleForm.reset();
                    setSettleModal(false);
                },
            });
        }
    };

    const handleDeleteSettlement = () => {
        if (!deletingSettlement) return;
        router.delete(route('splits.settlements.destroy', [splitEvent.id, deletingSettlement.id]), {
            onSuccess: () => {
                setDeletingSettlement(null);
            },
        });
    };

    return (
        <AppLayout title={splitEvent.title} headerTitle={splitEvent.title}>
            <div className="flex flex-col w-full space-y-6">
                {/* Top Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 h-9 text-xs">
                            <Link href={route('splits.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Splits
                            </Link>
                        </Button>
                        <Badge variant="outline" className={`text-[10px] tracking-wider py-1 px-2.5 flex items-center gap-1.5 ${
                            isSettled 
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60' 
                                : 'bg-zinc-900/60 text-zinc-400 border-zinc-800'
                        }`}>
                            {isSettled ? (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                    <span>PAID & SETTLED</span>
                                </>
                            ) : (
                                <span>{splitEvent.status.toUpperCase()}</span>
                            )}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {!isSettled && (
                            <Button variant="outline" onClick={openCreateSettlementModal} className="flex-1 sm:flex-initial border-zinc-800 text-zinc-200 hover:bg-zinc-900 hover:text-zinc-100 h-9 text-xs">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-zinc-400" /> Settle Up
                            </Button>
                        )}

                        <Button onClick={openCreateExpenseModal} className="flex-1 sm:flex-initial h-9 text-xs">
                            <Plus className="mr-2 h-4 w-4" /> Add Expense
                        </Button>

                        {/* Settlement Modal (Create & Edit) */}
                        <Dialog open={settleModal} onOpenChange={setSettleModal}>
                            <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
                                <DialogHeader>
                                    <DialogTitle className="text-sm font-semibold text-zinc-100">
                                        {editingSettlement ? 'Edit Settlement' : 'Record Payment / Settlement'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSettleSubmit} className="space-y-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="payer_name" className="text-xs text-zinc-300">Who Paid?</Label>
                                        <Input
                                            id="payer_name"
                                            value={settleForm.data.payer_name}
                                            onChange={(e) => settleForm.setData('payer_name', e.target.value)}
                                            className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                            placeholder="e.g. You or Smith"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="payee_name" className="text-xs text-zinc-300">Who Received?</Label>
                                        <Input
                                            id="payee_name"
                                            value={settleForm.data.payee_name}
                                            onChange={(e) => settleForm.setData('payee_name', e.target.value)}
                                            className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                            placeholder="e.g. Anna"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="amount" className="text-xs text-zinc-300">Amount ({userCurrency})</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            value={settleForm.data.amount}
                                            onChange={(e) => settleForm.setData('amount', e.target.value)}
                                            className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                            placeholder="500.00"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="paid_at" className="text-xs text-zinc-300">Date</Label>
                                        <Input
                                            id="paid_at"
                                            type="date"
                                            value={settleForm.data.paid_at}
                                            onChange={(e) => settleForm.setData('paid_at', e.target.value)}
                                            className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                        />
                                    </div>

                                    <DialogFooter className="pt-2">
                                        <Button type="submit" disabled={settleForm.processing} className="h-9 text-xs">
                                            {editingSettlement ? 'Save Changes' : 'Save Settlement'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>

                        {/* Add/Edit Expense Modal */}
                        <Dialog open={expenseModal} onOpenChange={setExpenseModal}>
                            <DialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
                                <DialogHeader>
                                    <DialogTitle className="text-sm font-semibold text-zinc-100">
                                        {editingExpense ? 'Edit Shared Expense' : 'Add Shared Expense'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleExpenseSubmit} className="space-y-4 pt-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="description" className="text-xs text-zinc-300">Expense Description</Label>
                                        <Input
                                            id="description"
                                            value={expenseForm.data.description}
                                            onChange={(e) => expenseForm.setData('description', e.target.value)}
                                            placeholder="e.g. Dinner at Seaside"
                                            className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="amount" className="text-xs text-zinc-300">Total Amount ({userCurrency})</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            value={expenseForm.data.amount}
                                            onChange={(e) => expenseForm.setData('amount', e.target.value)}
                                            placeholder="1500.00"
                                            className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="paid_by" className="text-xs text-zinc-300">Paid By</Label>
                                        <Input
                                            id="paid_by"
                                            value={expenseForm.data.paid_by}
                                            onChange={(e) => expenseForm.setData('paid_by', e.target.value)}
                                            placeholder="You or friend's name"
                                            className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs text-zinc-300">Participants (comma separated)</Label>
                                        <Input
                                            value={expenseForm.data.participants}
                                            onChange={(e) => expenseForm.setData('participants', e.target.value)}
                                            placeholder="You, Smith, Anna"
                                            className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                        />
                                        <p className="text-[11px] text-zinc-500">Split equally among listed names.</p>
                                    </div>

                                    <DialogFooter className="pt-2">
                                        <Button type="submit" disabled={expenseForm.processing} className="h-9 text-xs">
                                            {editingExpense ? 'Save Changes' : 'Save Expense'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Tabs Component Container */}
                <Tabs defaultValue="expenses" className="flex flex-col w-full space-y-4">
                    <TabsList className="grid w-full grid-cols-3 bg-zinc-900 border border-zinc-800 text-zinc-400 p-1 h-9">
                        <TabsTrigger value="expenses" className="text-xs h-7 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
                            Expenses
                        </TabsTrigger>
                        <TabsTrigger value="summary" className="text-xs h-7 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
                            Summary
                        </TabsTrigger>
                        <TabsTrigger value="breakdown" className="text-xs h-7 data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100">
                            Itemized
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Expenses Content */}
                    <TabsContent value="expenses" className="flex flex-col w-full mt-0">
                        <Card className="border-zinc-800 w-full">
                            <CardHeader className="p-4 sm:p-6 pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-zinc-200">Logged Expenses & History</CardTitle>
                                
                                {/* Dropdown Filter for Expenses vs Settlements */}
                                <Select value={historyFilter} onValueChange={setHistoryFilter}>
                                    <SelectTrigger className="h-8 w-[140px] border-zinc-800 bg-zinc-900 text-xs text-zinc-300">
                                        <Filter className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                                        <SelectValue placeholder="Filter view" />
                                    </SelectTrigger>
                                    <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                        <SelectItem value="all" className="text-xs">All Activity</SelectItem>
                                        <SelectItem value="expenses" className="text-xs">Expenses</SelectItem>
                                        <SelectItem value="settlements" className="text-xs">Settlements</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 sm:pt-0 space-y-6">
                                {/* Expenses Section */}
                                {(historyFilter === 'all' || historyFilter === 'expenses') && (
                                    <div>
                                        {historyFilter === 'all' && (
                                            <h4 className="text-[11px]     uppercase tracking-wider text-zinc-500 mb-2.5">Shared Expenses</h4>
                                        )}
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                                                        <TableHead className="text-zinc-400 text-xs py-2">Description</TableHead>
                                                        <TableHead className="text-zinc-400 text-xs py-2">Paid By</TableHead>
                                                        <TableHead className="text-zinc-400 text-xs py-2">Split Between</TableHead>
                                                        <TableHead className="text-right text-zinc-400 text-xs py-2">Amount</TableHead>
                                                        <TableHead className="text-right text-zinc-400 text-xs py-2">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {expensesData.length === 0 ? (
                                                        <TableRow className="border-b border-zinc-800">
                                                            <TableCell colSpan={5} className="h-16 text-center text-zinc-500 text-xs">
                                                                No expenses logged in this event yet.
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        expensesData.map((expense) => (
                                                            <TableRow key={expense.id} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                                                                <TableCell className="font-medium text-zinc-200 text-xs py-2.5">
                                                                    {expense.description}
                                                                </TableCell>
                                                                <TableCell className="text-xs text-zinc-300 py-2.5">
                                                                    <span className="font-medium text-zinc-100">{expense.paid_by}</span>
                                                                </TableCell>
                                                                <TableCell className="text-xs text-zinc-400 py-2.5">
                                                                    {expense.shares.length} people
                                                                </TableCell>
                                                                <TableCell className="text-right font-semibold text-zinc-100 text-xs py-2.5">
                                                                    {formatCurrency(expense.amount, userCurrency)}
                                                                </TableCell>
                                                                <TableCell className="text-right py-2.5">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                                                                                <MoreHorizontal className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                                                            <DropdownMenuItem onClick={() => openEditExpenseModal(expense)} className="text-xs">
                                                                                <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem onClick={() => setDeletingExpense(expense)} className="text-xs text-rose-400 focus:text-rose-400">
                                                                                <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        <div className="divide-y divide-zinc-800 md:hidden">
                                            {expensesData.length === 0 ? (
                                                <p className="text-xs text-zinc-500 text-center py-4">No expenses logged in this event yet.</p>
                                            ) : (
                                                expensesData.map((expense) => (
                                                    <div key={expense.id} className="py-3 flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="font-medium text-zinc-200 text-xs">{expense.description}</p>
                                                            <p className="text-[11px] text-zinc-400 mt-0.5">
                                                                Paid by <span className="text-zinc-200">{expense.paid_by}</span> • {expense.shares.length} people
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-right text-xs font-semibold text-zinc-100">
                                                                {formatCurrency(expense.amount, userCurrency)}
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-zinc-100">
                                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                                                    <DropdownMenuItem onClick={() => openEditExpenseModal(expense)} className="text-xs">
                                                                        <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => setDeletingExpense(expense)} className="text-xs text-rose-400 focus:text-rose-400">
                                                                        <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Settlements Section */}
                                {(historyFilter === 'all' || historyFilter === 'settlements') && splitEvent.settlements.length > 0 && (
                                    <div className={historyFilter === 'all' ? 'pt-4 border-t border-zinc-800' : ''}>
                                        <h4 className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2.5">Settlement Paybacks Logged</h4>
                                        <div className="divide-y divide-zinc-800">
                                            {splitEvent.settlements.map((settlement) => (
                                                <div key={settlement.id} className="py-2.5 flex items-center justify-between text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                                        <p className="text-zinc-300">
                                                            <span className="font-medium text-zinc-100">{settlement.payer_name}</span> paid <span className="font-medium text-zinc-100">{settlement.payee_name}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-zinc-200    ">{formatCurrency(settlement.amount, userCurrency)}</span>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
                                                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                                                <DropdownMenuItem onClick={() => openEditSettlementModal(settlement)} className="text-xs">
                                                                    <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => setDeletingSettlement(settlement)} className="text-xs text-rose-400 focus:text-rose-400">
                                                                    <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>

                            {/* Transaction-style Pagination Footer */}
                            {totalRecords > 0 && (
                                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 p-4 sm:px-6 text-xs text-zinc-400">
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
                    </TabsContent>

                    {/* Tab 2: Summary & Paybacks Content */}
                    <TabsContent value="summary" className="flex flex-col w-full mt-0">
                        <Card className="border-zinc-800 w-full">
                            <CardHeader className="p-4 sm:p-6 pb-3">
                                <CardTitle className="text-sm font-semibold text-zinc-200">Summary & Paybacks</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 sm:pt-0 space-y-4">
                                <div className="py-2.5 border-b border-zinc-800 flex items-center justify-between text-xs">
                                    <span className="text-zinc-400">Total Event Spend</span>
                                    <span className="font-semibold text-zinc-100">{formatCurrency(totalSpent, userCurrency)}</span>
                                </div>

                                <div className="space-y-2 pt-1">
                                    <h4 className="text-[11px] uppercase tracking-wider text-zinc-500">Who Needs to Pay Whom</h4>
                                    {debtBreakdown.length === 0 ? (
                                        <p className="text-xs text-zinc-500 py-2">All balances are settled or no expenses entered.</p>
                                    ) : (
                                        <div className="divide-y divide-zinc-800 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 space-y-2">
                                            {debtBreakdown.map((debt, index) => (
                                                <div key={index} className="py-2 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                                                    <span className="text-zinc-200 font-medium flex items-center gap-1.5">
                                                        {debt.from} <ArrowRight className="h-3.5 w-3.5 text-zinc-500" /> {debt.to}
                                                    </span>
                                                    <span className="font-semibold text-zinc-100 bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                                                        {formatCurrency(debt.amount, userCurrency)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Itemized Breakdown Content */}
                    <TabsContent value="breakdown" className="flex flex-col w-full mt-0">
                        <Card className="border-zinc-800 w-full">
                            <CardHeader className="p-4 sm:p-6 pb-3">
                                <CardTitle className="text-sm font-semibold text-zinc-200">Itemized Share Breakdown per Participant</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-6 sm:pt-0 space-y-4">
                                {Object.keys(itemizedShares).length === 0 ? (
                                    <p className="text-xs text-zinc-500 py-2">No share breakdown available yet.</p>
                                ) : (
                                    Object.entries(itemizedShares).map(([person, shares]) => {
                                        const totalPersonShare = shares.reduce((acc, curr) => acc + Number(curr.share_amount), 0);
                                        return (
                                            <div key={person} className="border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <h4 className="font-semibold text-zinc-100 text-xs">{person}</h4>
                                                    <span className="text-[11px] text-zinc-300 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                                                        Total Share: {formatCurrency(totalPersonShare, userCurrency)}
                                                    </span>
                                                </div>
                                                <div className="space-y-1 pl-2">
                                                    {shares.map((item, idx) => (
                                                        <div key={idx} className="flex items-center justify-between text-xs text-zinc-400">
                                                            <span>
                                                                • {item.description} ({formatCurrency(item.total_amount, userCurrency)} ÷ {item.split_count})
                                                            </span>
                                                            <span className="text-zinc-200">
                                                                = {formatCurrency(item.share_amount, userCurrency)}
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
                    </TabsContent>
                </Tabs>
            </div>

            {/* Delete Expense Alert Dialog */}
            <AlertDialog open={!!deletingExpense} onOpenChange={(open) => !open && setDeletingExpense(null)}>
                <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-semibold text-zinc-100">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-zinc-400">
                            This will permanently delete this logged expense and recalculate the shares.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs h-9">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteExpense} className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Settlement Alert Dialog */}
            <AlertDialog open={!!deletingSettlement} onOpenChange={(open) => !open && setDeletingSettlement(null)}>
                <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-semibold text-zinc-100">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-zinc-400">
                            This will permanently delete this settlement record and recalculate balances.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs h-9">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSettlement} className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}