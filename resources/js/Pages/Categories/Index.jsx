import { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    Plus, 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    ArrowLeftRight,
    ListFilter,
    Power
} from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

import CategoryTransactionsModal from '@/components/CategoryTransactionsModal';
import CategoryFormModal from '@/components/CategoryFormModal';

export default function CategoryIndex({ auth, categories = [], accounts = [] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    
    // Filters State
    const [selectedTab, setSelectedTab] = useState('all'); // Type filter: 'all', 'expense', 'income', 'transfer'
    const [statusFilter, setStatusFilter] = useState('active'); // Status filter: 'active', 'inactive', 'all'

    // Category Transactions Modal State
    const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const openCreateModal = () => {
        setEditingCategory(null);
        setIsCreateOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setIsCreateOpen(true);
    };

    const openTransactionsModal = (category) => {
        setSelectedCategoryForModal(category);
        setIsCategoryModalOpen(true);
    };

    const handleToggleActive = (category) => {
        router.patch(route('categories.toggle-active', category.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Category "${category.name}" ${category.is_active ? 'deactivated' : 'activated'}.`);
            },
            onError: () => {
                toast.error('Failed to update category status.');
            }
        });
    };

    const handleDelete = () => {
        if (!deletingCategory) return;
        router.delete(route('categories.destroy', deletingCategory.id), {
            onSuccess: () => {
                toast.success(`Category "${deletingCategory.name}" permanently deleted.`);
                setDeletingCategory(null);
            },
            onError: () => {
                toast.error('Failed to delete category.');
            }
        });
    };

    // Filter categories list by type and active status
    const filteredCategories = categories.filter((cat) => {
        // Status Filter
        if (statusFilter === 'active' && !cat.is_active) return false;
        if (statusFilter === 'inactive' && cat.is_active) return false;

        // Type Filter
        if (selectedTab !== 'all' && cat.type !== selectedTab) return false;

        return true;
    });

    const renderTypeBadge = (type) => {
        switch (type) {
            case 'income':
                return (
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1">
                        <ArrowUpCircle className="h-3 w-3" /> Income
                    </Badge>
                );
            case 'expense':
                return (
                    <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-400 gap-1">
                        <ArrowDownCircle className="h-3 w-3" /> Expense
                    </Badge>
                );
            case 'transfer':
                return (
                    <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400 gap-1">
                        <ArrowLeftRight className="h-3 w-3" /> Transfer
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="border-zinc-800 text-zinc-300">{type}</Badge>;
        }
    };

    return (
        <AppLayout title="Categories" headerTitle="Category Management">
            <div className="space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Categories</h2>
                        <p className="text-sm text-zinc-400">
                            Organize your cash flow into custom income, expense, and transfer categories.
                        </p>
                    </div>

                    <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2">
                        <Plus className="h-4 w-4" /> Add Category
                    </Button>
                </div>

                {/* Category Card Container */}
                <Card className="border-zinc-800">
                    <CardHeader className="p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-zinc-200">All Categories</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Tap or click any category to view recorded transactions.
                            </CardDescription>
                        </div>

                        {/* Filter Select Controls Row */}
                        <div className="grid grid-cols-2 gap-2.5 w-full md:w-auto md:flex md:items-center">
                            {/* Status Select */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-9 w-full md:w-[130px] border-zinc-800 text-zinc-300 bg-zinc-900">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-300">
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="all">All Status</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Type Select */}
                            <Select value={selectedTab} onValueChange={setSelectedTab}>
                                <SelectTrigger className="h-9 w-full md:w-[140px] border-zinc-800 text-zinc-300 bg-zinc-900">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-300">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        {/* Mobile Cards View */}
                        <div className="divide-y divide-zinc-800 md:hidden">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((cat) => (
                                    <div 
                                        key={cat.id}
                                        className={`p-4 flex items-center justify-between gap-3 active:bg-zinc-800/50 transition-colors cursor-pointer ${
                                            !cat.is_active ? 'opacity-60' : ''
                                        }`}
                                        onClick={() => openTransactionsModal(cat)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div 
                                                className="h-3.5 w-3.5 rounded-full shrink-0" 
                                                style={{ backgroundColor: cat.color || '#3b82f6' }}
                                            />
                                            <div className="truncate">
                                                <div className="font-medium text-zinc-200 text-sm truncate flex items-center gap-1.5">
                                                    <span>{cat.name}</span>
                                                    {!cat.is_active && (
                                                        <span className="text-xs text-zinc-500 font-normal">(Inactive)</span>
                                                    )}
                                                </div>
                                                <div className="mt-1">
                                                    {renderTypeBadge(cat.type)}
                                                </div>
                                            </div>
                                        </div>

                                        <div onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button 
                                                        type="button"
                                                        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 outline-none transition-colors"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-300">
                                                    <DropdownMenuItem onClick={() => openTransactionsModal(cat)} className="cursor-pointer hover:bg-zinc-800">
                                                        <ListFilter className="mr-2 h-4 w-4 text-zinc-400" /> View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(cat)} className="cursor-pointer hover:bg-zinc-800">
                                                        <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleActive(cat)} className="cursor-pointer hover:bg-zinc-800">
                                                        <Power className="mr-2 h-4 w-4 text-zinc-400" />
                                                        {cat.is_active ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => setDeletingCategory(cat)} 
                                                        className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4 text-rose-400" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 px-4 text-zinc-400 text-sm">
                                    No categories match your criteria.
                                </div>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-800">
                                        <TableHead className="text-zinc-400">Category Name</TableHead>
                                        <TableHead className="text-zinc-400">Type</TableHead>
                                        <TableHead className="text-right text-zinc-400"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map((cat) => (
                                            <TableRow 
                                                key={cat.id}
                                                className={`cursor-pointer hover:bg-muted/50 border-b border-zinc-800 transition-colors ${
                                                    !cat.is_active ? 'opacity-60' : ''
                                                }`}
                                                onClick={() => openTransactionsModal(cat)}
                                            >
                                                <TableCell className="font-medium text-zinc-300">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            className="h-3.5 w-3.5 rounded-full shrink-0" 
                                                            style={{ backgroundColor: cat.color || '#3b82f6' }}
                                                        />
                                                        <span className="flex items-center gap-2">
                                                            {cat.name}
                                                            {!cat.is_active && (
                                                                <span className="text-xs font-normal text-zinc-500">(Inactive)</span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{renderTypeBadge(cat.type)}</TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <button 
                                                                type="button"
                                                                className="h-8 w-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 outline-none transition-colors"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="border-zinc-800 bg-background text-zinc-300">
                                                            <DropdownMenuItem onClick={() => openTransactionsModal(cat)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                                <ListFilter className="mr-2 h-4 w-4 text-zinc-400" /> View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditModal(cat)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                                <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleToggleActive(cat)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                                <Power className="mr-2 h-4 w-4 text-zinc-400" />
                                                                {cat.is_active ? 'Deactivate' : 'Activate'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => setDeletingCategory(cat)} 
                                                                className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4 text-rose-400" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow className="border-b border-zinc-800">
                                            <TableCell colSpan={3} className="text-center py-8 text-zinc-400">
                                                No categories match your criteria.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Category Transactions Modal */}
            <CategoryTransactionsModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                category={selectedCategoryForModal}
                accounts={accounts}
            />

            {/* Reusable Category Form Modal */}
            <CategoryFormModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                editingCategory={editingCategory}
            />

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the <strong>{deletingCategory?.name}</strong> category. 
                            Existing transactions linked to this category will remain intact.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}