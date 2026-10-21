import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Plus, 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    Wallet, 
    CreditCard,
    CheckCircle2,
    ListFilter
} from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
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

import AccountTransactionsModal from '@/components/AccountTransactionsModal';
import AccountFormModal from '@/components/AccountFormModal';

export default function AccountIndex({ auth, accounts = [], accountTypes = [], categories = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [deletingAccount, setDeletingAccount] = useState(null);

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

    const handleDelete = () => {
        if (!deletingAccount) return;
        router.delete(route('accounts.destroy', deletingAccount.id), {
            onSuccess: () => setDeletingAccount(null),
        });
    };

    const totalPortfolioBalance = accounts.reduce(
        (sum, acc) => sum + (acc.is_active ? parseFloat(acc.balance || 0) : 0), 
        0
    );

    const activeAccountCount = accounts.filter((a) => a.is_active).length;
    const inactiveAccountCount = accounts.filter((a) => !a.is_active).length;

    return (
        <TooltipProvider>
            <SidebarProvider>
                <Head title="Accounts - SpendWise" />

                <AppSidebar user={auth.user} />

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-800" />
                        <h1 className="text-lg font-semibold tracking-tight text-zinc-200">Account Management</h1>
                    </header>

                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Accounts & Assets</h2>
                                <p className="text-sm text-zinc-400">
                                    Manage your bank accounts, wallets, credit cards, and custom liquidity sources.
                                </p>
                            </div>

                            <Button onClick={openCreateModal} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Account
                            </Button>
                        </div>

                        {/* KPI Summary */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Total Portfolio Balance</CardTitle>
                                    <Wallet className="h-4 w-4 text-zinc-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-zinc-200">{formatCurrency(totalPortfolioBalance)}</div>
                                    <p className="text-xs text-zinc-400 mt-1">Across all active accounts</p>
                                </CardContent>
                            </Card>

                            <Card className="border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Total Accounts</CardTitle>
                                    <CreditCard className="h-4 w-4 text-zinc-400" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-zinc-200">{accounts.length}</div>
                                    <p className="text-xs text-zinc-400 mt-1">Registered financial accounts</p>
                                </CardContent>
                            </Card>

                            <Card className="border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Active Accounts</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-500">{activeAccountCount}</div>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        {inactiveAccountCount > 0 
                                            ? `${inactiveAccountCount} inactive ${inactiveAccountCount === 1 ? 'account' : 'accounts'}` 
                                            : 'All accounts active'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Accounts List Table */}
                        <Card className="border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-zinc-200">All Accounts</CardTitle>
                                <CardDescription className="text-zinc-400">View active balances and account classifications. Click an account row or action menu to view transactions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-zinc-800">
                                            <TableHead className="text-zinc-400">Account Name</TableHead>
                                            <TableHead className="text-right text-zinc-400">Balance</TableHead>
                                            <TableHead className="text-right text-zinc-400"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {accounts.length > 0 ? (
                                            accounts.map((acc) => (
                                                <TableRow 
                                                    key={acc.id} 
                                                    className={`cursor-pointer hover:bg-muted/50 border-b border-zinc-800 transition-colors ${
                                                        !acc.is_active ? 'opacity-60' : ''
                                                    }`} 
                                                    onClick={() => openTransactionsModal(acc)}
                                                >
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            {/* Account Badge Icon with Saved Dynamic Hex Color */}
                                                            <div 
                                                                className="relative flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 transition-colors"
                                                                style={{ 
                                                                    backgroundColor: acc.color ? `${acc.color}20` : '#27272a', 
                                                                    borderColor: acc.color || '#3f3f46' 
                                                                }}
                                                            >
                                                                <Wallet className="h-4 w-4" style={{ color: acc.color || '#f4f4f5' }} />
                                                                
                                                                {/* Status Dot Indicator */}
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
                                                    No accounts created yet. Click "Add Account" to get started.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </main>

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
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}