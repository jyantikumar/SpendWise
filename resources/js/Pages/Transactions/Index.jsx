import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { 
    Plus, 
    Search, 
    X, 
    Filter, 
    Wallet, 
    DollarSign, 
    TrendingUp, 
    TrendingDown, 
    SlidersHorizontal,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

import { TransactionDetailSheet } from '@/components/TransactionDetailSheet';
import TransactionFormModal from '@/components/TransactionFormModal';

export default function TransactionIndex({ auth, transactions, accounts = [], categories = [], filters = {}, kpis = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [deletingTransaction, setDeletingTransaction] = useState(null);
    const [selectedDetailTransaction, setSelectedDetailTransaction] = useState(null);

    const [search, setSearch] = useState(filters.search || '');
    const [selectedType, setSelectedType] = useState(filters.type || 'all');
    const [selectedAccount, setSelectedAccount] = useState(filters.account_id || 'all');
    const [selectedRange, setSelectedRange] = useState(filters.range || 'this_month');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const transactionList = Array.isArray(transactions) ? transactions : (transactions?.data || []);
    
    // Pagination Metadata
    const prevLink = transactions?.prev_page_url || transactions?.links?.find(l => l.label.includes('Previous'))?.url;
    const nextLink = transactions?.next_page_url || transactions?.links?.find(l => l.label.includes('Next'))?.url;
    const currentPage = transactions?.current_page || 1;
    const lastPage = transactions?.last_page || 1;
    const fromRecord = transactions?.from || 0;
    const toRecord = transactions?.to || 0;
    const totalRecords = transactions?.total || 0;

    const isFirstRender = useRef(true);

    const applyFilters = (overrides = {}) => {
        const query = {
            search: overrides.search !== undefined ? overrides.search : search,
            type: (overrides.type !== undefined ? overrides.type : selectedType) === 'all' ? '' : (overrides.type ?? selectedType),
            account_id: (overrides.account_id !== undefined ? overrides.account_id : selectedAccount) === 'all' ? '' : (overrides.account_id ?? selectedAccount),
            range: overrides.range !== undefined ? overrides.range : selectedRange,
            start_date: overrides.start_date !== undefined ? overrides.start_date : startDate,
            end_date: overrides.end_date !== undefined ? overrides.end_date : endDate,
        };

        router.get(route('transactions.index'), query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

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

    const handleRangeChange = (val) => {
        setSelectedRange(val);
        if (val !== 'custom') {
            applyFilters({ range: val, start_date: '', end_date: '' });
        }
    };

    const handleApplyCustomDates = () => {
        if (startDate && endDate) {
            applyFilters({ range: 'custom', start_date: startDate, end_date: endDate });
        }
    };

    const handleResetFilters = () => {
        setSearch('');
        setSelectedType('all');
        setSelectedAccount('all');
        setSelectedRange('this_month');
        setStartDate('');
        setEndDate('');
        router.get(route('transactions.index'), {}, { preserveState: true, replace: true });
    };

    const hasActiveFilters = search || selectedType !== 'all' || selectedAccount !== 'all' || selectedRange !== 'this_month';

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const openCreateModal = () => {
        setEditingTransaction(null);
        setIsModalOpen(true);
    };

    const openEditModal = (transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (!deletingTransaction) return;
        router.delete(route('transactions.destroy', deletingTransaction.id), {
            onSuccess: () => {
                toast.success('Transaction deleted successfully.');
                setDeletingTransaction(null);
                setSelectedDetailTransaction(null);
            },
            onError: () => {
                toast.error('Failed to delete transaction.');
            }
        });
    };

    return (
        <AppLayout title="Transactions" headerTitle="Transaction Management">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Transactions</h2>
                    <p className="text-sm text-zinc-400">
                        Log and view income, expenses, and account transfers.
                    </p>
                </div>

                <Button onClick={openCreateModal} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Transaction
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-200">{formatCurrency(kpis?.totalBalance)}</div>
                        <p className="text-xs text-zinc-400 mt-1">Across liquid accounts</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{formatCurrency(kpis?.totalIncome)}</div>
                        <p className="text-xs text-zinc-400 mt-1">Earned for current filter</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-500">{formatCurrency(kpis?.totalExpense)}</div>
                        <p className="text-xs text-zinc-400 mt-1">Spent for current filter</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Net Cash Flow</CardTitle>
                        <DollarSign className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${kpis?.netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatCurrency(kpis?.netCashFlow)}
                        </div>
                        <p className="text-xs text-zinc-400 mt-1">Income minus expenses</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters Card */}
            <Card className="border-zinc-800">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium flex items-center gap-2 text-zinc-200">
                        <Filter className="h-4 w-4 text-zinc-400" /> Filter Transactions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[200px] flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="Search description..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 h-9 w-full border-zinc-800 text-zinc-300"
                            />
                        </div>

                        <div className="w-[140px]">
                            <Select 
                                value={selectedType} 
                                onValueChange={(val) => {
                                    setSelectedType(val);
                                    applyFilters({ type: val });
                                }}
                            >
                                <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300">
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-background text-zinc-300">
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="expense">Expense</SelectItem>
                                    <SelectItem value="income">Income</SelectItem>
                                    <SelectItem value="transfer">Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[150px]">
                            <Select 
                                value={selectedAccount} 
                                onValueChange={(val) => {
                                    setSelectedAccount(val);
                                    applyFilters({ account_id: val });
                                }}
                            >
                                <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300">
                                    <SelectValue placeholder="All Accounts" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-background text-zinc-300">
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map((acc) => (
                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="w-[150px]">
                            <Select value={selectedRange} onValueChange={handleRangeChange}>
                                <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Range" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-background text-zinc-300">
                                    <SelectItem value="this_day">This Day</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                    <SelectItem value="this_year">This Year</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                    <SelectItem value="all">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedRange === 'custom' && (
                            <div className="flex items-center gap-2">
                                <Input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-[130px] h-9 border-zinc-800 text-zinc-300 text-xs"
                                />
                                <span className="text-xs text-zinc-400">to</span>
                                <Input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-[130px] h-9 border-zinc-800 text-zinc-300 text-xs"
                                />
                                <Button size="sm" variant="secondary" onClick={handleApplyCustomDates} className="h-9 px-3">
                                    Apply
                                </Button>
                            </div>
                        )}

                        {hasActiveFilters && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleResetFilters}
                                className="text-xs text-zinc-400 hover:text-zinc-200 gap-1 h-9 ml-auto"
                            >
                                <X className="h-3.5 w-3.5" /> Clear
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Transaction History Table */}
            <Card className="border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-zinc-200">Transaction History</CardTitle>
                    <CardDescription className="text-zinc-400">Recent financial activity recorded across all accounts. Click any row to view details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-zinc-800">
                                <TableHead className="text-zinc-400">Date</TableHead>
                                <TableHead className="text-zinc-400">Description</TableHead>
                                <TableHead className="text-zinc-400">Account</TableHead>
                                <TableHead className="text-right text-zinc-400">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactionList.length > 0 ? (
                                transactionList.map((tx) => (
                                    <TableRow 
                                        key={tx.id} 
                                        className="cursor-pointer hover:bg-muted/50 border-b border-zinc-800 transition-colors"
                                        onClick={() => setSelectedDetailTransaction(tx)}
                                    >
                                        <TableCell className="font-medium whitespace-nowrap text-zinc-300 text-xs">
                                            {tx.transaction_date ? String(tx.transaction_date).split('T')[0] : (tx.date || '—')}
                                        </TableCell>
                                        
                                        <TableCell className="max-w-[200px] truncate text-zinc-300 text-sm">
                                            {tx.description || <span className="text-zinc-500 text-xs italic">No description</span>}
                                        </TableCell>
                                        <TableCell className="text-xs text-zinc-400">
                                            {tx.type === 'transfer' ? (
                                                <span className="inline-flex items-center gap-1.5 font-medium">
                                                    <span>{tx.account?.name || '—'}</span>
                                                    <span className="text-zinc-500 font-normal text-xs">→</span>
                                                    <span className="text-emerald-400">
                                                        {tx.destination_account?.name || accounts.find(a => String(a.id) === String(tx.destination_account_id))?.name || '—'}
                                                    </span>
                                                </span>
                                            ) : (
                                                tx.account?.name || '—'
                                            )}
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold text-sm whitespace-nowrap ${
                                            tx.type === 'income' 
                                                ? 'text-emerald-500' 
                                                : tx.type === 'expense' 
                                                ? 'text-rose-500' 
                                                : 'text-blue-400'
                                        }`}>
                                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                            {formatCurrency(tx.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow className="border-b border-zinc-800">
                                    <TableCell colSpan={4} className="h-24 text-center text-zinc-400">
                                        No transactions match your criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {totalRecords > 0 && (
                    <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-6 py-4 text-xs text-zinc-400">
                        <div>
                            Showing <span className="font-medium text-zinc-200">{fromRecord}</span> to{' '}
                            <span className="font-medium text-zinc-200">{toRecord}</span> of{' '}
                            <span className="font-medium text-zinc-200">{totalRecords}</span> records
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!prevLink}
                                onClick={() => prevLink && router.visit(prevLink, { preserveState: true, preserveScroll: true })}
                                className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                            >
                                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                            </Button>

                            <span className="text-xs font-medium text-zinc-300 px-1">
                                {currentPage} / {lastPage}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!nextLink}
                                onClick={() => nextLink && router.visit(nextLink, { preserveState: true, preserveScroll: true })}
                                className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                            >
                                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </Card>

            <TransactionDetailSheet 
                open={!!selectedDetailTransaction}
                onOpenChange={(open) => !open && setSelectedDetailTransaction(null)}
                transaction={selectedDetailTransaction}
                onEdit={openEditModal}
                onDelete={setDeletingTransaction}
            />

            <TransactionFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingTransaction={editingTransaction}
                accounts={accounts}
                categories={categories}
            />

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
        </AppLayout>
    );
}