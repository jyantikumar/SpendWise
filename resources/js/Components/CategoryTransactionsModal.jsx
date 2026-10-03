import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, 
    Filter, 
    X, 
    Loader2, 
    Tag, 
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function CategoryTransactionsModal({ 
    isOpen, 
    onClose, 
    category, 
    accounts = [], 
    initialStartDate = '', 
    initialEndDate = '' 
}) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);

    // Filter States
    const [search, setSearch] = useState('');
    const [selectedAccount, setSelectedAccount] = useState('all');
    const [startDate, setStartDate] = useState(initialStartDate);
    const [endDate, setEndDate] = useState(initialEndDate);

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    // Sync initial date bounds when modal opens
    useEffect(() => {
        if (isOpen) {
            setStartDate(initialStartDate);
            setEndDate(initialEndDate);
            setSearch('');
            setSelectedAccount('all');
        }
    }, [isOpen, initialStartDate, initialEndDate]);

    // Fetch category transactions on filter change
    useEffect(() => {
        if (!isOpen || !category?.id) return;

        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('categories.transactions', category.id), {
                    params: {
                        search,
                        account_id: selectedAccount,
                        start_date: startDate,
                        end_date: endDate,
                    },
                });
                setTransactions(response.data.transactions || []);
                setTotalAmount(response.data.totalAmount || 0);
            } catch (err) {
                console.error('Failed to load category transactions:', err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchTransactions, 300);
        return () => clearTimeout(timer);
    }, [isOpen, category?.id, search, selectedAccount, startDate, endDate]);

    const handleReset = () => {
        setSearch('');
        setSelectedAccount('all');
        setStartDate(initialStartDate);
        setEndDate(initialEndDate);
    };

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[780px] max-h-[85vh] flex flex-col p-6">
                <DialogHeader className="pb-2 border-b">
                    <div className="flex items-center justify-between pr-6">
                        <div className="flex items-center gap-3">
                            <span 
                                className="h-4 w-4 rounded-full shrink-0" 
                                style={{ backgroundColor: category?.color || '#3b82f6' }}
                            />
                            <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                {category?.name || 'Category'} Transactions
                            </DialogTitle>
                        </div>
                        <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">
                            Total: {formatCurrency(totalAmount)}
                        </Badge>
                    </div>
                    <DialogDescription className="text-xs text-muted-foreground mt-1">
                        Viewing all transactions recorded under this category.
                    </DialogDescription>
                </DialogHeader>

                {/* Filter Controls Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 py-3 border-b bg-muted/30 -mx-6 px-6">
                    {/* Search Input */}
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search description..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 h-8 text-xs"
                        />
                    </div>

                    {/* Account Filter */}
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="All Accounts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Accounts</SelectItem>
                            {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={String(acc.id)}>
                                    {acc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Start Date */}
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-8 text-xs"
                    />

                    {/* End Date */}
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-8 text-xs"
                    />
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
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="font-medium text-xs whitespace-nowrap">
                                            {tx.transaction_date ? String(tx.transaction_date).split('T')[0] : '—'}
                                        </TableCell>
                                        <TableCell>{getTypeBadge(tx.type)}</TableCell>
                                        <TableCell className="max-w-[200px] truncate text-xs">
                                            {tx.description || <span className="text-muted-foreground italic">No description</span>}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {tx.type === 'transfer' ? (
                                                <span className="inline-flex items-center gap-1 font-medium">
                                                    <span>{tx.account?.name || '—'}</span>
                                                    <span className="text-muted-foreground">→</span>
                                                    <span className="text-emerald-600">
                                                        {tx.destination_account?.name || '—'}
                                                    </span>
                                                </span>
                                            ) : (
                                                tx.account?.name || '—'
                                            )}
                                        </TableCell>
                                        <TableCell className={`text-right font-semibold text-xs whitespace-nowrap ${
                                            tx.type === 'income' 
                                                ? 'text-emerald-600' 
                                                : tx.type === 'expense' 
                                                ? 'text-rose-600' 
                                                : 'text-blue-600'
                                        }`}>
                                            {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                            {formatCurrency(tx.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-center text-muted-foreground">
                            <Tag className="h-8 w-8 stroke-1 mb-2 opacity-50" />
                            <p className="text-sm font-medium">No transactions found</p>
                            <p className="text-xs opacity-75 mt-0.5">Try adjusting your date range or account filter.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}