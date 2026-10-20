import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    Search, 
    Loader2, 
    Wallet, 
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
    const [summaryAmount, setSummaryAmount] = useState(0);

    // Filter States
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState({
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0,
    });

    const abortControllerRef = useRef(null);

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
            setCurrentPage(1);
        }
    }, [isOpen, initialStartDate, initialEndDate]);

    // Reset page back to 1 whenever filters change
    const handleFilterChange = (setter, value) => {
        setter(value);
        setCurrentPage(1);
    };

    // Fetch account transactions on filter / page change
    const fetchTransactions = async (searchTerm, page = 1) => {
        if (!account?.id) return;

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();

        setLoading(true);
        try {
            const parsedCategoryId = (selectedCategory && selectedCategory !== 'all')
                ? parseInt(selectedCategory, 10)
                : '';

            const response = await axios.get(route('accounts.transactions', account.id), {
                params: {
                    search: searchTerm,
                    type: selectedType,
                    category_id: parsedCategoryId,
                    start_date: startDate,
                    end_date: endDate,
                    page,
                },
                signal: abortControllerRef.current.signal,
            });

            setTransactions(response.data.transactions || []);
            setSummaryAmount(response.data.summaryAmount || 0);
            if (response.data.pagination) {
                setPaginationData(response.data.pagination);
            }
        } catch (err) {
            if (!axios.isCancel(err)) {
                console.error('Failed to load account transactions:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen || !account?.id) return;

        const timer = setTimeout(() => {
            fetchTransactions(search, currentPage);
        }, search ? 200 : 0);

        return () => clearTimeout(timer);
    }, [isOpen, account?.id, search, selectedType, selectedCategory, startDate, endDate, currentPage]);

    // Dynamic Summary Badge Logic
    const renderSummaryBadge = () => {
        const curr = account?.currency || 'PHP';

        if (selectedType === 'expense') {
            return (
                <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                    Total Expense: {formatCurrency(summaryAmount, curr)}
                </Badge>
            );
        }

        if (selectedType === 'income') {
            return (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-semibold px-2.5 py-1 whitespace-nowrap">
                    Total Income: {formatCurrency(summaryAmount, curr)}
                </Badge>
            );
        }

        return (
            <Badge 
                variant="outline" 
                className={`text-xs font-semibold px-2.5 py-1 whitespace-nowrap ${
                    summaryAmount >= 0 
                        ? 'bg-zinc-800 text-zinc-200 border-zinc-700' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
            >
                Balance: {formatCurrency(summaryAmount, curr)}
            </Badge>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[820px] max-h-[90vh] sm:max-h-[85vh] flex flex-col p-4 sm:p-6 border-zinc-800 bg-background overflow-hidden">
                {/* Header */}
                <DialogHeader className="pb-3 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center justify-between pr-8 sm:pr-10 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="min-w-0">
                                <DialogTitle className="text-lg sm:text-xl font-bold text-zinc-200 truncate">
                                    {account?.name || 'Account'}
                                </DialogTitle>
                                <DialogDescription className="text-xs text-zinc-400 mt-0.5 truncate">
                                    Account transactions.
                                </DialogDescription>
                            </div>
                        </div>

                        {/* Total Badge inline near Close (X) button */}
                        <div className="shrink-0">
                            {renderSummaryBadge()}
                        </div>
                    </div>
                </DialogHeader>

                {/* Filter Controls Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 py-3 border-b border-zinc-800 bg-zinc-900/40 -mx-4 px-4 sm:-mx-6 sm:px-6 shrink-0">
                    {/* Search Input */}
                    <div className="relative col-span-2 sm:col-span-1">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                        <Input
                            placeholder="Search description..."
                            value={search}
                            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                            className="pl-8 h-8 text-xs w-full border-zinc-800 text-zinc-300"
                        />
                    </div>

                    {/* Transaction Type Filter */}
                    <div className="w-full col-span-1">
                        <Select value={selectedType} onValueChange={(val) => handleFilterChange(setSelectedType, val)}>
                            <SelectTrigger className="h-8 text-xs w-full border-zinc-800 text-zinc-300">
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

                    {/* Category Filter */}
                    <div className="w-full col-span-1">
                        <Select value={selectedCategory} onValueChange={(val) => handleFilterChange(setSelectedCategory, val)}>
                            <SelectTrigger className="h-8 text-xs w-full border-zinc-800 text-zinc-300">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="border-zinc-800 bg-background text-zinc-300">
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
                    <div className="w-full col-span-1">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                            className="h-8 text-xs w-full border-zinc-800 text-zinc-300"
                        />
                    </div>

                    {/* End Date */}
                    <div className="w-full col-span-1">
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
                            className="h-8 text-xs w-full border-zinc-800 text-zinc-300"
                        />
                    </div>
                </div>

                {/* Transactions Table Container (Hidden Scrollbar) */}
                <div className="flex-1 overflow-y-auto min-h-[200px] my-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 gap-2 text-zinc-400">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-xs">Loading page {currentPage}...</span>
                        </div>
                    ) : transactions.length > 0 ? (
                        <Table>
                            <TableHeader className="sticky top-0 bg-background z-10">
                                <TableRow className="border-b border-zinc-800">
                                    <TableHead className="text-zinc-400">Date</TableHead>
                                    <TableHead className="text-zinc-400">Description</TableHead>
                                    <TableHead className="text-zinc-400">Category</TableHead>
                                    <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id} className="border-b border-zinc-800 hover:bg-muted/50 transition-colors">
                                        <TableCell className="font-medium text-xs whitespace-nowrap text-zinc-300">
                                            {tx.transaction_date ? String(tx.transaction_date).split('T')[0] : '—'}
                                        </TableCell>
                                        <TableCell className="max-w-[150px] sm:max-w-[200px] truncate text-xs text-zinc-300">
                                            {tx.description || <span className="text-zinc-500 italic">No description</span>}
                                        </TableCell>
                                        <TableCell className="text-xs text-zinc-400">
                                            {tx.category?.name || '—'}
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold text-xs whitespace-nowrap ${
                                            tx.type === 'income' 
                                                ? 'text-emerald-400' 
                                                : tx.type === 'expense' 
                                                ? 'text-rose-400' 
                                                : 'text-blue-400'
                                        }`}>
                                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                            {formatCurrency(tx.amount, account?.currency || 'PHP')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-zinc-400">
                            <Wallet className="h-8 w-8 stroke-1 mb-2 opacity-50" />
                            <p className="text-sm font-medium text-zinc-300">No transactions found</p>
                            <p className="text-xs opacity-75 mt-0.5">Try adjusting your filters or date range.</p>
                        </div>
                    )}
                </div>

                {/* Pagination Footer */}
                {paginationData.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-zinc-800 pt-3 text-xs text-zinc-400 shrink-0">
                        <div>
                            Showing <span className="font-medium text-zinc-200">{paginationData.from || 0}</span> to{' '}
                            <span className="font-medium text-zinc-200">{paginationData.to || 0}</span> of{' '}
                            <span className="font-medium text-zinc-200">{paginationData.total}</span> records
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage <= 1 || loading}
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                className="h-7 px-2 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                            >
                                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                            </Button>

                            <span className="text-xs font-medium text-zinc-300 px-1">
                                {currentPage} / {paginationData.last_page || 1}
                            </span>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage >= paginationData.last_page || loading}
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, paginationData.last_page))}
                                className="h-7 px-2 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                            >
                                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}