import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
        transaction_date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (!isOpen) return;

        clearErrors();

        if (editingTransaction) {
            const rawDate = editingTransaction.transaction_date || editingTransaction.date;
            const formattedDate = rawDate
                ? String(rawDate).split('T')[0]
                : new Date().toISOString().split('T')[0];

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
                transaction_date: new Date().toISOString().split('T')[0],
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
                },
                onError: () => toast.error('Failed to update transaction.'),
            });
        } else {
            post(route('transactions.store'), {
                onSuccess: () => {
                    toast.success('Transaction logged successfully.');
                    onClose();
                    reset();
                },
                onError: () => toast.error('Failed to log transaction.'),
            });
        }
    };

    /**
     * Filter categories for the dropdown.
     *
     * IMPORTANT: the currently-attached category must ALWAYS be kept in the
     * options list so Radix's <Select> can render its label. Otherwise the
     * Select falls back to the placeholder and looks "empty" even though
     * data.category_id is set — which is exactly what happened for
     * transactions generated from recurring rules whose stored category had
     * a mismatched (or missing) `type`.
     */
    const filteredCategories = categories.filter((c) => {
        const isCurrentlySelected =
            isEditing && String(c.id) === String(editingTransaction?.category_id);

        if (isCurrentlySelected) return true;

        const isSameType = c.type === data.type;
        const isActive = Boolean(c.is_active) || c.is_active === undefined;
        return isSameType && isActive;
    });

    // Flag whether the currently-selected category has a type that doesn't
    // match the current transaction type — so we can hint to the user.
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

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
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

                        {/* Source Account */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium leading-none">
                                    {data.type === 'transfer' ? 'From Account' : 'Account'}
                                </label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsAccountModalOpen(true)}
                                    className="h-6 px-2 text-xs text-primary gap-1"
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
                                <SelectContent className="z-[60] w-[var(--radix-select-trigger-width)] min-w-[280px]">
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

                        {/* Destination Account (Transfers only) */}
                        {data.type === 'transfer' && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none">To Account (Destination)</label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsAccountModalOpen(true)}
                                        className="h-6 px-2 text-xs text-primary gap-1"
                                    >
                                        <Plus className="h-3 w-3" /> Quick Add
                                    </Button>
                                </div>
                                <Select
                                    value={data.destination_account_id}
                                    onValueChange={(val) => setData('destination_account_id', val)}
                                >
                                    <SelectTrigger className="w-full h-10">
                                        <SelectValue placeholder="Select destination account" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[60] w-[var(--radix-select-trigger-width)] min-w-[280px]">
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
                                                No additional active accounts available.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.destination_account_id && (
                                    <p className="text-xs text-rose-500">{errors.destination_account_id}</p>
                                )}
                            </div>
                        )}

                        {/* Category (Income & Expense only) */}
                        {showCategory && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none">Category</label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsCategoryModalOpen(true)}
                                        className="h-6 px-2 text-xs text-primary gap-1"
                                    >
                                        <Plus className="h-3 w-3" /> Quick Add
                                    </Button>
                                </div>
                                <Select
                                    value={data.category_id}
                                    onValueChange={(val) => setData('category_id', val)}
                                >
                                    <SelectTrigger className="w-full h-10">
                                        <SelectValue placeholder="Select category (optional)" />
                                    </SelectTrigger>
                                    <SelectContent className="z-[60] w-[var(--radix-select-trigger-width)] min-w-[280px]">
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
                                                No active categories available for this type.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {selectedCategoryTypeMismatch && (
                                    <p className="text-[11px] text-amber-500">
                                        The selected category has a different type than this transaction.
                                        Pick a matching category or leave it blank.
                                    </p>
                                )}
                                {errors.category_id && <p className="text-xs text-rose-500">{errors.category_id}</p>}
                            </div>
                        )}

                        {/* Savings Goal (Savings Deposit only) */}
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
                                    <SelectContent className="z-[60] w-[var(--radix-select-trigger-width)] min-w-[280px]">
                                        {availableSavingsGoals.length > 0 ? (
                                            availableSavingsGoals.map((goal) => (
                                                <SelectItem key={goal.id} value={String(goal.id)}>
                                                    {goal.title}
                                                    {goal.status === 'completed' ? ' (Completed)' : ''}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-xs text-center text-muted-foreground">
                                                No active savings goals. Create one first.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.savings_goal_id && (
                                    <p className="text-xs text-rose-500">{errors.savings_goal_id}</p>
                                )}
                            </div>
                        )}

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

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Description</label>
                            <Input
                                placeholder="e.g. Monthly deposit"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                            />
                            {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
                        </div>

                        <DialogFooter className="pt-4">
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