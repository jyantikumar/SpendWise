// resources/js/Pages/Subscriptions/Components/CreateRecurringDialog.jsx
import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { todayLocalISO } from './dateHelpers';
import { SearchableSelect } from './SearchableSelect';

const WEEKDAYS = [
    { value: 0, short: 'Su', label: 'Sunday' },
    { value: 1, short: 'M', label: 'Monday' },
    { value: 2, short: 'T', label: 'Tuesday' },
    { value: 3, short: 'W', label: 'Wednesday' },
    { value: 4, short: 'Th', label: 'Thursday' },
    { value: 5, short: 'F', label: 'Friday' },
    { value: 6, short: 'S', label: 'Saturday' },
];

const parseWeekdays = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(Number);
    if (typeof val === 'string') {
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed.map(Number) : [];
        } catch {
            return [];
        }
    }
    return [];
};

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
        notes: '',
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
                notes: editingItem.notes || '',
                amount: editingItem.amount ? String(editingItem.amount) : '',
                type: editingItem.type || 'expense',
                frequency: editingItem.frequency || 'monthly',
                weekdays: parseWeekdays(editingItem.weekdays),
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
                      : todayLocalISO(),
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
            weekdays: newFrequency === 'custom' ? prev.weekdays : [],
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

    const setWeekdayPreset = (preset) => {
        if (preset === 'weekdays') setData('weekdays', [1, 2, 3, 4, 5]);
        if (preset === 'weekends') setData('weekdays', [0, 6]);
        if (preset === 'all') setData('weekdays', [0, 1, 2, 3, 4, 5, 6]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            ...data,
            frequency: data.frequency,
            weekdays: data.frequency === 'custom' ? data.weekdays : null,
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
            <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden border-zinc-800 bg-zinc-950 text-zinc-100">
                <DialogHeader className="px-5 pt-4 pb-3 border-b border-zinc-900">
                    <DialogTitle className="text-base font-semibold text-zinc-100">
                        {isEditing ? 'Edit Recurring Rule' : 'Add Recurring Transaction'}
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400 text-xs">
                        {isEditing
                            ? 'Update transaction schedule and amount rules.'
                            : 'Set up automated or tracked recurring transactions.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Top Row: Type & Title */}
                    <div className="grid grid-cols-2 sm:grid-cols-12 gap-3">
                        <div className="col-span-1 sm:col-span-4 space-y-1">
                            <Label className="text-[11px] font-medium text-zinc-400">Type</Label>
                            <Select value={data.type} onValueChange={handleTypeChange}>
                                <SelectTrigger className="w-full h-9 text-xs border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[60] border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectItem value="expense">Expense</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && (
                                <p className="text-[10px] text-rose-500">{errors.type}</p>
                            )}
                        </div>

                        <div className="col-span-1 sm:col-span-8 space-y-1">
                            <Label htmlFor="title" className="text-[11px] font-medium text-zinc-400">
                                Merchant / Title
                            </Label>
                            <Input
                                id="title"
                                placeholder="e.g. Netflix, Housing Rent, Spotify"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                className="h-9 text-xs border-zinc-800 bg-zinc-900 text-zinc-200"
                            />
                            {errors.title && (
                                <p className="text-[10px] text-rose-500">{errors.title}</p>
                            )}
                        </div>
                    </div>

                    {/* Middle Section: 2x2 on Mobile, 3-column on Desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="col-span-1 space-y-1">
                            <Label htmlFor="amount" className="text-[11px] font-medium text-zinc-400">
                                Amount ({userCurrency})
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                className="h-9 text-xs border-zinc-800 bg-zinc-900 text-zinc-200"
                            />
                            {errors.amount && (
                                <p className="text-[10px] text-rose-500">{errors.amount}</p>
                            )}
                        </div>

                        <div className="col-span-1 space-y-1">
                            <Label className="text-[11px] font-medium text-zinc-400">Account</Label>
                            <SearchableSelect
                                value={data.account_id}
                                onValueChange={(val) => setData('account_id', val)}
                                options={accounts.map((acc) => ({
                                    value: String(acc.id),
                                    label: acc.name,
                                }))}
                                placeholder="Select account"
                                searchPlaceholder="Search…"
                                emptyText="No match."
                                disabled={accounts.length === 0}
                            />
                            {errors.account_id && (
                                <p className="text-[10px] text-rose-500">{errors.account_id}</p>
                            )}
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                            <Label className="text-[11px] font-medium text-zinc-400">Category</Label>
                            <SearchableSelect
                                value={data.category_id}
                                onValueChange={(val) => setData('category_id', val)}
                                options={filteredCategories.map((cat) => ({
                                    value: String(cat.id),
                                    label: cat.name,
                                }))}
                                placeholder="Select category"
                                searchPlaceholder="Search…"
                                emptyText="No match."
                                disabled={filteredCategories.length === 0}
                            />
                            {errors.category_id && (
                                <p className="text-[10px] text-rose-500">{errors.category_id}</p>
                            )}
                        </div>
                    </div>

                    {/* Schedule Section: 2x2 on Mobile, 3-column on Desktop */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="col-span-1 space-y-1">
                            <Label className="text-[11px] font-medium text-zinc-400">Frequency</Label>
                            <Select
                                value={data.frequency}
                                onValueChange={handleFrequencyChange}
                            >
                                <SelectTrigger className="w-full h-9 text-xs border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[60] border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="custom">Custom (Days)</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.frequency && (
                                <p className="text-[10px] text-rose-500">{errors.frequency}</p>
                            )}
                        </div>

                        <div className="col-span-1 space-y-1">
                            <Label htmlFor="start_date" className="text-[11px] font-medium text-zinc-400">
                                {isEditing ? 'Next Due' : 'Start Date'}
                            </Label>
                            <Input
                                id="start_date"
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                                className="h-9 text-xs border-zinc-800 bg-zinc-900 text-zinc-200"
                            />
                            {errors.start_date && (
                                <p className="text-[10px] text-rose-500">{errors.start_date}</p>
                            )}
                        </div>

                        <div className="col-span-2 sm:col-span-1 space-y-1">
                            <Label htmlFor="end_date" className="text-[11px] font-medium text-zinc-400">
                                End Date
                            </Label>
                            <Input
                                id="end_date"
                                type="date"
                                value={data.end_date}
                                onChange={(e) => setData('end_date', e.target.value)}
                                className="h-9 text-xs border-zinc-800 bg-zinc-900 text-zinc-200"
                            />
                            {errors.end_date && (
                                <p className="text-[10px] text-rose-500">{errors.end_date}</p>
                            )}
                        </div>
                    </div>

                    {/* Custom Weekdays Picker */}
                    {data.frequency === 'custom' && (
                        <div className="p-2.5 rounded-md border border-zinc-800/80 bg-zinc-900/30 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label className="text-[11px] font-medium text-zinc-300">
                                    Repeats On
                                </Label>
                                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                                    <button type="button" onClick={() => setWeekdayPreset('weekdays')} className="hover:text-zinc-200 transition-colors">Mon-Fri</button>
                                    <span className="text-zinc-700">•</span>
                                    <button type="button" onClick={() => setWeekdayPreset('weekends')} className="hover:text-zinc-200 transition-colors">Sat-Sun</button>
                                    <span className="text-zinc-700">•</span>
                                    <button type="button" onClick={() => setWeekdayPreset('all')} className="hover:text-zinc-200 transition-colors">All</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {WEEKDAYS.map((day) => {
                                    const selected = data.weekdays.includes(day.value);
                                    return (
                                        <button
                                            key={day.value}
                                            type="button"
                                            title={day.label}
                                            onClick={() => toggleWeekday(day.value)}
                                            className={`h-7 rounded text-xs font-medium border transition-all ${
                                                selected
                                                    ? 'bg-zinc-100 border-zinc-100 text-zinc-900 shadow-sm font-semibold'
                                                    : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                                            }`}
                                        >
                                            {day.short}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.weekdays && (
                                <p className="text-[10px] text-rose-500">{errors.weekdays}</p>
                            )}
                        </div>
                    )}

                    {/* Compact Notes Field */}
                    <div className="space-y-1">
                        <Label htmlFor="notes" className="text-[11px] font-medium text-zinc-400">
                            Notes (Optional)
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Add reference codes, billing IDs, or memos..."
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            className="h-14 resize-none border-zinc-800 bg-zinc-900 text-zinc-200 text-xs p-2.5"
                        />
                        {errors.notes && (
                            <p className="text-[10px] text-rose-500">{errors.notes}</p>
                        )}
                    </div>

                    {/* Dialog Footer Actions */}
                    <DialogFooter className="pt-2 flex-row justify-end gap-2 border-t border-zinc-900">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-8 text-xs border-zinc-800 text-zinc-300 hover:bg-zinc-900 flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-8 text-xs bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium flex-1 sm:flex-none"
                        >
                            {processing ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}