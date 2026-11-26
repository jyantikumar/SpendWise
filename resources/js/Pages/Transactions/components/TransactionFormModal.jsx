// resources/js/Pages/Transactions/components/TransactionFormModal.jsx
import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import CategoryFormModal from '@/Pages/Categories/components/CategoryFormModal';
import AccountFormModal from '@/Pages/Accounts/components/AccountFormModal';

const DESCRIPTION_MAX = 255;
const NOTES_MAX = 2000;

const getTodayLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const counterClass = (length, max) => {
    const ratio = length / max;
    if (ratio >= 1) return 'text-rose-500 font-medium';
    if (ratio >= 0.8) return 'text-amber-500';
    return 'text-zinc-500';
};

export default function TransactionFormModal({
    isOpen,
    onClose,
    editingTransaction = null,
    accounts = [],
    categories = [],
    accountTypes = [],
    savingsGoals = [],
    defaultType = null,
    defaultSavingsGoalId = null,
}) {
    const isEditing = Boolean(editingTransaction);

    const [activeTab, setActiveTab] = useState('basic');
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    const availableAccounts = accounts.filter((acc) => {
        const isActive = Boolean(acc.is_active);
        const isCurrentlySelected = isEditing && String(acc.id) === String(editingTransaction?.account_id);
        return isActive || isCurrentlySelected;
    });

    const availableSavingsGoals = savingsGoals.filter((goal) => {
        const isActive = goal.status === 'active';
        const isCurrentlySelected = isEditing && String(goal.id) === String(editingTransaction?.savings_goal_id);
        const isDefault = defaultSavingsGoalId && String(goal.id) === String(defaultSavingsGoalId);
        return isActive || isCurrentlySelected || isDefault;
    });

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        account_id: '',
        destination_account_id: '',
        category_id: '',
        savings_goal_id: '',
        type: 'expense',
        amount: '',
        description: '',
        notes: '',
        transaction_date: getTodayLocal(),
    });

    useEffect(() => {
        if (!isOpen) return;

        clearErrors();
        setActiveTab('basic');

        if (editingTransaction) {
            const rawDate = editingTransaction.transaction_date || editingTransaction.date;
            const formattedDate = rawDate
                ? String(rawDate).split('T')[0]
                : getTodayLocal();

            setData({
                account_id: editingTransaction.account_id ? String(editingTransaction.account_id) : '',
                destination_account_id: editingTransaction.destination_account_id
                    ? String(editingTransaction.destination_account_id)
                    : '',
                category_id: editingTransaction.category_id ? String(editingTransaction.category_id) : '',
                savings_goal_id: editingTransaction.savings_goal_id
                    ? String(editingTransaction.savings_goal_id)
                    : '',
                type: editingTransaction.type || 'expense',
                amount: editingTransaction.amount ? String(editingTransaction.amount) : '',
                description: editingTransaction.description || '',
                notes: editingTransaction.notes || '',
                transaction_date: formattedDate,
            });
        } else {
            reset();

            const defaultAccount = availableAccounts[0];

            setData({
                account_id: defaultAccount?.id ? String(defaultAccount.id) : '',
                destination_account_id: '',
                category_id: '',
                savings_goal_id: defaultSavingsGoalId ? String(defaultSavingsGoalId) : '',
                type: defaultType || 'expense',
                amount: '',
                description: '',
                notes: '',
                transaction_date: getTodayLocal(),
            });
        }
    }, [isOpen, editingTransaction, accounts, defaultType, defaultSavingsGoalId]);

    const handleAccountCreated = (page) => {
        const updatedAccounts = page.props.accounts || [];
        const latestAccount = updatedAccounts[updatedAccounts.length - 1];
        if (latestAccount) {
            setData('account_id', String(latestAccount.id));
        }
    };

    const handleCategoryCreated = (page) => {
        const updatedCategories = page.props.categories || [];
        const latestCategory = updatedCategories[updatedCategories.length - 1];
        if (latestCategory) {
            setData('category_id', String(latestCategory.id));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('transactions.update', editingTransaction.id), {
                onSuccess: () => {
                    toast.success('Transaction updated successfully.');
                    onClose();
                    reset();
                    router.reload({ only: ['transactions', 'kpis'] });
                },
                onError: () => toast.error('Failed to update transaction.'),
            });
        } else {
            post(route('transactions.store'), {
                onSuccess: () => {
                    toast.success('Transaction logged successfully.');
                    onClose();
                    reset();
                    router.reload({ only: ['transactions', 'kpis'] });
                },
                onError: () => toast.error('Failed to log transaction.'),
            });
        }
    };

    const filteredCategories = categories.filter((c) => {
        const isCurrentlySelected =
            isEditing && String(c.id) === String(editingTransaction?.category_id);

        if (isCurrentlySelected) return true;

        const isSameType = c.type === data.type;
        const isActive = Boolean(c.is_active) || c.is_active === undefined;
        return isSameType && isActive;
    });

    const selectedCategory = categories.find(
        (c) => String(c.id) === String(data.category_id)
    );
    const selectedCategoryTypeMismatch =
        showCategoryForType(data.type) &&
        selectedCategory &&
        selectedCategory.type &&
        selectedCategory.type !== data.type;

    function showCategoryForType(type) {
        return type === 'income' || type === 'expense';
    }

    const showCategory = showCategoryForType(data.type);
    const showSavingsGoal = data.type === 'savings';
    const isTransfer = data.type === 'transfer';

    const hasNotesOrDescriptionErrors = Boolean(errors.description || errors.notes);

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? 'Edit Transaction' : 'New Transaction'}</DialogTitle>
                        <DialogDescription>
                            {isEditing
                                ? 'Update the details for this transaction record.'
                                : 'Log income, expenses, transfers, or savings deposits.'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="flex flex-col space-y-4 pt-2">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                                <TabsTrigger 
                                    value="basic"
                                    className="data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm text-zinc-400 font-medium transition-all"
                                >
                                    Basic Info
                                </TabsTrigger>
                                <TabsTrigger 
                                    value="notes" 
                                    className="relative data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 data-[state=active]:shadow-sm text-zinc-400 font-medium transition-all"
                                >
                                    Notes & Description
                                    {hasNotesOrDescriptionErrors && (
                                        <span className="ml-1.5 h-2 w-2 rounded-full bg-rose-500" />
                                    )}
                                </TabsTrigger>
                            </TabsList>

                            {/* TAB 1: Basic Info */}
                            <TabsContent value="basic" className="space-y-4 pt-4 focus-visible:outline-none">
                                {/* Type */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Type</label>
                                    <Select
                                        value={data.type}
                                        onValueChange={(val) =>
                                            setData((prev) => ({
                                                ...prev,
                                                type: val,
                                                category_id: val === 'income' || val === 'expense' ? prev.category_id : '',
                                                destination_account_id: val === 'transfer' ? prev.destination_account_id : '',
                                                savings_goal_id: val === 'savings' ? prev.savings_goal_id : '',
                                            }))
                                        }
                                    >
                                        <SelectTrigger className="w-full h-10">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="z-[60] w-[var(--radix-select-trigger-width)] min-w-[280px]">
                                            <SelectItem value="expense">Expense</SelectItem>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="transfer">Transfer</SelectItem>
                                            <SelectItem value="savings">Savings Deposit</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Account & Target Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Source Account */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium leading-none">
                                                {isTransfer ? 'From Account' : 'Account'}
                                            </label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setIsAccountModalOpen(true)}
                                                className="h-6 px-1.5 text-xs text-primary gap-1"
                                            >
                                                <Plus className="h-3 w-3" /> Quick Add
                                            </Button>
                                        </div>
                                        <Select
                                            value={data.account_id}
                                            onValueChange={(val) => {
                                                setData((prev) => ({
                                                    ...prev,
                                                    account_id: val,
                                                    destination_account_id:
                                                        prev.destination_account_id === val ? '' : prev.destination_account_id,
                                                }));
                                            }}
                                        >
                                            <SelectTrigger className="w-full h-10">
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                            <SelectContent className="z-[60] w-[var(--radix-select-trigger-width)] min-w-[220px]">
                                                {availableAccounts.length > 0 ? (
                                                    availableAccounts.map((acc) => (
                                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                                            {acc.name} {acc.type ? `(${acc.type})` : ''}{' '}
                                                            {!acc.is_active && acc.is_active !== undefined ? '(Inactive)' : ''}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-2 text-xs text-center text-muted-foreground">
                                                        No active accounts available.
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.account_id && <p className="text-xs text-rose-500">{errors.account_id}</p>}
                                    </div>

                                    {/* Destination Account (Transfers) */}
                                    {isTransfer && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium leading-none">To Account</label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsAccountModalOpen(true)}
                                                    className="h-6 px-1.5 text-xs text-primary gap-1"
                                                >
                                                    <Plus className="h-3 w-3" /> Quick Add
                                                </Button>
                                            </div>
                                            <Select
                                                value={data.destination_account_id}
                                                onValueChange={(val) => setData('destination_account_id', val)}
                                            >
                                                <SelectTrigger className="w-full h-10">
                                                    <SelectValue placeholder="Select to account" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[60] w-[var(--radix-select-trigger-width)] min-w-[220px]">
                                                    {availableAccounts.length > 0 ? (
                                                        availableAccounts
                                                            .filter((acc) => String(acc.id) !== String(data.account_id))
                                                            .map((acc) => (
                                                                <SelectItem key={acc.id} value={String(acc.id)}>
                                                                    {acc.name} {acc.type ? `(${acc.type})` : ''}{' '}
                                                                    {!acc.is_active && acc.is_active !== undefined ? '(Inactive)' : ''}
                                                                </SelectItem>
                                                            ))
                                                    ) : (
                                                        <div className="p-2 text-xs text-center text-muted-foreground">
                                                            No destination accounts.
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.destination_account_id && (
                                                <p className="text-xs text-rose-500">{errors.destination_account_id}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Category (Income & Expense) */}
                                    {showCategory && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium leading-none">Category</label>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setIsCategoryModalOpen(true)}
                                                    className="h-6 px-1.5 text-xs text-primary gap-1"
                                                >
                                                    <Plus className="h-3 w-3" /> Quick Add
                                                </Button>
                                            </div>
                                            <Select
                                                value={data.category_id}
                                                onValueChange={(val) => setData('category_id', val)}
                                            >
                                                <SelectTrigger className="w-full h-10">
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[60] w-[var(--radix-select-trigger-width)] min-w-[220px]">
                                                    {filteredCategories.length > 0 ? (
                                                        filteredCategories.map((cat) => {
                                                            const isSelected =
                                                                String(cat.id) === String(data.category_id);
                                                            const typeMismatch =
                                                                isSelected &&
                                                                cat.type &&
                                                                cat.type !== data.type;
                                                            return (
                                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                                    {cat.name}{' '}
                                                                    {!cat.is_active && cat.is_active !== undefined ? '(Inactive)' : ''}
                                                                    {typeMismatch ? ' (different type)' : ''}
                                                                </SelectItem>
                                                            );
                                                        })
                                                    ) : (
                                                        <div className="p-2 text-xs text-center text-muted-foreground">
                                                            No categories available.
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {selectedCategoryTypeMismatch && (
                                                <p className="text-[11px] text-amber-500 leading-tight">
                                                    Type mismatch with selected category.
                                                </p>
                                            )}
                                            {errors.category_id && <p className="text-xs text-rose-500">{errors.category_id}</p>}
                                        </div>
                                    )}

                                    {/* Savings Goal (Savings Deposit) */}
                                    {showSavingsGoal && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium leading-none">Deposit to Goal</label>
                                            <Select
                                                value={data.savings_goal_id}
                                                onValueChange={(val) => setData('savings_goal_id', val)}
                                            >
                                                <SelectTrigger className="w-full h-10">
                                                    <SelectValue placeholder="Select savings goal" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[60] w-[var(--radix-select-trigger-width)] min-w-[220px]">
                                                    {availableSavingsGoals.length > 0 ? (
                                                        availableSavingsGoals.map((goal) => (
                                                            <SelectItem key={goal.id} value={String(goal.id)}>
                                                                {goal.title}
                                                                {goal.status === 'completed' ? ' (Completed)' : ''}
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-2 text-xs text-center text-muted-foreground">
                                                            No active savings goals.
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.savings_goal_id && (
                                                <p className="text-xs text-rose-500">{errors.savings_goal_id}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Amount & Date */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Amount</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={data.amount}
                                            onChange={(e) => setData('amount', e.target.value)}
                                        />
                                        {errors.amount && <p className="text-xs text-rose-500">{errors.amount}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Date</label>
                                        <Input
                                            type="date"
                                            value={data.transaction_date}
                                            onChange={(e) => setData('transaction_date', e.target.value)}
                                        />
                                        {errors.transaction_date && (
                                            <p className="text-xs text-rose-500">{errors.transaction_date}</p>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>

                            {/* TAB 2: Notes & Description */}
                            <TabsContent value="notes" className="space-y-4 pt-4 focus-visible:outline-none">
                                {/* Description */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium leading-none">Description</label>
                                        <span className={`text-[11px] tabular-nums ${counterClass((data.description || '').length, DESCRIPTION_MAX)}`}>
                                            {(data.description || '').length}/{DESCRIPTION_MAX}
                                        </span>
                                    </div>
                                    <Input
                                        placeholder="e.g. Monthly deposit"
                                        value={data.description}
                                        maxLength={DESCRIPTION_MAX}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
                                </div>

                                {/* Notes */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium leading-none">Notes</label>
                                        <span className={`text-[11px] tabular-nums ${counterClass((data.notes || '').length, NOTES_MAX)}`}>
                                            {(data.notes || '').length}/{NOTES_MAX}
                                        </span>
                                    </div>
                                    
                                    <div className="rounded-md border border-zinc-800 bg-zinc-950/50 text-sm shadow-sm transition-colors focus-within:border-zinc-500 focus-within:ring-1 focus-within:ring-zinc-500">
                                        <ScrollArea className="h-28">
                                            <Textarea
                                                placeholder="Add any extra details or context (optional)..."
                                                value={data.notes}
                                                onChange={(e) => setData('notes', e.target.value)}
                                                maxLength={NOTES_MAX}
                                                className="min-h-[112px] resize-none break-all border-0 bg-transparent shadow-none focus-visible:ring-0 p-3 text-zinc-200 placeholder:text-zinc-500"
                                            />
                                        </ScrollArea>
                                    </div>
                                    {errors.notes && <p className="text-xs text-rose-500">{errors.notes}</p>}
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="pt-2">
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {isEditing ? 'Save Changes' : 'Create Transaction'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {isAccountModalOpen && (
                <AccountFormModal
                    isOpen={isAccountModalOpen}
                    onClose={() => setIsAccountModalOpen(false)}
                    accountTypes={accountTypes}
                    onSuccessCallback={handleAccountCreated}
                />
            )}

            {isCategoryModalOpen && (
                <CategoryFormModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    defaultType={data.type}
                    onSuccessCallback={handleCategoryCreated}
                />
            )}
        </>
    );
}