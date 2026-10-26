// resources/js/Pages/Accounts/Index.jsx
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

import AccountTransactionsModal from '@/Pages/Accounts/components/AccountTransactionsModal';
import AccountFormModal from '@/Pages/Accounts/components/AccountFormModal';

import { AccountKpiGrid } from '@/Pages/Accounts/components/AccountKpiGrid';
import { AccountFilterTabs } from '@/Pages/Accounts/components/AccountFilterTabs';
import { AccountTableList } from '@/Pages/Accounts/components/AccountTableList';

export default function AccountIndex({ auth, accounts = [], accountTypes = [], categories = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [deletingAccount, setDeletingAccount] = useState(null);

    // Status Filter State (Default: active)
    const [statusFilter, setStatusFilter] = useState('active');

    // Account Transactions Modal State
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);

    // Get user's preferred currency from auth props (defaults to PHP if not set)[cite: 27]
    const userCurrency = auth?.user?.currency || 'PHP';

    const formatCurrency = (val, currency = userCurrency) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || userCurrency }).format(val || 0);

    const openCreateModal = () => {
        setEditingAccount(null);
        setIsModalOpen(true);
    };

    const openEditModal = (account) => {
        setEditingAccount(account);
        setIsModalOpen(true);
    };

    const openTransactionsModal = (account) => {
        setSelectedAccount(account);
        setIsTxModalOpen(true);
    };

    const handleToggleActive = (account) => {
        router.patch(`/accounts/${account.id}/toggle-active`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Account "${account.name}" ${account.is_active ? 'deactivated' : 'activated'}.`);
            },
            onError: () => {
                toast.error('Failed to update account status.');
            }
        });
    };

    const handleDelete = () => {
        if (!deletingAccount) return;
        router.delete(`/accounts/${deletingAccount.id}`, {
            onSuccess: () => {
                toast.success(`Account "${deletingAccount.name}" deleted successfully.`);
                setDeletingAccount(null);
            },
            onError: () => {
                toast.error('Failed to delete account.');
            }
        });
    };

    const totalPortfolioBalance = accounts.reduce(
        (sum, acc) => sum + (acc.is_active ? parseFloat(acc.balance || 0) : 0), 
        0
    );

    // Filter accounts list based on status filter
    const filteredAccounts = accounts.filter((acc) => {
        if (statusFilter === 'active') return acc.is_active;
        if (statusFilter === 'inactive') return !acc.is_active;
        return true; // 'all'
    });

    return (
        <AppLayout title="Accounts" headerTitle="Account Management">
            <div className="space-y-6">
                {/* Top Action Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-100"></h2>
                        <p className="text-sm text-zinc-400">
                            Manage your bank accounts, wallets, credit cards, and custom liquidity sources.
                        </p>
                    </div>

                    <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2">
                        <Plus className="h-4 w-4" /> Add Account
                    </Button>
                </div>

                {/* KPI Summary Grid */}
                <AccountKpiGrid 
                    totalPortfolioBalance={totalPortfolioBalance}
                    accountsCount={accounts.length}
                    formatCurrency={formatCurrency}
                    userCurrency={userCurrency}
                />

                {/* Accounts List Container */}
                <Card className="border-zinc-800">
                    <CardHeader className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-zinc-200">All Accounts</CardTitle>
                            <CardDescription className="text-zinc-400">
                                View active balances and account classifications. Tap an account to view transactions.
                            </CardDescription>
                        </div>

                        {/* Segmented Status Filter Tabs */}
                        <AccountFilterTabs 
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                        />
                    </CardHeader>

                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        <AccountTableList 
                            filteredAccounts={filteredAccounts}
                            statusFilter={statusFilter}
                            openTransactionsModal={openTransactionsModal}
                            openEditModal={openEditModal}
                            handleToggleActive={handleToggleActive}
                            setDeletingAccount={setDeletingAccount}
                            formatCurrency={formatCurrency}
                            userCurrency={userCurrency} // 👈 Pass userCurrency down here!
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Account Transactions Modal */}
            <AccountTransactionsModal
                isOpen={isTxModalOpen}
                onClose={() => setIsTxModalOpen(false)}
                account={selectedAccount}
                categories={categories}
                userCurrency={userCurrency}
            />

            {/* Reusable Account Form Modal */}
            <AccountFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingAccount={editingAccount}
                accountTypes={accountTypes}
                userCurrency={userCurrency}
            />

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deletingAccount} onOpenChange={() => setDeletingAccount(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deletingAccount?.name}</strong>? 
                            This will soft-delete the account.
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