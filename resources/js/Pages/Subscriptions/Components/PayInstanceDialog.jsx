// resources/js/Pages/Subscriptions/Components/PayInstanceDialog.jsx
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

export function PayInstanceDialog({ 
    open, 
    onOpenChange, 
    instance = null, 
    accounts = [], 
    categories = [],
    isAccountLocked = false,
    isAmountLocked = false,
    isCategoryLocked = false,
    userCurrency = 'PHP', // Added userCurrency prop with fallback
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        due_date: '',
        account_id: '',
        category_id: '',
        category_name: '',
        amount: '',
        payment_date: '',
        date_option: 'due_date',
    });

    useEffect(() => {
        if (instance && open) {
            const rawAccountId = instance.account_id ?? instance.account?.id;
            const initialAccount = rawAccountId !== undefined && rawAccountId !== null 
                ? String(rawAccountId) 
                : (accounts[0]?.id ? String(accounts[0].id) : '');

            const rawCategoryId = instance.category_id ?? instance.category?.id;
            const initialCategory = rawCategoryId !== undefined && rawCategoryId !== null 
                ? String(rawCategoryId) 
                : '';

            setData({
                due_date: instance.due_date || '',
                account_id: initialAccount,
                category_id: initialCategory,
                category_name: instance.category_name || instance.category?.name || 'Uncategorized',
                amount: instance.amount ? String(instance.amount) : '',
                payment_date: instance.due_date || new Date().toISOString().slice(0, 10),
                date_option: 'due_date',
            });
        }
    }, [instance, open, accounts]);

    const handleDateOptionChange = (value) => {
        const todayStr = new Date().toISOString().slice(0, 10);
        setData((prev) => ({
            ...prev,
            date_option: value,
            payment_date: value === 'due_date' ? prev.due_date : todayStr,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!instance) return;

        post(route('recurring.process', instance.rule_id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Payment logged for ${data.payment_date}`);
                reset();
                onOpenChange(false);
            },
            onError: () => {
                toast.error('Failed to process payment.');
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] border-zinc-800 bg-zinc-950 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="text-base font-semibold text-zinc-100">
                        Process Scheduled Payment
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400">
                        Log transaction for <strong>{instance?.title}</strong> due on {instance?.due_date}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Amount */}
                    <div className="space-y-1.5">
                        <Label htmlFor="amount" className="text-xs text-zinc-300">
                            Amount ({userCurrency})
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            disabled={isAmountLocked}
                            className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                        {errors.amount && <p className="text-[11px] text-rose-500">{errors.amount}</p>}
                    </div>

                    {/* Category & Account (Side-by-Side Grid) */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Category */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-300">Category</Label>
                            {isCategoryLocked ? (
                                <Input
                                    type="text"
                                    value={data.category_name}
                                    disabled={true}
                                    className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                />
                            ) : (
                                <Select 
                                    value={data.category_id} 
                                    onValueChange={(val) => setData('category_id', val)}
                                >
                                    <SelectTrigger className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={String(cat.id)}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                            {errors.category_id && <p className="text-[11px] text-rose-500">{errors.category_id}</p>}
                        </div>

                        {/* Account */}
                        <div className="space-y-1.5">
                            <Label className="text-xs text-zinc-300">Payment Account</Label>
                            <Select 
                                value={data.account_id} 
                                onValueChange={(val) => setData('account_id', val)}
                                disabled={isAccountLocked}
                            >
                                <SelectTrigger className="h-9 w-full border-zinc-800 bg-zinc-900 text-xs text-zinc-200 disabled:opacity-60 disabled:cursor-not-allowed">
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
                    </div>

                    {/* Payment Date Selection */}
                    <div className="space-y-2 rounded-lg border border-zinc-800 p-3 bg-zinc-900/50">
                        <Label className="text-xs font-medium text-zinc-300">Record Transaction Date As</Label>
                        <RadioGroup 
                            value={data.date_option} 
                            onValueChange={handleDateOptionChange}
                            className="space-y-1.5 pt-1"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                    value="due_date" 
                                    id="r1" 
                                    className="border-zinc-700 text-zinc-100 focus:ring-zinc-400 [&>span>svg]:fill-zinc-100 [&>span>svg]:text-zinc-100" 
                                />
                                <Label htmlFor="r1" className="text-xs text-zinc-300 font-normal cursor-pointer">
                                    Assigned Due Date ({data.due_date})
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem 
                                    value="today" 
                                    id="r2" 
                                    className="border-zinc-700 text-zinc-100 focus:ring-zinc-400 [&>span>svg]:fill-zinc-100 [&>span>svg]:text-zinc-100" 
                                />
                                <Label htmlFor="r2" className="text-xs text-zinc-300 font-normal cursor-pointer">
                                    Today's Date ({new Date().toISOString().slice(0, 10)})
                                </Label>
                            </div>
                        </RadioGroup>
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
                            {processing ? 'Processing...' : 'Confirm & Log Payment'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}