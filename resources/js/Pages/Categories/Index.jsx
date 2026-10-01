import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Plus, 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    Tag, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    ArrowLeftRight 
} from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from '@/components/ui/alert-dialog';

const PRESET_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981', 
    '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', 
    '#ec4899', '#64748b'
];

export default function CategoryIndex({ auth, categories }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [selectedTab, setSelectedTab] = useState('all');

    // Inertia form state for Store & Update
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'expense',
        color: '#3b82f6',
        icon: '',
    });

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingCategory(null);
        setIsCreateOpen(true);
    };

    const openEditModal = (category) => {
        clearErrors();
        setEditingCategory(category);
        setData({
            name: category.name,
            type: category.type,
            color: category.color || '#3b82f6',
            icon: category.icon || '',
        });
        setIsCreateOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            put(route('categories.update', editingCategory.id), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                },
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    setIsCreateOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingCategory) return;
        router.delete(route('categories.destroy', deletingCategory.id), {
            onSuccess: () => setDeletingCategory(null),
        });
    };

    const filteredCategories = categories.filter((cat) => {
        if (selectedTab === 'all') return true;
        return cat.type === selectedTab;
    });

    const renderTypeBadge = (type) => {
        switch (type) {
            case 'income':
                return (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 gap-1">
                        <ArrowUpCircle className="h-3 w-3" /> Income
                    </Badge>
                );
            case 'expense':
                return (
                    <Badge variant="outline" className="border-rose-500 text-rose-600 gap-1">
                        <ArrowDownCircle className="h-3 w-3" /> Expense
                    </Badge>
                );
            case 'transfer':
                return (
                    <Badge variant="outline" className="border-blue-500 text-blue-600 gap-1">
                        <ArrowLeftRight className="h-3 w-3" /> Transfer
                    </Badge>
                );
            default:
                return <Badge>{type}</Badge>;
        }
    };

    return (
        <TooltipProvider>
            <SidebarProvider>
                <Head title="Categories - SpendWise" />

                <AppSidebar user={auth.user} />

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h1 className="text-lg font-semibold tracking-tight">Category Management</h1>
                    </header>

                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        {/* Header Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
                                <p className="text-sm text-muted-foreground">
                                    Organize your cash flow into custom income, expense, and transfer categories.
                                </p>
                            </div>

                            <Button onClick={openCreateModal} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Category
                            </Button>
                        </div>

                        {/* Category Table Card */}
                        <Card>
                            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>All Categories</CardTitle>
                                    <CardDescription>Manage your transaction tags and color schemes.</CardDescription>
                                </div>

                                {/* Type Filter Buttons */}
                                <div className="flex items-center gap-1 bg-muted p-1 rounded-lg text-xs">
                                    {['all', 'expense', 'income', 'transfer'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setSelectedTab(tab)}
                                            className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                                                selectedTab === tab
                                                    ? 'bg-background text-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Transactions Count</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((cat) => (
                                                <TableRow key={cat.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div 
                                                                className="h-3.5 w-3.5 rounded-full" 
                                                                style={{ backgroundColor: cat.color || '#3b82f6' }}
                                                            />
                                                            <span>{cat.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTypeBadge(cat.type)}</TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {cat.transactions_count || 0} transactions
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
    <DropdownMenuTrigger asChild>
        <button 
            type="button"
            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground outline-none transition-colors"
        >
            <MoreHorizontal className="h-4 w-4" />
        </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => openEditModal(cat)} className="cursor-pointer">
            <Pencil className="mr-2 h-4 w-4" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
            onClick={() => setDeletingCategory(cat)} 
            className="text-destructive cursor-pointer"
        >
            <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
    </DropdownMenuContent>
</DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No categories found for the selected filter.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </main>

                    {/* Create / Edit Category Modal */}
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
                                <DialogDescription>
                                    {editingCategory 
                                        ? 'Update category details and classification.' 
                                        : 'Add a new category to group your financial transactions.'}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Category Name</label>
                                    <Input
                                        placeholder="e.g., Groceries, Salary, Utilities"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Type</label>
                                    <Select 
                                        value={data.type} 
                                        onValueChange={(val) => setData('type', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="expense">Expense</SelectItem>
                                            <SelectItem value="income">Income</SelectItem>
                                            <SelectItem value="transfer">Transfer</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                                </div>

                                {/* Preset Color Picker */}
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Badge Color</label>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {PRESET_COLORS.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setData('color', color)}
                                                className={`h-6 w-6 rounded-full transition-transform ${
                                                    data.color === color ? 'scale-125 ring-2 ring-primary ring-offset-2' : ''
                                                }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    {errors.color && <p className="text-xs text-destructive">{errors.color}</p>}
                                </div>

                                <DialogFooter>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setIsCreateOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {editingCategory ? 'Save Changes' : 'Create Category'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    {/* Delete Confirmation Alert Dialog */}
                    <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will permanently remove the <strong>{deletingCategory?.name}</strong> category. 
                                    Existing transactions linked to this category will remain, but their category tag will be cleared.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Delete Category
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}