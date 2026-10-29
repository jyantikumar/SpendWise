import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function BudgetFormModal({ isOpen, onClose, editingBudget = null, categories = [] }) {
    const isEditing = Boolean(editingBudget);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        category_id: '',
        amount: '',
        period: 'monthly',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        rollover: false,
    });

    useEffect(() => {
        if (!isOpen) return;
        clearErrors();

        if (editingBudget) {
            setData({
                name: editingBudget.name || '',
                category_id: editingBudget.category_id ? String(editingBudget.category_id) : '',
                amount: editingBudget.amount ? String(editingBudget.amount) : '',
                period: editingBudget.period || 'monthly',
                start_date: editingBudget.start_date || new Date().toISOString().split('T')[0],
                end_date: editingBudget.end_date || '',
                rollover: !!editingBudget.rollover,
            });
        } else {
            reset();
            setData({
                name: '',
                category_id: '',
                amount: '',
                period: 'monthly',
                start_date: new Date().toISOString().split('T')[0],
                end_date: '',
                rollover: false,
            });
        }
    }, [isOpen, editingBudget]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('budgets.update', editingBudget.id), {
                onSuccess: () => { toast.success('Budget updated.'); onClose(); },
                onError: () => toast.error('Failed to update budget.'),
            });
        } else {
            post(route('budgets.store'), {
                onSuccess: () => { toast.success('Budget created.'); onClose(); reset(); },
                onError: () => toast.error('Failed to create budget.'),
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Budget' : 'New Budget'}</DialogTitle>
                    <DialogDescription>
                        Define a spending limit for a category or your overall spending.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm">Label (optional)</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. Groceries, Dining Out"
                        />
                        {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="category_id" className="text-sm">Category</Label>
                        <Select
                            value={data.category_id === '' ? 'overall' : String(data.category_id)}
                            onValueChange={(val) => setData('category_id', val === 'overall' ? '' : val)}
                        >
                            <SelectTrigger className="w-full h-10">
                                <SelectValue placeholder="Overall budget" />
                            </SelectTrigger>
                            <SelectContent className="z-[60] w-[var(--radix-select-trigger-width)]">
                                <SelectItem value="overall">Overall (all categories)</SelectItem>
                                {categories.length === 0 ? (
                                    <div className="p-2 text-xs text-center text-muted-foreground">
                                        No expense categories found.
                                    </div>
                                ) : (
                                    categories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            {cat.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        {errors.category_id && <p className="text-xs text-rose-500">{errors.category_id}</p>}
                    </div>

                    {/* Amount & Period */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount" className="text-sm">Limit</Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="5000.00"
                            />
                            {errors.amount && <p className="text-xs text-rose-500">{errors.amount}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="period" className="text-sm">Period</Label>
                            <Select value={data.period} onValueChange={(val) => setData('period', val)}>
                                <SelectTrigger className="w-full h-10"><SelectValue /></SelectTrigger>
                                <SelectContent className="z-[60]">
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.period && <p className="text-xs text-rose-500">{errors.period}</p>}
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Start Date</Label>
                            <Input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => setData('start_date', e.target.value)}
                            />
                            {errors.start_date && <p className="text-xs text-rose-500">{errors.start_date}</p>}
                        </div>

                        {data.period === 'custom' && (
                            <div className="space-y-2">
                                <Label className="text-sm">End Date</Label>
                                <Input
                                    type="date"
                                    value={data.end_date}
                                    onChange={(e) => setData('end_date', e.target.value)}
                                />
                                {errors.end_date && <p className="text-xs text-rose-500">{errors.end_date}</p>}
                            </div>
                        )}
                    </div>

                    {/* Rollover */}
                    <div className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2">
                        <div>
                            <p className="text-sm font-medium">Rollover unused balance</p>
                            <p className="text-[11px] text-zinc-400">Carry what's left into the next period.</p>
                        </div>
                        <input
                            type="checkbox"
                            checked={data.rollover}
                            onChange={(e) => setData('rollover', e.target.checked)}
                            className="h-4 w-4 accent-emerald-500"
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={processing}>
                            {isEditing ? 'Save Changes' : 'Create Budget'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}