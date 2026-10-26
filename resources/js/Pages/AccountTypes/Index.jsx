// resources/js/Pages/AccountTypes/Index.jsx
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

import AccountTypeFormModal from '@/Pages/AccountTypes/components/AccountTypeFormModal';
import AccountTypeDetailsModal from '@/Pages/AccountTypes/components/AccountTypeDetailsModal';
import AccountTypeTableList from '@/Pages/AccountTypes/components/AccountTypeTableList'; // 👈 Removed curly braces here

export default function AccountTypeIndex({ auth, accountTypes = [], categories = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [viewingType, setViewingType] = useState(null);
    const [deletingType, setDeletingType] = useState(null);

    // Get user's preferred currency from auth props (defaults to PHP if not set)
    const userCurrency = auth?.user?.currency || 'PHP';

    const formatCurrency = (val, currency = userCurrency) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || userCurrency }).format(val || 0);

    const openCreateModal = () => {
        setEditingType(null);
        setIsModalOpen(true);
    };

    const openEditModal = (type) => {
        setEditingType(type);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (!deletingType) return;
        router.delete(route('account-types.destroy', deletingType.id), {
            onSuccess: () => {
                toast.success(`Account type "${deletingType.name}" deleted successfully.`);
                setDeletingType(null);
            },
            onError: () => {
                toast.error('Failed to delete account type.');
            }
        });
    };

    return (
        <AppLayout title="Account Types" headerTitle="Account Types">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-100"></h2>
                        <p className="text-sm text-zinc-400">
                            Define asset classes, banking types, and wallet classifications for your accounts.
                        </p>
                    </div>

                    <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2">
                        <Plus className="h-4 w-4" /> Add Account Type
                    </Button>
                </div>

                {/* Account Types Container */}
                <Card className="border-zinc-800">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-zinc-200">All Account Types</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Manage classifications and color badges.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        <AccountTypeTableList 
                            accountTypes={accountTypes}
                            setViewingType={setViewingType}
                            openEditModal={openEditModal}
                            setDeletingType={setDeletingType}
                            formatCurrency={formatCurrency}
                            userCurrency={userCurrency}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* View Linked Accounts Details Modal */}
            <AccountTypeDetailsModal
                isOpen={!!viewingType}
                onClose={() => setViewingType(null)}
                accountType={viewingType}
                categories={categories}
                userCurrency={userCurrency}
            />

            {/* Reusable Account Type Form Modal */}
            <AccountTypeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingType={editingType}
            />

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deletingType} onOpenChange={() => setDeletingType(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account Type?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deletingType?.name}</strong>? 
                            Accounts linked to this type will retain their name, but their type classification link will be cleared.
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