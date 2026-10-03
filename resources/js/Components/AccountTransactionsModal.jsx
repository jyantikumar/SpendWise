import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, 
    Loader2, 
    Wallet, 
    ArrowUpRight, 
    ArrowDownRight, 
    ArrowLeftRight 
} from 'lucide-react';

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function AccountTransactionsModal({ 
    isOpen, 
    onClose, 
    account, 
    categories = [], 
    initialStartDate = '', 
    initialEndDate = '' 
}) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Filter States
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);

    const formatCurrency = (val, currency = 'PHP') => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency }).format(val || 0);

    // Sync initial bounds only when opening modal
    useEffect(() => {
        if (isOpen) {
            setStartDate(initialStartDate || '');
            setEndDate(initialEndDate || '');
            setSearch('');
            setSelectedType('all');
            setSelectedCategory('all');
        }
    }, [isOpen]);

    // Fetch account transactions on filter change
    useEffect(() => {
        if (!isOpen || !account?.id) return;

        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('accounts.transactions', account.id), {
                    params: {
                        search,
                        type: selectedType,
                        category_id: selectedCategory,
                        start_date: startDate,
                        end_date: endDate,
                    },
                });
                setTransactions(response.data.transactions || []);
            } catch (err) {
                console.error('Failed to load account transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchTransactions, 300);
        return () => clearTimeout(timer);
    }, [isOpen, account?.id, search, selectedType, selectedCategory, startDate, endDate]);

    const getTypeBadge = (type) => {
        switch (type) {
            case 'income':
                return (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 font-medium">
                        <ArrowUpRight className="h-3 w-3" /> Income
                    </Badge>
                );
            case 'expense':
                return (
                    <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 gap-1 font-medium">
                        <ArrowDownRight className="h-3 w-3" /> Expense
                    </Badge>
                );
            case 'transfer':
                return (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 font-medium">
                        <ArrowLeftRight className="h-3 w-3" /> Transfer
                    </Badge>
                );
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    // Dynamic Summary Badge Logic
    const renderSummaryBadge = () => {
        const curr = account?.currency || 'PHP';

        if (selectedType === 'expense') {
            const totalExpense = transactions
                .filter((tx) => tx.type === 'expense')
                .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

            return (
                <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 text-sm font-semibold px-3 py-1">
                    Total Expense: {formatCurrency(totalExpense, curr)}
                </Badge>
            );
        }

        if (selectedType === 'income') {
            const totalIncome = transactions
                .filter((tx) => tx.type === 'income')
                .reduce((sum, tx) => sum + (parseFloat(tx.amount) || 0), 0);

            return (
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-sm font-semibold px-3 py-1">
                    Total Income: {formatCurrency(totalIncome, curr)}
                </Badge>
            );
        }

        // Default ('all' or 'transfer'): calculate net cash flow
        const netCashFlow = transactions.reduce((sum, tx) => {
            const amt = parseFloat(tx.amount) || 0;
            if (tx.type === 'income') return sum + amt;
            if (tx.type === 'expense') return sum - amt;
            if (tx.type === 'transfer') {
                return tx.destination_account_id === account?.id ? sum + amt : sum - amt;
            }
            return sum;
        }, 0);

        return (
            <Badge 
                variant="outline" 
                className={`text-sm font-semibold px-3 py-1 ${
                    netCashFlow >= 0 
                        ? 'bg-zinc-50 text-zinc-700 border-zinc-200' 
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
            >
                Net Cash Flow: {formatCurrency(netCashFlow, curr)}
            </Badge>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[820px] max-h-[85vh] flex flex-col p-6">
                <DialogHeader className="pb-2 border-b">
                    <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                                <Wallet className="h-4 w-4" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    {account?.name || 'Account'} Transactions
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                                    Viewing activity for this account.
                                </DialogDescription>
                            </div>
                        </div>

                        {renderSummaryBadge()}
                    </div>
                </DialogHeader>

                {/* Filter Controls Bar with Uniform Column Widths */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 py-3 border-b bg-muted/30 -mx-6 px-6">
                    {/* Search Input */}
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 h-8 text-xs w-full"
                        />
                    </div>

                    {/* Transaction Type Filter */}
                    <div className="w-full">
                        <Select value={selectedType} onValueChange={setSelectedType}>
                            <SelectTrigger className="h-8 text-xs w-full">
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

                    {/* Category Filter */}
                    <div className="w-full">
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="h-8 text-xs w-full">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="w-[var(--radix-select-trigger-width)]">
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Start Date */}
                    <div className="w-full">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-8 text-xs w-full"
                        />
                    </div>

                    {/* End Date */}
                    <div className="w-full">
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-8 text-xs w-full"
                        />
                    </div>
                </div>

                {/* Transactions Table Container */}
                <div className="flex-1 overflow-y-auto min-h-[260px] pt-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-xs">Loading transactions...</span>
                        </div>
                    ) : transactions.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-medium text-xs whitespace-nowrap">
                                            {tx.transaction_date ? String(tx.transaction_date).split('T')[0] : '—'}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate text-xs">
                                            {tx.description || <span className="text-muted-foreground italic">No description</span>}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {tx.category?.name || '—'}
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold text-xs whitespace-nowrap ${
                                            tx.type === 'income' 
                                                ? 'text-emerald-600' 
                                                : tx.type === 'expense' 
                                                ? 'text-rose-600' 
                                                : 'text-blue-600'
                                        }`}>
                                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                            {formatCurrency(tx.amount, account?.currency || 'PHP')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                            <Wallet className="h-8 w-8 stroke-1 mb-2 opacity-50" />
                            <p className="text-sm font-medium">No transactions found</p>
                            <p className="text-xs opacity-75 mt-0.5">Try adjusting your filters or date range.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}