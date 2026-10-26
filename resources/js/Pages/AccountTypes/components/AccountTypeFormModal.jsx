// resources/js/Pages/AccountTypes/components/AccountTypeFormModal.jsx
import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';

export default function AccountTypeFormModal({
    isOpen,
    onClose,
    editingType = null,
    onSuccessCallback
}) {
    const isEditing = Boolean(editingType);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        color: '#3b82f6',
        icon: '',
    });

    useEffect(() => {
        if (!isOpen) return;

        clearErrors();

        if (editingType) {
            setData({
                name: editingType.name || '',
                color: editingType.color || '#3b82f6',
                icon: editingType.icon || '',
            });
        } else {
            reset();
            setData({
                name: '',
                color: '#3b82f6',
                icon: '',
            });
        }
    }, [isOpen, editingType]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('account-types.update', editingType.id), {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast.success('Account type updated successfully.');
                    onClose();
                    reset();
                    if (onSuccessCallback) onSuccessCallback(page);
                },
                onError: () => {
                    toast.error('Failed to update account type.');
                },
            });
        } else {
            post(route('account-types.store'), {
                preserveScroll: true,
                onSuccess: (page) => {
                    toast.success('Account type created successfully.');
                    onClose();
                    reset();
                    if (onSuccessCallback) onSuccessCallback(page);
                },
                onError: () => {
                    toast.error('Failed to create account type.');
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Account Type' : 'Add Account Type'}</DialogTitle>
                    <DialogDescription>
                        Specify a custom account type and display color.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Type Name</label>
                        <Input
                            placeholder="e.g., E-Wallet, Crypto Wallet, Savings"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                    </div>

                    {/* Badge Color Picker */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Badge Color</label>
                        <div className="flex items-center gap-3 w-full">
                            <div className="relative flex items-center shrink-0">
                                <Input 
                                    type="color" 
                                    value={data.color} 
                                    onChange={(e) => setData('color', e.target.value)}
                                    className="w-10 h-10 p-0.5 rounded-full border-zinc-700 bg-transparent cursor-pointer overflow-hidden"
                                />
                            </div>

                            <Input 
                                type="text"
                                maxLength={7}
                                value={data.color}
                                onChange={(e) => setData('color', e.target.value)}
                                className="flex-1 h-10 font-mono text-xs uppercase border-zinc-800"
                                placeholder="#000000"
                            />
                        </div>
                        {errors.color && <p className="text-xs text-rose-500">{errors.color}</p>}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEditing ? 'Save Changes' : 'Create Type'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}