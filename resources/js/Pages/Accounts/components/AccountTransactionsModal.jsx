// resources/js/Pages/Accounts/components/AccountTransactionsModal.jsx
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
    Search, 
    Loader2, 
    Wallet, 
    ChevronLeft,
    ChevronRight,
    Filter,
    X
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { TransactionDetailSheet } from '@/Pages/Transactions/components/TransactionDetailSheet';
import { AccountTransactionsFilterSheet } from '@/Pages/Accounts/components/AccountTransactionsFilterSheet';

export default function AccountTransactionsModal({ 
    isOpen, 
    onClose, 
    account, 
    categories = [], 
    initialStartDate = '', 
    initialEndDate = '',
    userCurrency = 'PHP' 
}) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [summaryAmount, setSummaryAmount] = useState(0);

    // Filter States (Applied)
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('all'); 
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);

    // Temporary Filter States inside Sheet before applying
    const [tempStartDate, setTempStartDate] = useState(initialStartDate);
    const [tempEndDate, setTempEndDate] = useState(initialEndDate);
    const [tempSelectedCategory, setTempSelectedCategory] = useState('all');

    const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationData, setPaginationData] = useState({
        current_page: 1,
        last_page: 1,
        from: 0,
        to: 0,
        total: 0,
    });

    // Transaction Detail Sheet State
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

    const abortControllerRef = useRef(null);

    const formatCurrency = (val, currency = userCurrency) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || userCurrency }).format(val || 0);

    // Sync initial bounds only when opening modal
    useEffect(() => {
        if (isOpen) {
            setStartDate(initialStartDate || '');
            setEndDate(initialEndDate || '');
            setTempStartDate(initialStartDate || '');
            setTempEndDate(initialEndDate || '');
            setSearch('');
            setSelectedType('all');
            setSelectedCategory('all');
            setTempSelectedCategory('all');
            setCurrentPage(1);
        }
    }, [isOpen, initialStartDate, initialEndDate]);

    // Active filter calculation (dates + category)
    const activeFilterCount = [
        startDate !== (initialStartDate || '') || endDate !== (initialEndDate || ''),
        selectedCategory !== 'all'
    ].filter(Boolean).length;

    const handleSheetOpenChange = (open) => {
        if (open) {
            setTempStartDate(startDate);
            setTempEndDate(endDate);
            setTempSelectedCategory(selectedCategory);
        }
        setIsFilterSheetOpen(open);
    };

    const handleApplyFilters = () => {
        setStartDate(tempStartDate);
        setEndDate(tempEndDate);
        setSelectedCategory(tempSelectedCategory);
        setCurrentPage(1);
        setIsFilterSheetOpen(false);
    };

    const handleResetFilters = () => {
        setTempStartDate(initialStartDate || '');
        setTempEndDate(initialEndDate || '');
        setTempSelectedCategory('all');
    };

    const handleClearSingleFilter = (filterType) => {
        if (filterType === 'date') {
            setStartDate(initialStartDate || '');
            setEndDate(initialEndDate || '');
            setTempStartDate(initialStartDate || '');
            setTempEndDate(initialEndDate || '');
        } else if (filterType === 'category') {
            setSelectedCategory('all');
            setTempSelectedCategory('all');
        }
        setCurrentPage(1);
    };

    // Handle segmented type change & reset selected category back to 'all'
    const handleTypeChange = (newType) => {
        setSelectedType(newType);
        setSelectedCategory('all');
        setTempSelectedCategory('all');
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

    const handleRowClick = (tx) => {
        setSelectedTransaction({
            ...tx,
            date: tx.date || (tx.transaction_date ? String(tx.transaction_date).split('T')[0] : null)
        });
        setIsDetailSheetOpen(true);
    };

    // Dynamic Summary Badge Logic
    const renderSummaryBadge = () => {
        const curr = userCurrency;

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

        const displayBalance = (selectedCategory !== 'all') 
            ? summaryAmount 
            : (account?.balance ?? summaryAmount);

        return (
            <Badge 
                variant="outline" 
                className={`text-xs font-semibold px-2.5 py-1 whitespace-nowrap ${
                    displayBalance >= 0 
                        ? 'bg-zinc-800 text-zinc-200 border-zinc-700' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                }`}
            >
                Balance: {formatCurrency(displayBalance, curr)}
            </Badge>
        );
    };

    const selectedCategoryName = categories.find(c => String(c.id) === String(selectedCategory))?.name;

    return (
        <>
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

                            {/* Total Badge */}
                            <div className="shrink-0">
                                {renderSummaryBadge()}
                            </div>
                        </div>
                    </DialogHeader>

                    {/* Filter Controls Bar */}
                    <div className="flex items-center gap-2.5 py-3 border-b border-zinc-800 bg-zinc-900/40 -mx-4 px-4 sm:-mx-6 sm:px-6 shrink-0">
                        {/* Segmented Type Filter */}
                        <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs w-56 shrink-0">
                            {[
                                { label: 'All', value: 'all' },
                                { label: 'Expenses', value: 'expense' },
                                { label: 'Income', value: 'income' },
                            ].map((pill) => (
                                <button
                                    key={pill.value}
                                    type="button"
                                    onClick={() => handleTypeChange(pill.value)}
                                    className={`w-full py-1 rounded-md font-medium text-xs text-center transition-all whitespace-nowrap ${
                                        selectedType === pill.value
                                            ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                                            : 'text-zinc-400 hover:text-zinc-200'
                                    }`}
                                >
                                    {pill.label}
                                </button>
                            ))}
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                            <Input
                                placeholder="Search description..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-8 h-9 text-xs w-full border-zinc-800 text-zinc-300 bg-background"
                            />
                        </div>

                        {/* Filter Trigger Button */}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSheetOpenChange(true)}
                            className="h-9 px-3 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs gap-2 shrink-0 bg-background"
                        >
                            <Filter className="h-3.5 w-3.5" />
                            <span>Filters</span>
                            {activeFilterCount > 0 && (
                                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* Active Filter Chips Bar */}
                    {(startDate !== (initialStartDate || '') || endDate !== (initialEndDate || '') || selectedCategory !== 'all') && (
                        <div className="flex items-center gap-1.5 py-2 px-1 shrink-0 flex-wrap">
                            <span className="text-[11px] text-zinc-400 font-medium mr-1">Active filters:</span>
                            
                            {(startDate !== (initialStartDate || '') || endDate !== (initialEndDate || '')) && (
                                <Badge variant="outline" className="text-[11px] py-0.5 px-2 border-zinc-800 bg-zinc-900 text-zinc-300 gap-1.5">
                                    {startDate} to {endDate}
                                    <button onClick={() => handleClearSingleFilter('date')} className="hover:text-zinc-100">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}

                            {selectedCategory !== 'all' && (
                                <Badge variant="outline" className="text-[11px] py-0.5 px-2 border-zinc-800 bg-zinc-900 text-zinc-300 gap-1.5">
                                    Category: {selectedCategoryName}
                                    <button onClick={() => handleClearSingleFilter('category')} className="hover:text-zinc-100">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Transactions Table Container */}
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
                                        <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx) => (
                                        <TableRow 
                                            key={tx.id} 
                                            onClick={() => handleRowClick(tx)}
                                            className="border-b border-zinc-800 hover:bg-muted/50 cursor-pointer transition-colors"
                                        >
                                            <TableCell className="font-medium text-xs whitespace-nowrap text-zinc-300">
                                                {tx.transaction_date ? String(tx.transaction_date).split('T')[0] : '—'}
                                            </TableCell>
                                            <TableCell className="max-w-[150px] sm:max-w-[200px] truncate text-xs text-zinc-300">
                                                {tx.description || <span className="text-zinc-500 italic">No description</span>}
                                            </TableCell>
                                          
                                            <TableCell className={`text-right font-semibold text-xs whitespace-nowrap ${
                                                tx.type === 'income' 
                                                    ? 'text-emerald-400' 
                                                    : tx.type === 'expense' 
                                                    ? 'text-rose-400' 
                                                    : 'text-blue-400'
                                            }`}>
                                                {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                                {formatCurrency(tx.amount, userCurrency)}
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

            {/* Filter Sheet */}
            <AccountTransactionsFilterSheet 
                isOpen={isFilterSheetOpen}
                onOpenChange={handleSheetOpenChange}
                startDate={tempStartDate}
                setStartDate={setTempStartDate}
                endDate={tempEndDate}
                setEndDate={setTempEndDate}
                selectedCategory={tempSelectedCategory}
                setSelectedCategory={setTempSelectedCategory}
                categories={categories}
                selectedType={selectedType}
                handleResetFilters={handleResetFilters}
                handleApplyFilters={handleApplyFilters}
                activeFilterCount={activeFilterCount}
            />

            {/* Transaction Detail Sheet */}
            <TransactionDetailSheet 
                open={isDetailSheetOpen}
                onOpenChange={setIsDetailSheetOpen}
                transaction={selectedTransaction}
                userCurrency={userCurrency}
            />
        </>
    );
}