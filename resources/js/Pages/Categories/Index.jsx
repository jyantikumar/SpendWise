import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

import CategoryTransactionsModal from '@/Pages/Categories/components/CategoryTransactionsModal';
import CategoryFormModal from '@/Pages/Categories/components/CategoryFormModal';
import { CategoryFilterSelects } from '@/Pages/Categories/components/CategoryFilterSelects';
import { CategoryTableList } from '@/Pages/Categories/components/CategoryTableList';

export default function CategoryIndex({ auth, categories = [], accounts = [] }) {
    const userCurrency = auth?.user?.currency || 'PHP';

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

    return (
        <AppLayout title="Categories" headerTitle="Category Management">
            <div className="space-y-6">
                {/* Header Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-100"></h2>
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
                        <CategoryFilterSelects 
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            selectedTab={selectedTab}
                            setSelectedTab={setSelectedTab}
                        />
                    </CardHeader>

                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        <CategoryTableList 
                            filteredCategories={filteredCategories}
                            openTransactionsModal={openTransactionsModal}
                            openEditModal={openEditModal}
                            handleToggleActive={handleToggleActive}
                            setDeletingCategory={setDeletingCategory}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Category Transactions Modal */}
            <CategoryTransactionsModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                category={selectedCategoryForModal}
                accounts={accounts}
                userCurrency={userCurrency}
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