// resources/js/Pages/Subscriptions/Components/CreateRecurringDialog.jsx
import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const WEEKDAYS = [
    { value: 0, short: 'Su', label: 'Sunday' },
    { value: 1, short: 'M', label: 'Monday' },
    { value: 2, short: 'T', label: 'Tuesday' },
    { value: 3, short: 'W', label: 'Wednesday' },
    { value: 4, short: 'Th', label: 'Thursday' },
    { value: 5, short: 'F', label: 'Friday' },
    { value: 6, short: 'S', label: 'Saturday' },
];

export function CreateRecurringDialog({
    open,
    onOpenChange,
    editingItem = null,
    accounts = [],
    categories = [],
    userCurrency = 'PHP',
}) {
    const isEditing = Boolean(editingItem);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        amount: '',
        type: 'expense',
        frequency: 'monthly',
        weekdays: [],
        account_id: accounts[0]?.id ? String(accounts[0].id) : '',
        category_id: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        auto_create: true,
    });

    // Backfill default account when the dialog opens for a NEW rule and accounts
    // arrive after mount (useForm captures initial values only once).
    useEffect(() => {
        if (open && !editingItem && accounts.length > 0 && !data.account_id) {
            setData('account_id', String(accounts[0].id));
        }
    }, [open, accounts, editingItem]);

    useEffect(() => {
        if (editingItem && open) {
            const resolvedCategoryId =
                editingItem.category_id ?? editingItem.category?.id;

            setData({
                title: editingItem.title || '',
                amount: editingItem.amount ? String(editingItem.amount) : '',
                type: editingItem.type || 'expense',
                frequency: editingItem.frequency || 'monthly',
                weekdays: Array.isArray(editingItem.weekdays)
                    ? editingItem.weekdays.map(Number)
                    : [],
                account_id: editingItem.account_id
                    ? String(editingItem.account_id)
                    : accounts[0]?.id
                      ? String(accounts[0].id)
                      : '',
                category_id: resolvedCategoryId
                    ? String(resolvedCategoryId)
                    : '',
                start_date: editingItem.next_due_date
                    ? String(editingItem.next_due_date).split('T')[0]
                    : editingItem.start_date
                      ? String(editingItem.start_date).split('T')[0]
                      : new Date().toISOString().slice(0, 10),
                end_date: editingItem.end_date
                    ? String(editingItem.end_date).split('T')[0]
                    : '',
                auto_create: Boolean(editingItem.auto_create),
            });
        } else if (!open) {
            reset();
        }
    }, [editingItem, open]);

    const editingCategoryId =
        editingItem?.category_id ?? editingItem?.category?.id;

    /**
     * Only allow categories whose `type` matches the rule's type.
     * The currently-edited category is always kept so it can render,
     * even if it is a legacy/mismatched record (e.g. created before
     * this restriction was added).
     *
     * Previously this list also allowed categories with no type and
     * transfer categories, which let mismatched categories get attached
     * to a rule. Those then produced transactions whose category could
     * not render in the edit modal.
     */
    const filteredCategories = categories.filter((cat) => {
        if (String(cat.id) === String(editingCategoryId)) return true;
        if (!cat.type) return false;
        return cat.type === data.type;
    });

    const handleTypeChange = (newType) => {
        setData((prev) => ({ ...prev, type: newType, category_id: '' }));
    };

    const handleFrequencyChange = (newFrequency) => {
        setData((prev) => ({
            ...prev,
            frequency: newFrequency,
            weekdays: newFrequency === 'weekly' ? prev.weekdays : [],
        }));
    };

    const toggleWeekday = (day) => {
        setData((prev) => {
            const current = Array.isArray(prev.weekdays) ? prev.weekdays : [];
            const has = current.includes(day);
            return {
                ...prev,
                weekdays: has
                    ? current.filter((d) => d !== day)
                    : [...current, day].sort((a, b) => a - b),
            };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...data,
            weekdays: data.frequency === 'weekly' ? data.weekdays : null,
        };

        if (isEditing) {
            put(route('recurring.update', editingItem.id), {
                data: payload,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(route('recurring.store'), {
                data: payload,
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-[540px] max-h-[90vh] overflow-y-auto border-zinc-800 bg-zinc-950 text-zinc-100 p-4 sm:p-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <DialogHeader className="space-y-1">
                    <DialogTitle className="text-base sm:text-lg font-semibold text-zinc-100">
                        {isEditing
                            ? 'Edit Recurring Rule'
                            : 'Add Recurring Transaction'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
                    {/* Title */}
                    <div className="space-y-1">
                        <Label htmlFor="title" className="text-xs text-zinc-300">
                            Title / Merchant
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g. Netflix, Rent, Spotify"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                        />
                        {errors.title && (
                            <p className="text-[11px] text-rose-500">{errors.title}</p>
                        )}
                    </div>

                    {/* Amount & Type */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <Label htmlFor="amount" className="text-xs text-zinc-300">
                                Amount ({userCurrency})
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                            />
                            {errors.amount && (
                                <p className="text-[11px] text-rose-500">{errors.amount}</p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-300">Type</Label>
                            <Select value={data.type} onValueChange={handleTypeChange}>
                                <SelectTrigger className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectItem value="expense">Expense</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-[11px] text-rose-500">{errors.type}</p>
                            )}
                        </div>
                    </div>

                    {/* Frequency & Dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-300">Frequency</Label>
                            <Select
                                value={data.frequency}
                                onValueChange={handleFrequencyChange}
                            >
                                <SelectTrigger className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.frequency && (
                                <p className="text-[11px] text-rose-500">
                                    {errors.frequency}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 sm:contents gap-2.5">
                            <div className="space-y-1">
                                <Label
                                    htmlFor="start_date"
                                    className="text-xs text-zinc-300 truncate block"
                                >
                                    {isEditing ? 'Next Due' : 'Start Date'}
                                </Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) =>
                                        setData('start_date', e.target.value)
                                    }
                                    className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                />
                                {errors.start_date && (
                                    <p className="text-[11px] text-rose-500">
                                        {errors.start_date}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label
                                    htmlFor="end_date"
                                    className="text-xs text-zinc-300 truncate block"
                                >
                                    End Date
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) =>
                                        setData('end_date', e.target.value)
                                    }
                                    className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                />
                                {errors.end_date && (
                                    <p className="text-[11px] text-rose-500">
                                        {errors.end_date}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Weekday multi-select (weekly only) */}
                    {data.frequency === 'weekly' && (
                        <div className="space-y-1.5 rounded-lg border border-zinc-800 p-2.5 bg-zinc-900/50">
                            <Label className="text-xs font-medium text-zinc-200">
                                Repeats on
                            </Label>
                            <p className="text-[10px] text-zinc-400 leading-tight">
                                Pick one or more days. The rule will fire on each
                                selected day of the week.
                            </p>
                            <div className="grid grid-cols-7 gap-1 pt-1">
                                {WEEKDAYS.map((day) => {
                                    const selected = data.weekdays.includes(day.value);
                                    return (
                                        <button
                                            key={day.value}
                                            type="button"
                                            title={day.label}
                                            onClick={() => toggleWeekday(day.value)}
                                            className={`h-9 rounded-md text-[11px] font-medium border transition-all ${
                                                selected
                                                    ? 'bg-zinc-100 border-zinc-100 text-zinc-900 shadow-sm'
                                                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                                            }`}
                                        >
                                            {day.short}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.weekdays && (
                                <p className="text-[11px] text-rose-500">
                                    {errors.weekdays}
                                </p>
                            )}
                            {data.weekdays.length === 0 && (
                                <p className="text-[10px] text-zinc-500">
                                    Select at least one day.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Account & Category */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-300">Account</Label>
                            <Select
                                value={data.account_id ? String(data.account_id) : ''}
                                onValueChange={(val) => setData('account_id', val)}
                            >
                                <SelectTrigger className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200">
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                    {accounts.length === 0 && (
                                        <div className="px-2 py-1.5 text-[11px] text-zinc-500">
                                            No accounts. Create one first.
                                        </div>
                                    )}
                                    {accounts.map((acc) => (
                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.account_id && (
                                <p className="text-[11px] text-rose-500">
                                    {errors.account_id}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-300">Category</Label>
                            <Select
                                value={data.category_id ? String(data.category_id) : ''}
                                onValueChange={(val) => setData('category_id', val)}
                            >
                                <SelectTrigger className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                    {filteredCategories.length === 0 && (
                                        <div className="px-2 py-1.5 text-[11px] text-zinc-500">
                                            No matching categories.
                                        </div>
                                    )}
                                    {filteredCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && (
                                <p className="text-[11px] text-rose-500">
                                    {errors.category_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-2 flex-row justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-8 border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-800 flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-8 text-xs flex-1 sm:flex-none"
                        >
                            {processing
                                ? 'Saving...'
                                : isEditing
                                  ? 'Update Rule'
                                  : 'Create Rule'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}