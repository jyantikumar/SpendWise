import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Calendar,
    Wallet,
    Target,
    TrendingUp,
    CheckCircle2,
    Plus,
    FileText,
    MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import SavingsGoalFormModal from '@/Pages/Savings/components/SavingsGoalFormModal';
import TransactionFormModal from '@/Pages/Transactions/components/TransactionFormModal';
import { TransactionDetailSheet } from '@/Pages/Transactions/components/TransactionDetailSheet';

export default function SavingsShow({
    auth,
    goal,
    deposits = [],
    accounts = [],
    categories = [],
    accountTypes = [],
    savingsGoals = [],
}) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedDeposit, setSelectedDeposit] = useState(null);
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

    const userCurrency = auth?.user?.currency || 'PHP';

    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: userCurrency,
        }).format(val || 0);

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const toTransactionShape = (dep) => ({
        ...dep,
        type: 'income',
        date: dep.transaction_date,
        account: dep.account_name ? { name: dep.account_name } : null,
        category: dep.category_name ? { name: dep.category_name } : null,
        destination_account: null,
    });

    const openDepositDetail = (dep) => {
        setSelectedDeposit(dep);
        setIsDetailSheetOpen(true);
    };

    const handleDelete = () => {
        router.delete(route('savings.destroy', goal.id), {
            onSuccess: () => {
                toast.success('Savings goal deleted.');
            },
            onError: () => {
                toast.error('Failed to delete savings goal.');
            },
        });
    };

    const isCompleted = goal.status === 'completed';
    const depositCount = deposits.length;

    const openDepositModal = () => setIsDepositModalOpen(true);

    return (
        <AppLayout title={goal.title} headerTitle="Savings Goal">
            <div className="space-y-4 sm:space-y-6">
                {/* Back + Actions Bar */}
                <div className="flex items-center justify-between gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-zinc-400 hover:text-zinc-100 -ml-2 px-2 sm:px-3 text-xs sm:text-sm"
                    >
                        <Link href={route('savings.index')} className="flex items-center gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back</span>
                            <span className="hidden sm:inline">to Goals</span>
                        </Link>
                    </Button>

                    {/* Desktop actions — Add Deposit + ellipsis menu */}
                    <div className="hidden sm:flex items-center gap-2">
                        {!isCompleted && (
                            <Button
                                size="sm"
                                onClick={openDepositModal}
                                className="gap-1.5"
                            >
                                <Plus className="h-3.5 w-3.5" /> Add Deposit
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 border-zinc-800 text-zinc-400">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More options</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="gap-2 cursor-pointer">
                                    <Pencil className="h-3.5 w-3.5" /> Edit Goal
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="gap-2 text-rose-400 focus:text-rose-300 cursor-pointer">
                                    <Trash2 className="h-3.5 w-3.5" /> Delete Goal
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Mobile dropdown ellipsis menu */}
                    <div className="flex sm:hidden items-center gap-1.5">
                        {!isCompleted && (
                            <Button
                                size="sm"
                                onClick={openDepositModal}
                                className="gap-1 text-xs h-8 px-2.5"
                            >
                                <Plus className="h-3.5 w-3.5" /> Deposit
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="h-8 w-8 border-zinc-800 text-zinc-400">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More options</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="gap-2 cursor-pointer">
                                    <Pencil className="h-3.5 w-3.5" /> Edit Goal
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="gap-2 text-rose-400 focus:text-rose-300 cursor-pointer">
                                    <Trash2 className="h-3.5 w-3.5" /> Delete Goal
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* Hero / Progress Card */}
                <Card className="border-zinc-800">
                    <CardHeader className="p-4 sm:p-4 pb-1 sm:pb-1.5">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <CardTitle className="text-zinc-100 text-lg sm:text-xl flex items-center gap-1.5 flex-wrap">
                                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                                    <span className="truncate">{goal.title}</span>
                                </CardTitle>
                                {goal.description && (
                                    <CardDescription className="text-zinc-400 mt-0.5 text-xs sm:text-sm line-clamp-1">
                                        {goal.description}
                                    </CardDescription>
                                )}
                            </div>

                            {isCompleted ? (
                                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                    <CheckCircle2 className="h-3 w-3" /> Done
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                                    <TrendingUp className="h-3 w-3" /> Active
                                </span>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-4 pt-0 sm:pt-0 space-y-2 sm:space-y-2.5">
                        {/* Big numbers */}
                        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-end sm:justify-between">
                            <div>
                                <p className="text-[11px] sm:text-xs text-zinc-500">Saved so far</p>
                                <p className="text-xl sm:text-3xl font-bold text-emerald-400">
                                    {formatCurrency(goal.current_amount)}
                                </p>
                                <p className="text-[10px] sm:text-xs text-zinc-500">
                                    of {formatCurrency(goal.target_amount)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[11px] sm:text-xs text-zinc-500">Remaining</p>
                                <p className="text-base sm:text-xl font-semibold text-zinc-200">
                                    {formatCurrency(goal.remaining_amount)}
                                </p>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div>
                            <Progress value={goal.progress_percentage} className="h-2 sm:h-2.5" />
                            <div className="flex justify-between text-[10px] sm:text-[11px] text-zinc-500 mt-0.5">
                                <span>{goal.progress_percentage}% complete</span>
                                <span>{depositCount} deposit{depositCount === 1 ? '' : 's'}</span>
                            </div>
                        </div>

                        {/* Meta row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 pt-1.5 sm:pt-2 border-t border-zinc-800">
                            <div className="flex items-center gap-1.5 text-xs">
                                <Calendar className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-zinc-500">Target Date</p>
                                    <p className="text-zinc-200 font-medium truncate text-[11px] sm:text-xs">
                                        {formatDate(goal.target_date)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                                <Wallet className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-zinc-500">Target Amount</p>
                                    <p className="text-zinc-200 font-medium truncate text-[11px] sm:text-xs">
                                        {formatCurrency(goal.target_amount)}
                                    </p>
                                </div>
                            </div>
                            <div className="col-span-2 sm:col-span-1 flex items-center gap-1.5 text-xs">
                                <TrendingUp className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[10px] text-zinc-500">Status</p>
                                    <p className={`font-medium truncate text-[11px] sm:text-xs ${isCompleted ? 'text-emerald-400' : 'text-blue-400'}`}>
                                        {isCompleted ? 'Completed' : 'Active'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Deposit History */}
                <Card className="border-zinc-800">
                    <CardHeader className="p-3.5 sm:p-6 pb-2 sm:pb-3">
                        <CardTitle className="text-zinc-200 flex items-center gap-2 text-sm sm:text-base">
                            <FileText className="h-4 w-4 text-zinc-400" />
                            Deposit History
                        </CardTitle>
                        <CardDescription className="text-zinc-400 text-xs">
                            Every savings deposit linked to this goal.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0">
                        {/* Mobile list */}
                        <div className="md:hidden">
                            {deposits.length > 0 ? (
                                <div className="divide-y divide-zinc-800/70 px-3.5">
                                    {deposits.map((dep) => (
                                        <div
                                            key={dep.id}
                                            onClick={() => openDepositDetail(dep)}
                                            className="py-3 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-zinc-900/40 transition-colors -mx-3.5 px-3.5"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mb-0.5">
                                                    <span>{formatDate(dep.transaction_date)}</span>
                                                    {dep.account_name && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="truncate">{dep.account_name}</span>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="font-medium text-xs sm:text-sm text-zinc-200 truncate">
                                                    {dep.description || (
                                                        <span className="text-zinc-500 italic">No description</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right font-semibold text-xs sm:text-sm text-emerald-400 whitespace-nowrap shrink-0">
                                                +{formatCurrency(dep.amount)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 px-4 text-zinc-400 text-xs sm:text-sm">
                                    No deposits recorded yet.
                                    {!isCompleted && (
                                        <div className="mt-2.5">
                                            <Button size="sm" onClick={openDepositModal} className="gap-1.5 text-xs h-8">
                                                <Plus className="h-3.5 w-3.5" /> Add Deposit
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Desktop table */}
                        <div className="hidden md:block px-3 sm:px-4">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-800/70 hover:bg-transparent">
                                        <TableHead className="text-zinc-400">Date</TableHead>
                                        <TableHead className="text-zinc-400">Description</TableHead>
                                        <TableHead className="text-zinc-400">Account</TableHead>
                                        <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {deposits.length > 0 ? (
                                        deposits.map((dep) => (
                                            <TableRow
                                                key={dep.id}
                                                onClick={() => openDepositDetail(dep)}
                                                className="border-b border-zinc-800/70 cursor-pointer hover:bg-zinc-900/40 transition-colors"
                                            >
                                                <TableCell className="font-medium whitespace-nowrap text-zinc-300 text-xs">
                                                    {formatDate(dep.transaction_date)}
                                                </TableCell>
                                                <TableCell className="max-w-[240px] truncate text-zinc-300 text-sm">
                                                    {dep.description || (
                                                        <span className="text-zinc-500 text-xs italic">
                                                            No description
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-xs text-zinc-400">
                                                    {dep.account_name || '—'}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-sm text-emerald-400 whitespace-nowrap">
                                                    +{formatCurrency(dep.amount)}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow className="border-b border-zinc-800/70">
                                            <TableCell
                                                colSpan={4}
                                                className="h-24 text-center text-zinc-400"
                                            >
                                                No deposits recorded yet.
                                                {!isCompleted && (
                                                    <div className="mt-3">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={openDepositModal}
                                                            className="gap-1.5 border-zinc-700 text-zinc-300"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" /> Add First Deposit
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Deposit Detail Sheet */}
            <TransactionDetailSheet
                open={isDetailSheetOpen}
                onOpenChange={(open) => {
                    setIsDetailSheetOpen(open);
                    if (!open) setSelectedDeposit(null);
                }}
                transaction={selectedDeposit ? toTransactionShape(selectedDeposit) : null}
                currentDate={formatDate(new Date().toISOString())}
                userCurrency={userCurrency}
            />

            {/* Modals */}
            <SavingsGoalFormModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                editingGoal={goal}
            />

            <TransactionFormModal
                isOpen={isDepositModalOpen}
                onClose={() => setIsDepositModalOpen(false)}
                editingTransaction={null}
                accounts={accounts}
                categories={categories}
                accountTypes={accountTypes}
                savingsGoals={savingsGoals}
            />

            <AlertDialog
                open={isDeleteDialogOpen}
                onOpenChange={(open) => !open && setIsDeleteDialogOpen(false)}
            >
                <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base sm:text-lg">Delete this savings goal?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs sm:text-sm">
                            This will permanently remove <strong>{goal.title}</strong>.
                            Your deposit transactions will be preserved but unlinked from this goal.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                        <AlertDialogCancel className="mt-0 text-xs sm:text-sm">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-rose-600 hover:bg-rose-700 text-xs sm:text-sm"
                        >
                            Delete Goal
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}