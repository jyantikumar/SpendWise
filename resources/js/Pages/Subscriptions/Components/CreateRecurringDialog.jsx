// resources/js/Pages/Subscriptions/Components/CreateRecurringDialog.jsx
import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export function CreateRecurringDialog({ 
    open, 
    onOpenChange, 
    editingItem = null, 
    accounts = [], 
    categories = [],
    userCurrency = 'PHP' // Added userCurrency prop with fallback
}) {
    const isEditing = Boolean(editingItem);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        amount: '',
        type: 'expense',
        frequency: 'monthly',
        account_id: accounts[0]?.id ? String(accounts[0].id) : '',
        category_id: '',
        start_date: new Date().toISOString().slice(0, 10),
        end_date: '',
        auto_create: true,
    });

    useEffect(() => {
        if (editingItem && open) {
            // Safely resolve category ID from either category_id or category.id relation
            const resolvedCategoryId = editingItem.category_id ?? editingItem.category?.id;

            setData({
                title: editingItem.title || '',
                amount: editingItem.amount ? String(editingItem.amount) : '',
                type: editingItem.type || 'expense',
                frequency: editingItem.frequency || 'monthly',
                account_id: editingItem.account_id ? String(editingItem.account_id) : (accounts[0]?.id ? String(accounts[0].id) : ''),
                category_id: resolvedCategoryId ? String(resolvedCategoryId) : '',
                start_date: editingItem.next_due_date ? String(editingItem.next_due_date).split('T')[0] : (editingItem.start_date ? String(editingItem.start_date).split('T')[0] : new Date().toISOString().slice(0, 10)),
                end_date: editingItem.end_date ? String(editingItem.end_date).split('T')[0] : '',
                auto_create: Boolean(editingItem.auto_create),
            });
        } else if (!open) {
            reset();
        }
    }, [editingItem, open]);

    // Ensure category list matches data.type OR includes the currently editing item's category
    const editingCategoryId = editingItem?.category_id ?? editingItem?.category?.id;
    const filteredCategories = categories.filter(
        (cat) => !cat.type || cat.type === data.type || String(cat.id) === String(editingCategoryId)
    );

    const handleTypeChange = (newType) => {
        setData((prevData) => ({
            ...prevData,
            type: newType,
            category_id: '',
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('recurring.update', editingItem.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
            });
        } else {
            post(route('recurring.store'), {
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
                        {isEditing ? 'Edit Recurring Rule' : 'Add Recurring Transaction'}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400">
                        {isEditing 
                            ? 'Update schedule, amounts, or auto-posting parameters.'
                            : 'Configure a repeating bill, subscription, or automated income source.'}
                    </DialogDescription>
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
                        {errors.title && <p className="text-[11px] text-rose-500">{errors.title}</p>}
                    </div>

                    {/* Amount & Type Grid */}
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
                            {errors.amount && <p className="text-[11px] text-rose-500">{errors.amount}</p>}
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
                            {errors.type && <p className="text-[11px] text-rose-500">{errors.type}</p>}
                        </div>
                    </div>

                    {/* Frequency & Dates Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-300">Frequency</Label>
                            <Select value={data.frequency} onValueChange={(val) => setData('frequency', val)}>
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
                            {errors.frequency && <p className="text-[11px] text-rose-500">{errors.frequency}</p>}
                        </div>

                        <div className="grid grid-cols-2 sm:contents gap-2.5">
                            <div className="space-y-1">
                                <Label htmlFor="start_date" className="text-xs text-zinc-300 truncate block">
                                    {isEditing ? 'Next Due' : 'Start Date'}
                                </Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={data.start_date}
                                    onChange={(e) => setData('start_date', e.target.value)}
                                    className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                />
                                {errors.start_date && <p className="text-[11px] text-rose-500">{errors.start_date}</p>}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="end_date" className="text-xs text-zinc-300 truncate block">
                                    End Date
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                    className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200"
                                />
                                {errors.end_date && <p className="text-[11px] text-rose-500">{errors.end_date}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Account & Category Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-300">Account</Label>
                            <Select value={data.account_id ? String(data.account_id) : ''} onValueChange={(val) => setData('account_id', val)}>
                                <SelectTrigger className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200">
                                    <SelectValue placeholder="Select account" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                    {accounts.map((acc) => (
                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.account_id && <p className="text-[11px] text-rose-500">{errors.account_id}</p>}
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs text-zinc-300">Category</Label>
                            <Select value={data.category_id ? String(data.category_id) : ''} onValueChange={(val) => setData('category_id', val)}>
                                <SelectTrigger className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                    {filteredCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-[11px] text-rose-500">{errors.category_id}</p>}
                        </div>
                    </div>

                    {/* Auto-Create Toggle */}
                    <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-2.5 bg-zinc-900/50">
                        <div className="space-y-0.5 pr-2">
                            <Label className="text-xs font-medium text-zinc-200">Auto-post Transaction</Label>
                            <p className="text-[10px] text-zinc-400 leading-tight">
                                Automatically post entry on due date via background scheduler.
                            </p>
                        </div>
                        <Switch
                            checked={data.auto_create}
                            onCheckedChange={(val) => setData('auto_create', val)}
                        />
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
                        <Button type="submit" disabled={processing} className="h-8 text-xs flex-1 sm:flex-none">
                            {processing ? 'Saving...' : isEditing ? 'Update Rule' : 'Create Rule'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}