import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TransactionModal({ isOpen, onClose, accounts, categories }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'expense',
        amount: '',
        category_id: '',
        source_account_id: accounts[0]?.id ? String(accounts[0].id) : '',
        destination_account_id: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
    });

    const filteredCategories = categories.filter((cat) => cat.type === data.type);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('transactions.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Log Transaction</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Transaction Type */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Type</label>
                        <Select
                            value={data.type}
                            onValueChange={(val) => {
                                setData((prev) => ({
                                    ...prev,
                                    type: val,
                                    category_id: '',
                                    destination_account_id: '',
                                }));
                            }}
                        >
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="expense">Expense</SelectItem>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="transfer">Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Amount</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            placeholder="0.00"
                            required
                        />
                        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                    </div>

                    {/* Source Account */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">
                            {data.type === 'transfer' ? 'From Account' : 'Account'}
                        </label>
                        <Select
                            value={data.source_account_id}
                            onValueChange={(val) => setData('source_account_id', val)}
                        >
                            <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                            <SelectContent>
                                {accounts.map((acc) => (
                                    <SelectItem key={acc.id} value={String(acc.id)}>
                                        {acc.name} (${parseFloat(acc.balance).toFixed(2)})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Destination Account (Transfers Only) */}
                    {data.type === 'transfer' && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">To Account</label>
                            <Select
                                value={data.destination_account_id}
                                onValueChange={(val) => setData('destination_account_id', val)}
                            >
                                <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                                <SelectContent>
                                    {accounts
                                        .filter((acc) => String(acc.id) !== data.source_account_id)
                                        .map((acc) => (
                                            <SelectItem key={acc.id} value={String(acc.id)}>
                                                {acc.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                            {errors.destination_account_id && <p className="text-xs text-destructive">{errors.destination_account_id}</p>}
                        </div>
                    )}

                    {/* Category (Income & Expense Only) */}
                    {data.type !== 'transfer' && (
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Category</label>
                            <Select
                                value={data.category_id}
                                onValueChange={(val) => setData('category_id', val)}
                            >
                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                <SelectContent>
                                    {filteredCategories.map((cat) => (
                                        <SelectItem key={cat.id} value={String(cat.id)}>
                                            <div className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                                <span>{cat.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category_id && <p className="text-xs text-destructive">{errors.category_id}</p>}
                        </div>
                    )}

                    {/* Date */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input
                            type="date"
                            value={data.date}
                            onChange={(e) => setData('transaction_date', e.target.value)}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Optional notes..."
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={processing}>
                        Save Transaction
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}