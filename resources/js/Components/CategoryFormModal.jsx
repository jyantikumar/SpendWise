import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';

export default function CategoryFormModal({
    isOpen,
    onClose,
    editingCategory = null,
    defaultType = 'expense',
    onSuccessCallback
}) {
    const isEditing = Boolean(editingCategory);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: defaultType,
        color: '#3b82f6',
        icon: '',
    });

    useEffect(() => {
        if (!isOpen) return;

        clearErrors();

        if (editingCategory) {
            setData({
                name: editingCategory.name || '',
                type: editingCategory.type || 'expense',
                color: editingCategory.color || '#3b82f6',
                icon: editingCategory.icon || '',
            });
        } else {
            reset();
            setData({
                name: '',
                type: defaultType,
                color: '#3b82f6',
                icon: '',
            });
        }
    }, [isOpen, editingCategory, defaultType]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('categories.update', editingCategory.id), {
                preserveScroll: true,
                onSuccess: (page) => {
                    onClose();
                    reset();
                    if (onSuccessCallback) onSuccessCallback(page);
                },
            });
        } else {
            post(route('categories.store'), {
                preserveScroll: true,
                onSuccess: (page) => {
                    onClose();
                    reset();
                    if (onSuccessCallback) onSuccessCallback(page);
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
                    <DialogDescription>
                        {isEditing 
                            ? 'Update category details and classification.' 
                            : 'Add a new category to group your financial transactions.'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-2">
                    {/* Category Name */}
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Category Name</label>
                        <Input
                            placeholder="e.g., Groceries, Salary, Utilities"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                    </div>

                    {/* Side-by-Side: Transaction Type & Badge Color */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Type</label>
                            <Select 
                                value={data.type} 
                                onValueChange={(val) => setData('type', val)}
                            >
                                <SelectTrigger className="h-10 border-zinc-800 text-zinc-300">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="expense">Expense</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.type && <p className="text-xs text-rose-500">{errors.type}</p>}
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Badge Color</label>
                            <div className="flex items-center gap-2">
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
                                    className="w-full h-10 font-mono text-xs uppercase border-zinc-800"
                                    placeholder="#000000"
                                />
                            </div>
                            {errors.color && <p className="text-xs text-rose-500">{errors.color}</p>}
                        </div>
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
                            {isEditing ? 'Save Changes' : 'Create Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}