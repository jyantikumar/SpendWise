import { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Target } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function SavingsGoalFormModal({
    isOpen,
    onClose,
    editingGoal = null,
}) {
    const isEditing = Boolean(editingGoal);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        description: '',
        target_amount: '',
        target_date: '',
    });

    useEffect(() => {
        if (!isOpen) return;

        clearErrors();

        if (editingGoal) {
            setData({
                title: editingGoal.title || '',
                description: editingGoal.description || '',
                target_amount: editingGoal.target_amount ? String(editingGoal.target_amount) : '',
                target_date: editingGoal.target_date || '',
            });
        } else {
            reset();
        }
    }, [isOpen, editingGoal]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const options = {
            onSuccess: () => {
                toast.success(isEditing ? 'Savings goal updated.' : 'Savings goal created.');
                onClose();
                reset();
            },
            onError: () => {
                toast.error(
                    isEditing ? 'Failed to update savings goal.' : 'Failed to create savings goal.'
                );
            },
        };

        if (isEditing) {
            put(route('savings.update', editingGoal.id), options);
        } else {
            post(route('savings.store'), options);
        }
    };

    const handleClose = () => {
        if (processing) return; // don't close mid-submit
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        {isEditing ? 'Edit Savings Goal' : 'New Savings Goal'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update the details of your savings goal.'
                            : 'Set a target amount and a deadline to start saving.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Title</label>
                        <Input
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="e.g. Emergency Fund"
                            autoFocus
                        />
                        {errors.title && <p className="text-xs text-rose-500">{errors.title}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Description</label>
                        <Input
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Optional notes about this goal..."
                        />
                        {errors.description && (
                            <p className="text-xs text-rose-500">{errors.description}</p>
                        )}
                    </div>

                    {/* Target Amount & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Target Amount</label>
                            <Input
                                type="number"
                                step="0.01"
                                min="0.01"
                                value={data.target_amount}
                                onChange={(e) => setData('target_amount', e.target.value)}
                                placeholder="0.00"
                            />
                            {errors.target_amount && (
                                <p className="text-xs text-rose-500">{errors.target_amount}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Target Date</label>
                            <Input
                                type="date"
                                value={data.target_date}
                                onChange={(e) => setData('target_date', e.target.value)}
                            />
                            {errors.target_date && (
                                <p className="text-xs text-rose-500">{errors.target_date}</p>
                            )}
                        </div>
                    </div>

                    {/* Contextual hint for editing */}
                    {isEditing && (
                        <p className="text-[11px] text-zinc-500 leading-relaxed">
                            Current progress:{' '}
                            <span className="text-zinc-300 font-medium">
                                {editingGoal.current_amount} saved
                            </span>{' '}
                            of {editingGoal.target_amount}. Changing the target amount won't
                            affect existing deposit transactions.
                        </p>
                    )}

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Saving...'
                                : isEditing
                                ? 'Save Changes'
                                : 'Create Goal'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}