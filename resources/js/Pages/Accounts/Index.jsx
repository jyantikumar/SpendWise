import { useState, useMemo } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Plus, 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    Wallet, 
    BadgeCheck, 
    BadgeX,
    Check
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

const DEFAULT_TYPES = [
    'Bank Account',
    'Cash / Wallet',
    'Credit Card',
    'E-Wallet',
    'Investment',
];

export default function AccountIndex({ auth, accounts }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [deletingAccount, setDeletingAccount] = useState(null);
    
    // Custom option creation state
    const [customTypes, setCustomTypes] = useState([]);
    const [isAddingNewType, setIsAddingNewType] = useState(false);
    const [newTypeInput, setNewTypeInput] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        type: 'Bank Account',
        balance: '0.00',
        currency: 'USD',
        is_active: true,
    });

    // Merge default options, custom dynamically added options, and any existing account types from DB
    const availableTypes = useMemo(() => {
        const dbTypes = accounts.map((acc) => acc.type);
        const combined = [...new Set([...DEFAULT_TYPES, ...customTypes, ...dbTypes])];
        return combined.filter(Boolean);
    }, [accounts, customTypes]);

    const formatCurrency = (val, currency = 'USD') => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(val || 0);

    const openCreateModal = () => {
        clearErrors();
        reset();
        setEditingAccount(null);
        setIsAddingNewType(false);
        setNewTypeInput('');
        setIsModalOpen(true);
    };

    const openEditModal = (account) => {
        clearErrors();
        setEditingAccount(account);
        setIsAddingNewType(false);
        setNewTypeInput('');

        setData({
            name: account.name,
            type: account.type,
            balance: account.balance,
            currency: account.currency || 'USD',
            is_active: Boolean(account.is_active),
        });

        setIsModalOpen(true);
    };

    const handleTypeSelectChange = (value) => {
        if (value === '__add_new__') {
            setIsAddingNewType(true);
            setNewTypeInput('');
        } else {
            setIsAddingNewType(false);
            setData('type', value);
        }
    };

    const handleConfirmNewType = () => {
        const trimmed = newTypeInput.trim();
        if (!trimmed) return;

        if (!customTypes.includes(trimmed)) {
            setCustomTypes((prev) => [...prev, trimmed]);
        }
        setData('type', trimmed);
        setIsAddingNewType(false);
        setNewTypeInput('');
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

                        {/* Portfolio Summary Header */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="md:col-span-1">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Portfolio Balance</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold tracking-tight">
                                        {formatCurrency(totalPortfolioBalance)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Across all active accounts</p>
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Account Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center gap-6">
                                    <div>
                                        <div className="text-2xl font-bold">{accounts.length}</div>
                                        <p className="text-xs text-muted-foreground">Total Accounts</p>
                                    </div>
                                    <Separator orientation="vertical" className="h-8" />
                                    <div>
                                        <div className="text-2xl font-bold text-emerald-600">
                                            {accounts.filter((a) => a.is_active).length}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Active</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Accounts List Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>All Accounts</CardTitle>
                                <CardDescription>View active balances and account classifications.</CardDescription>
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
                                                <TableRow key={acc.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                                                                <Wallet className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold">{acc.name}</div>
                                                                <div className="text-xs text-muted-foreground">{acc.currency}</div>
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
                                                        {formatCurrency(acc.balance, acc.currency)}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground outline-none"
                                                                >
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
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

                    {/* Create / Edit Account Modal */}
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogContent className="sm:max-w-[425px]">
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
                                        placeholder="e.g., Chase Checking, BDO Savings, GCash"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                </div>

                                {/* Dynamic Account Type Dropdown with Inline Creation */}
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Account Type</label>
                                    
                                    {!isAddingNewType ? (
                                        <Select 
                                            value={data.type} 
                                            onValueChange={handleTypeSelectChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableTypes.map((typeOption) => (
                                                    <SelectItem key={typeOption} value={typeOption}>
                                                        {typeOption}
                                                    </SelectItem>
                                                ))}
                                                <Separator className="my-1" />
                                                <SelectItem value="__add_new__" className="font-semibold text-primary cursor-pointer">
                                                    + Add Custom Type...
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Input
                                                autoFocus
                                                placeholder="Enter custom type name..."
                                                value={newTypeInput}
                                                onChange={(e) => setNewTypeInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleConfirmNewType();
                                                    }
                                                }}
                                            />
                                            <Button 
                                                type="button" 
                                                size="icon" 
                                                onClick={handleConfirmNewType}
                                                disabled={!newTypeInput.trim()}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                size="sm"
                                                onClick={() => setIsAddingNewType(false)}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
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
                                            placeholder="USD"
                                            value={data.currency}
                                            onChange={(e) => setData('currency', e.target.value.toUpperCase())}
                                        />
                                        {errors.currency && <p className="text-xs text-destructive">{errors.currency}</p>}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border rounded-lg p-3">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium">Active Status</label>
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