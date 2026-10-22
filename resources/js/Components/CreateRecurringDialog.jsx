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

export function CreateRecurringDialog({ open, onOpenChange, accounts = [], categories = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        amount: '',
        type: 'expense',
        frequency: 'monthly',
        account_id: accounts[0]?.id ? String(accounts[0].id) : '',
        category_id: '',
        start_date: new Date().toISOString().slice(0, 10),
        auto_create: true,
    });

    // Filter categories dynamically according to selected transaction type (expense vs income)
    const filteredCategories = categories.filter(
        (cat) => !cat.type || cat.type === data.type
    );

    const handleTypeChange = (newType) => {
        setData((prevData) => ({
            ...prevData,
            type: newType,
            category_id: '', // Reset category selection when switching transaction type
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('recurring.store'), {
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[540px] border-zinc-800 bg-zinc-950 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold text-zinc-100">
                        Add Recurring Transaction
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400">
                        Configure a repeating bill, subscription, or automated income source.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Title */}
                    <div className="space-y-1.5">
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
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="amount" className="text-xs text-zinc-300">
                                Amount (₱)
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

                        <div className="space-y-1.5">
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

                    {/* Frequency & Start Date Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
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

                        <div className="space-y-1.5">
                            <Label htmlFor="start_date" className="text-xs text-zinc-300">
                                Start Date
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
                    </div>

                    {/* Account & Category Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-300">Account</Label>
                            <Select value={data.account_id} onValueChange={(val) => setData('account_id', val)}>
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

                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-300">Category</Label>
                            <Select value={data.category_id} onValueChange={(val) => setData('category_id', val)}>
                                <SelectTrigger className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200">
                                    <SelectValue placeholder="Optional" />
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
                    <div className="flex items-center justify-between rounded-lg border border-zinc-800 p-3 bg-zinc-900/50">
                        <div className="space-y-0.5">
                            <Label className="text-xs font-medium text-zinc-200">Auto-post Transaction</Label>
                            <p className="text-[11px] text-zinc-400">
                                Automatically post entry on due date via background scheduler.
                            </p>
                        </div>
                        <Switch
                            checked={data.auto_create}
                            onCheckedChange={(val) => setData('auto_create', val)}
                        />
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-9 border-zinc-800 text-xs text-zinc-300 hover:bg-zinc-800"
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing} className="h-9 text-xs">
                            {processing ? 'Saving...' : 'Create Rule'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}