import { useState, useEffect, useRef } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { 
    Plus, 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    ArrowUpRight, 
    ArrowDownRight, 
    ArrowLeftRight,
    Search,
    X,
    Filter
} from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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

export default function TransactionIndex({ auth, transactions, accounts = [], categories = [], filters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [deletingTransaction, setDeletingTransaction] = useState(null);

    // Filter states initialized from server props
    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedAccount, setSelectedAccount] = useState(filters.account_id || 'all');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const transactionList = Array.isArray(transactions) ? transactions : (transactions?.data || []);
    const paginationLinks = transactions?.links || [];

    const isFirstRender = useRef(true);

    // Apply filters via Inertia router visit
    const applyFilters = (overrides = {}) => {
        const query = {
            search: overrides.search !== undefined ? overrides.search : search,
            type: (overrides.type !== undefined ? overrides.type : selectedType) === 'all' ? '' : (overrides.type ?? selectedType),
            account_id: (overrides.account_id !== undefined ? overrides.account_id : selectedAccount) === 'all' ? '' : (overrides.account_id ?? selectedAccount),
            start_date: overrides.start_date !== undefined ? overrides.start_date : startDate,
            end_date: overrides.end_date !== undefined ? overrides.end_date : endDate,
        };

        router.get(route('transactions.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    // Debounced search handling
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            applyFilters({ search });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const handleResetFilters = () => {
        setSearch('');
        setSelectedType('all');
        setSelectedAccount('all');
        setStartDate('');
        setEndDate('');
        router.get(route('transactions.index'), {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters = search || selectedType !== 'all' || selectedAccount !== 'all' || startDate || endDate;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        account_id: accounts[0]?.id ? String(accounts[0].id) : '',
        category_id: '',
        type: 'expense',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

    const openCreateModal = () => {
        clearErrors();
        reset();
        setData({
            account_id: accounts[0]?.id ? String(accounts[0].id) : '',
            category_id: '',
            type: 'expense',
            amount: '',
            description: '',
            transaction_date: new Date().toISOString().split('T')[0],
        });
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const openEditModal = (transaction) => {
        clearErrors();
        setEditingTransaction(transaction);
        
        const rawDate = transaction.transaction_date || transaction.date;
        const formattedDate = rawDate ? String(rawDate).split('T')[0] : new Date().toISOString().split('T')[0];

        setData({
            account_id: transaction.account_id ? String(transaction.account_id) : '',
            category_id: transaction.category_id ? String(transaction.category_id) : '',
            type: transaction.type,
            amount: transaction.amount ? String(transaction.amount) : '',
            description: transaction.description || '',
            transaction_date: formattedDate,
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingTransaction) {
            put(route('transactions.update', editingTransaction.id), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post(route('transactions.store'), {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingTransaction) return;
        router.delete(route('transactions.destroy', deletingTransaction.id), {
            onSuccess: () => setDeletingTransaction(null),
        });
    };

    const handleTypeChange = (value) => {
        setData((prevData) => ({
            ...prevData,
            type: value,
            category_id: '',
        }));
    };

    const filteredCategories = categories.filter((c) => c.type === data.type);

    const getTypeBadge = (type) => {
        switch (type) {
            case 'income':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-medium">
                        <ArrowUpRight className="h-3.5 w-3.5" /> Income
                    </Badge>
                );
            case 'expense':
                return (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 font-medium">
                        <ArrowDownRight className="h-3.5 w-3.5" /> Expense
                    </Badge>
                );
            case 'transfer':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-medium">
                        <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer
                    </Badge>
                );
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <TooltipProvider>
            <SidebarProvider>
                <Head title="Transactions - SpendWise" />

                <AppSidebar user={auth.user} />

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h1 className="text-lg font-semibold tracking-tight">Transaction Management</h1>
                    </header>

                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
                                <p className="text-sm text-muted-foreground">
                                    Log and view income, expenses, and account transfers.
                                </p>
                            </div>

                            <Button onClick={openCreateModal} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Transaction
                            </Button>
                        </div>

                        {/* Filters Card */}
<Card>
    <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" /> Filter Transactions
        </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8 h-9 w-full"
                />
            </div>

            {/* Type Filter */}
            <div>
                <Select 
                    value={selectedType} 
                    onValueChange={(val) => {
                        setSelectedType(val);
                        applyFilters({ type: val });
                    }}
                >
                    <SelectTrigger className="h-9 w-full min-w-[140px]">
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="expense">Expense</SelectItem>
                        <SelectItem value="income">Income</SelectItem>
                        <SelectItem value="transfer">Transfer</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Account Filter */}
            <div>
                <Select 
                    value={selectedAccount} 
                    onValueChange={(val) => {
                        setSelectedAccount(val);
                        applyFilters({ account_id: val });
                    }}
                >
                    <SelectTrigger className="h-9 w-full min-w-[140px]">
                        <SelectValue placeholder="All Accounts" />
                    </SelectTrigger>
                    <SelectContent className="w-[var(--radix-select-trigger-width)]">
                        <SelectItem value="all">All Accounts</SelectItem>
                        {accounts.map((acc) => (
                            <SelectItem key={acc.id} value={String(acc.id)}>
                                {acc.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Start Date */}
            <div>
                <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                        setStartDate(e.target.value);
                        applyFilters({ start_date: e.target.value });
                    }}
                    className="h-9 w-full"
                />
            </div>

            {/* End Date */}
            <div>
                <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                        setEndDate(e.target.value);
                        applyFilters({ end_date: e.target.value });
                    }}
                    className="h-9 w-full"
                />
            </div>
        </div>

        {hasActiveFilters && (
            <div className="flex justify-end pt-1">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetFilters}
                    className="text-xs text-muted-foreground hover:text-foreground gap-1 h-8"
                >
                    <X className="h-3.5 w-3.5" /> Clear Filters
                </Button>
            </div>
        )}
    </CardContent>
</Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Transaction History</CardTitle>
                                <CardDescription>Recent financial activity recorded across all accounts.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Account</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="w-[80px] text-center">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactionList.length > 0 ? (
                                            transactionList.map((tx) => (
                                                <TableRow key={tx.id}>
                                                    <TableCell className="font-medium whitespace-nowrap">
                                                        {tx.transaction_date ? String(tx.transaction_date).split('T')[0] : (tx.date || '—')}
                                                    </TableCell>
                                                    <TableCell>{getTypeBadge(tx.type)}</TableCell>
                                                    <TableCell className="max-w-[200px] truncate">
                                                        {tx.description || <span className="text-muted-foreground text-xs italic">No description</span>}
                                                    </TableCell>
                                                    <TableCell>{tx.account?.name || '—'}</TableCell>
                                                    <TableCell>{tx.category?.name || '—'}</TableCell>
                                                    <TableCell className={`text-right font-semibold whitespace-nowrap ${
                                                        tx.type === 'income' ? 'text-emerald-600' : tx.type === 'expense' ? 'text-rose-600' : 'text-slate-900'
                                                    }`}>
                                                        {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                                        {formatCurrency(tx.amount)}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => openEditModal(tx)} className="cursor-pointer">
                                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => setDeletingTransaction(tx)} 
                                                                    className="cursor-pointer text-rose-600 focus:text-rose-600"
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
                                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                    No transactions match your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>

                            {paginationLinks.length > 3 && (
                                <CardFooter className="flex items-center justify-between border-t px-6 py-4">
                                    <div className="flex gap-1">
                                        {paginationLinks.map((link, idx) => (
                                            <Button
                                                key={idx}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.visit(link.url, { preserveState: true, preserveScroll: true })}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </main>
                </SidebarInset>

                {/* Create / Edit Dialog */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
                            <DialogDescription>
                                {editingTransaction 
                                    ? 'Update the details for this transaction.' 
                                    : 'Enter the details to record a new transaction.'}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4 py-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Type</label>
                                <Select value={data.type} onValueChange={handleTypeChange}>
                                    <SelectTrigger className="w-full h-10">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[280px]">
                                        <SelectItem value="expense">Expense</SelectItem>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="transfer">Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.type && <p className="text-xs text-rose-500">{errors.type}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Account</label>
                                <Select 
                                    value={data.account_id} 
                                    onValueChange={(val) => setData('account_id', val)}
                                >
                                    <SelectTrigger className="w-full h-10">
                                        <SelectValue placeholder="Select account" />
                                    </SelectTrigger>
                                    <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[280px]">
                                        {accounts && accounts.length > 0 ? (
                                            accounts.map((acc) => (
                                                <SelectItem key={acc.id} value={String(acc.id)}>
                                                    {acc.name} {acc.type ? `(${acc.type})` : ''}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-xs text-center text-muted-foreground">
                                                No accounts available. Create one under Accounts.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.account_id && <p className="text-xs text-rose-500">{errors.account_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Category</label>
                                <Select 
                                    value={data.category_id} 
                                    onValueChange={(val) => setData('category_id', val)}
                                >
                                    <SelectTrigger className="w-full h-10">
                                        <SelectValue placeholder="Select category (optional)" />
                                    </SelectTrigger>
                                    <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[280px]">
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <div className="p-2 text-xs text-center text-muted-foreground">
                                                No categories available for this transaction type.
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.category_id && <p className="text-xs text-rose-500">{errors.category_id}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Amount</label>
                                    <Input 
                                        type="number" 
                                        step="0.01" 
                                        placeholder="0.00" 
                                        value={data.amount} 
                                        onChange={(e) => setData('amount', e.target.value)} 
                                    />
                                    {errors.amount && <p className="text-xs text-rose-500">{errors.amount}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">Date</label>
                                    <Input 
                                        type="date" 
                                        value={data.transaction_date} 
                                        onChange={(e) => setData('transaction_date', e.target.value)} 
                                    />
                                    {errors.transaction_date && <p className="text-xs text-rose-500">{errors.transaction_date}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Description</label>
                                <Input 
                                    placeholder="e.g. Grocery shopping" 
                                    value={data.description} 
                                    onChange={(e) => setData('description', e.target.value)} 
                                />
                                {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {editingTransaction ? 'Save Changes' : 'Create Transaction'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Alert */}
                <AlertDialog open={!!deletingTransaction} onOpenChange={(open) => !open && setDeletingTransaction(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the transaction record.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </SidebarProvider>
        </TooltipProvider>
    );
}