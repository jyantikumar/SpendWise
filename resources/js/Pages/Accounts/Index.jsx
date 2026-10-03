import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Plus, 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    Wallet, 
    BadgeCheck, 
    BadgeX,
    CreditCard,
    CheckCircle2,
    ListFilter
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
import { Switch } from '@/components/ui/switch';
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

import AccountTransactionsModal from '@/components/AccountTransactionsModal';

export default function AccountIndex({ auth, accounts = [], accountTypes = [], categories = [] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [deletingAccount, setDeletingAccount] = useState(null);

    // Account Transactions Modal State
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isTxModalOpen, setIsTxModalOpen] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: accountTypes[0]?.name || '',
        balance: '0.00',
        currency: 'PHP',
        is_active: true,
    });

    const formatCurrency = (val, currency = 'PHP') => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(val || 0);

    const openCreateModal = () => {
        clearErrors();
        reset();
        setData({
            name: '',
            type: accountTypes[0]?.name || '',
            balance: '0.00',
            currency: 'PHP',
            is_active: true,
        });
        setEditingAccount(null);
        setIsModalOpen(true);
    };

    const openEditModal = (account) => {
        clearErrors();
        setEditingAccount(account);

        setData({
            name: account.name,
            type: account.type,
            balance: account.balance,
            currency: account.currency || 'PHP',
            is_active: Boolean(account.is_active),
        });

        setIsModalOpen(true);
    };

    const openTransactionsModal = (account) => {
        setSelectedAccount(account);
        setIsTxModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingAccount) {
            put(route('accounts.update', editingAccount.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('accounts.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
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
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h1 className="text-lg font-semibold tracking-tight">Account Management</h1>
                    </header>

                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Accounts & Assets</h2>
                                <p className="text-sm text-muted-foreground">
                                    Manage your bank accounts, wallets, credit cards, and custom liquidity sources.
                                </p>
                            </div>

                            <Button onClick={openCreateModal} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Account
                            </Button>
                        </div>

                        {/* KPI Summary */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Portfolio Balance</CardTitle>
                                    <Wallet className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(totalPortfolioBalance)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Across all active accounts</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{accounts.length}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Registered financial accounts</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Active Accounts</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-600">{activeAccountCount}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {inactiveAccountCount > 0 
                                            ? `${inactiveAccountCount} inactive ${inactiveAccountCount === 1 ? 'account' : 'accounts'}` 
                                            : 'All accounts active'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Accounts List Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Accounts</CardTitle>
                                <CardDescription>View active balances and account classifications. Click an account row or action menu to view transactions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Account Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Current Balance</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {accounts.length > 0 ? (
                                            accounts.map((acc) => (
                                                <TableRow key={acc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openTransactionsModal(acc)}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                                                                <Wallet className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold">{acc.name}</div>
                                                                <div className="text-xs text-muted-foreground">{acc.currency || 'PHP'}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {acc.type}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {acc.is_active ? (
                                                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 gap-1">
                                                                <BadgeCheck className="h-3 w-3" /> Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary" className="gap-1 text-muted-foreground">
                                                                <BadgeX className="h-3 w-3" /> Inactive
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-base">
                                                        {formatCurrency(acc.balance, acc.currency || 'PHP')}
                                                    </TableCell>
                                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon-sm"
                                                                    className="h-8 w-8 p-0"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => openTransactionsModal(acc)} className="cursor-pointer">
                                                                    <ListFilter className="mr-2 h-4 w-4" /> View Transactions
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => openEditModal(acc)} className="cursor-pointer">
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => setDeletingAccount(acc)} 
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
                                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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

                    {/* Create / Edit Account Modal */}
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent className="sm:max-w-[480px]">
                            <DialogHeader>
                                <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                                <DialogDescription>
                                    Set up your financial account details and balance.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Account Name</label>
                                    <Input
                                        placeholder="e.g., BDO Savings, GCash, Maya"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Account Type</label>
                                    <Select 
                                        value={data.type} 
                                        onValueChange={(value) => setData('type', value)}
                                    >
                                        <SelectTrigger className="w-full h-10">
                                            <SelectValue placeholder="Select account type" />
                                        </SelectTrigger>
                                        <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[280px]">
                                            {accountTypes && accountTypes.length > 0 ? (
                                                accountTypes.map((typeObj) => (
                                                    <SelectItem key={typeObj.id} value={typeObj.name}>
                                                        <div className="flex items-center gap-2">
                                                            {typeObj.color && (
                                                                <span 
                                                                    className="h-2.5 w-2.5 rounded-full shrink-0" 
                                                                    style={{ backgroundColor: typeObj.color }}
                                                                />
                                                            )}
                                                            <span>{typeObj.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <div className="p-2 text-xs text-center text-muted-foreground">
                                                    No account types found. Create one under Account Types.
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Balance</label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={data.balance}
                                            onChange={(e) => setData('balance', e.target.value)}
                                        />
                                        {errors.balance && <p className="text-xs text-destructive">{errors.balance}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium">Currency</label>
                                        <Input
                                            maxLength={3}
                                            className="uppercase"
                                            placeholder="PHP"
                                            value={data.currency}
                                            onChange={(e) => setData('currency', e.target.value.toUpperCase())}
                                        />
                                        {errors.currency && <p className="text-xs text-destructive">{errors.currency}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border rounded-lg p-3">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <label className="text-sm font-medium">Active Status</label>
                                            {data.is_active ? (
                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1 text-[11px] px-2 py-0">
                                                    <BadgeCheck className="h-3 w-3" /> Active
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="gap-1 text-muted-foreground text-[11px] px-2 py-0">
                                                    <BadgeX className="h-3 w-3" /> Inactive
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Include in overall portfolio balance</p>
                                    </div>
                                    <Switch
                                        checked={data.is_active}
                                        onCheckedChange={(checked) => setData('is_active', checked)}
                                    />
                                </div>

                                <DialogFooter>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        {editingAccount ? 'Save Changes' : 'Create Account'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

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
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
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