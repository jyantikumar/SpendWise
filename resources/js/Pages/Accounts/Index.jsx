import { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    Plus, 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    Wallet, 
    CreditCard,
    CheckCircle2,
    ListFilter,
    Power
} from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

import AccountTransactionsModal from '@/Pages/Accounts/components/AccountTransactionsModal';
import AccountFormModal from '@/Pages/Accounts/components/AccountFormModal';

export default function AccountIndex({ auth, accounts = [], accountTypes = [], categories = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [deletingAccount, setDeletingAccount] = useState(null);

    // Status Filter State (Default: active)
    const [statusFilter, setStatusFilter] = useState('active');

    // Account Transactions Modal State
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);

    const formatCurrency = (val, currency = 'PHP') => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(val || 0);

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

    const activeAccountCount = accounts.filter((a) => a.is_active).length;
    const inactiveAccountCount = accounts.filter((a) => !a.is_active).length;

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
                <div className="grid gap-3 sm:gap-4 grid-cols-2">
                    <Card className="border-zinc-800 py-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3.5 sm:px-4">
                            <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400">Total Balance</CardTitle>
                            <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                        </CardHeader>
                        <CardContent className="px-3.5 sm:px-4 pb-3 pt-1">
                            <div className="text-base sm:text-xl font-bold text-zinc-200">{formatCurrency(totalPortfolioBalance)}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800 py-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3.5 sm:px-4">
                            <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400">Total Accounts</CardTitle>
                            <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                        </CardHeader>
                        <CardContent className="px-3.5 sm:px-4 pb-3 pt-1">
                            <div className="text-base sm:text-xl font-bold text-zinc-200">{accounts.length}</div>
                        </CardContent>
                    </Card>
                </div>

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
                        <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 w-full sm:w-auto">
                            {['active', 'inactive', 'all'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`py-1.5 px-3 rounded-md text-xs font-medium capitalize text-center transition-all ${
                                        statusFilter === status 
                                            ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                                            : 'text-zinc-400 hover:text-zinc-200'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        {/* Mobile Cards View (Visible on screens smaller than `md`) */}
                        <div className="divide-y divide-zinc-800 md:hidden">
                            {filteredAccounts.length > 0 ? (
                                filteredAccounts.map((acc) => (
                                    <div 
                                        key={acc.id}
                                        className={`p-4 flex items-center justify-between gap-3 active:bg-zinc-800/50 transition-colors ${
                                            !acc.is_active ? 'opacity-60' : ''
                                        }`}
                                        onClick={() => openTransactionsModal(acc)}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Account Badge Icon */}
                                            <div 
                                                className="relative flex h-10 w-10 items-center justify-center rounded-lg border shrink-0"
                                                style={{ 
                                                    backgroundColor: acc.color ? `${acc.color}20` : '#27272a', 
                                                    borderColor: acc.color || '#3f3f46' 
                                                }}
                                            >
                                                <Wallet className="h-5 w-5" style={{ color: acc.color || '#f4f4f5' }} />
                                                
                                                {/* Status Indicator Dot */}
                                                <span 
                                                    className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 ${
                                                        acc.is_active ? 'bg-emerald-500' : 'bg-zinc-600'
                                                    }`} 
                                                />
                                            </div>

                                            <div className="truncate">
                                                <div className="font-semibold text-zinc-200 truncate flex items-center gap-1.5">
                                                    <span>{acc.name}</span>
                                                    {!acc.is_active && (
                                                        <span className="text-xs text-zinc-500 font-normal">(Inactive)</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-zinc-400">{acc.currency || 'PHP'}</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <div className="text-right">
                                                <div className="font-bold text-sm text-zinc-200">
                                                    {formatCurrency(acc.balance, acc.currency || 'PHP')}
                                                </div>
                                            </div>

                                            <div onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200"
                                                        >
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-300">
                                                        <DropdownMenuItem onClick={() => openTransactionsModal(acc)} className="cursor-pointer hover:bg-zinc-800">
                                                            <ListFilter className="mr-2 h-4 w-4 text-zinc-400" /> View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEditModal(acc)} className="cursor-pointer hover:bg-zinc-800">
                                                            <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleActive(acc)} className="cursor-pointer hover:bg-zinc-800">
                                                            <Power className="mr-2 h-4 w-4 text-zinc-400" />
                                                            {acc.is_active ? 'Deactivate' : 'Activate'}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem 
                                                            onClick={() => setDeletingAccount(acc)} 
                                                            className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4 text-rose-400" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 px-4 text-zinc-400 text-sm">
                                    No {statusFilter !== 'all' ? statusFilter : ''} accounts found.
                                </div>
                            )}
                        </div>

                        {/* Desktop Table View (Visible on `md` and larger screens) */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-800">
                                        <TableHead className="text-zinc-400">Account Name</TableHead>
                                        <TableHead className="text-right text-zinc-400">Balance</TableHead>
                                        <TableHead className="text-right text-zinc-400"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAccounts.length > 0 ? (
                                        filteredAccounts.map((acc) => (
                                            <TableRow 
                                                key={acc.id} 
                                                className={`cursor-pointer hover:bg-muted/50 border-b border-zinc-800 transition-colors ${
                                                    !acc.is_active ? 'opacity-60' : ''
                                                }`} 
                                                onClick={() => openTransactionsModal(acc)}
                                            >
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            className="relative flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 transition-colors"
                                                            style={{ 
                                                                backgroundColor: acc.color ? `${acc.color}20` : '#27272a', 
                                                                borderColor: acc.color || '#3f3f46' 
                                                            }}
                                                        >
                                                            <Wallet className="h-4 w-4" style={{ color: acc.color || '#f4f4f5' }} />
                                                            <span 
                                                                className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 ${
                                                                    acc.is_active ? 'bg-emerald-500' : 'bg-zinc-600'
                                                                }`} 
                                                                title={acc.is_active ? 'Active' : 'Inactive'}
                                                            />
                                                        </div>

                                                        <div>
                                                            <div className="font-semibold text-zinc-200 flex items-center gap-2">
                                                                {acc.name}
                                                                {!acc.is_active && (
                                                                    <span className="text-xs font-normal text-zinc-500">(Inactive)</span>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-zinc-400">{acc.currency || 'PHP'}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-base text-zinc-200">
                                                    {formatCurrency(acc.balance, acc.currency || 'PHP')}
                                                </TableCell>
                                                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon-sm"
                                                                className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="border-zinc-800 bg-background text-zinc-300">
                                                            <DropdownMenuItem onClick={() => openTransactionsModal(acc)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                                <ListFilter className="mr-2 h-4 w-4 text-zinc-400" /> View
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEditModal(acc)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                                <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleToggleActive(acc)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                                <Power className="mr-2 h-4 w-4 text-zinc-400" />
                                                                {acc.is_active ? 'Deactivate' : 'Activate'}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem 
                                                                onClick={() => setDeletingAccount(acc)} 
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
                                                No {statusFilter !== 'all' ? statusFilter : ''} accounts found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Account Transactions Modal */}
            <AccountTransactionsModal
                isOpen={isTxModalOpen}
                onClose={() => setIsTxModalOpen(false)}
                account={selectedAccount}
                categories={categories}
            />

            {/* Reusable Account Form Modal */}
            <AccountFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingAccount={editingAccount}
                accountTypes={accountTypes}
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