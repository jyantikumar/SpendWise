import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { 
    Wallet, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    ArrowUpRight, 
    Plus, 
    PieChart as PieChartIcon,
    SlidersHorizontal
} from 'lucide-react';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

import CategoryTransactionsModal from '@/components/CategoryTransactionsModal';
import AccountTransactionsModal from '@/components/AccountTransactionsModal';
import TransactionFormModal from '@/components/TransactionFormModal';
import { TransactionDetailSheet } from '@/components/TransactionDetailSheet';

function ExpensePieChart({ data = [], formatCurrency, onCategoryClick }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const total = data.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

    if (total === 0 || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground min-h-[300px]">
                <PieChartIcon className="h-10 w-10 stroke-1 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-zinc-400">No expense records for this period.</p>
            </div>
        );
    }

    let cumulativeAngle = 0;
    const slices = data.map((item, index) => {
        const value = parseFloat(item.total) || 0;
        const percentage = (value / total) * 100;
        const angle = (value / total) * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angle;
        cumulativeAngle += angle;

        const cx = 100, cy = 100, rOut = 80, rIn = 52;
        const radStart = ((startAngle - 90) * Math.PI) / 180;
        const radEnd = ((endAngle - 90) * Math.PI) / 180;

        const x1Out = cx + rOut * Math.cos(radStart);
        const y1Out = cy + rOut * Math.sin(radStart);
        const x2Out = cx + rOut * Math.cos(radEnd);
        const y2Out = cy + rOut * Math.sin(radEnd);

        const x1In = cx + rIn * Math.cos(radStart);
        const y1In = cy + rIn * Math.sin(radStart);
        const x2In = cx + rIn * Math.cos(radEnd);
        const y2In = cy + rIn * Math.sin(radEnd);

        const largeArc = angle >= 360 ? 1 : angle > 180 ? 1 : 0;

        let pathData = '';
        if (angle >= 359.99) {
            pathData = `M ${cx} ${cy - rOut} A ${rOut} ${rOut} 0 1 1 ${cx - 0.01} ${cy - rOut} L ${cx - 0.01} ${cy - rIn} A ${rIn} ${rIn} 0 1 0 ${cx} ${cy - rIn} Z`;
        } else {
            pathData = `M ${x1Out} ${y1Out} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2Out} ${y2Out} L ${x2In} ${y2In} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x1In} ${y1In} Z`;
        }

        return {
            ...item,
            value,
            percentage,
            pathData,
            color: item.color || '#3b82f6',
        };
    });

    const activeItem = hoveredIndex !== null ? slices[hoveredIndex] : null;

    return (
        <div className="flex flex-col items-center gap-4 h-full min-h-0 flex-1">
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center my-1">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    {slices.map((slice, index) => (
                        <path
                            key={slice.id || index}
                            d={slice.pathData}
                            fill={slice.color}
                            className="transition-all duration-200 cursor-pointer hover:opacity-90"
                            style={{
                                transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                                transformOrigin: '100px 100px',
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            onClick={() => onCategoryClick && onCategoryClick(slice)}
                        />
                    ))}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider truncate max-w-[90px]">
                        {activeItem ? activeItem.name : 'Total'}
                    </span>
                    <span className="text-sm font-bold tracking-tight text-zinc-300">
                        {activeItem ? formatCurrency(activeItem.value) : formatCurrency(total)}
                    </span>
                    {activeItem && (
                        <span className="text-[10px] text-zinc-400 font-medium">
                            {activeItem.percentage.toFixed(1)}%
                        </span>
                    )}
                </div>
            </div>

            <div className="w-full space-y-1.5 overflow-y-auto max-h-[220px] sm:max-h-[300px] pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {slices.map((slice, index) => (
                    <div
                        key={slice.id || index}
                        className={`flex items-center justify-between p-2 rounded-md transition-colors cursor-pointer text-xs ${
                            hoveredIndex === index ? 'bg-zinc-800 font-medium text-zinc-100' : 'hover:bg-zinc-800/50 text-zinc-300'
                        }`}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => onCategoryClick && onCategoryClick(slice)}
                    >
                        <div className="flex items-center gap-2 truncate pr-2">
                            <span
                                className="h-2.5 w-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: slice.color }}
                            />
                            <span className="truncate">{slice.name}</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <span className="text-zinc-400 text-[11px] font-mono">
                                {slice.percentage.toFixed(0)}%
                            </span>
                            <span className="font-semibold">{formatCurrency(slice.value)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Dashboard({ 
    auth, 
    kpis, 
    categoryBreakdown, 
    latestTransactions = [], 
    accounts = [], 
    accountTypes = [],
    categories = [], 
    currentFilter = 'this_day',
    customDates = {}
}) {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [deletingTransaction, setDeletingTransaction] = useState(null);
    const [selectedDetailTransaction, setSelectedDetailTransaction] = useState(null);

    const [activeView, setActiveView] = useState('transactions');

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

    const [startDateInput, setStartDateInput] = useState(customDates.startDate || '');
    const [endDateInput, setEndDateInput] = useState(customDates.endDate || '');

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const formatDateOnly = (dateString) => {
        if (!dateString) return '';
        return dateString.split('T')[0];
    };

    const handleFilterChange = (value) => {
        if (value === 'custom') {
            router.get('/dashboard', { 
                range: 'custom',
                start_date: startDateInput,
                end_date: endDateInput
            }, { preserveState: true });
        } else {
            router.get('/dashboard', { range: value }, { preserveState: true });
        }
    };

    const handleApplyCustomDates = () => {
        if (startDateInput && endDateInput) {
            router.get('/dashboard', { 
                range: 'custom', 
                start_date: startDateInput, 
                end_date: endDateInput 
            }, { preserveState: true });
        }
    };

    const getDateBoundaries = () => {
        const today = new Date();
        const formatDate = (d) => d.toISOString().split('T')[0];

        if (currentFilter === 'this_day') {
            return { startDate: formatDate(today), endDate: formatDate(today) };
        } else if (currentFilter === 'this_week') {
            const first = today.getDate() - today.getDay();
            const last = first + 6;
            return { startDate: formatDate(new Date(today.setDate(first))), endDate: formatDate(new Date(today.setDate(last))) };
        } else if (currentFilter === 'last_30_days') {
            const past = new Date();
            past.setDate(today.getDate() - 30);
            return { startDate: formatDate(past), endDate: formatDate(today) };
        } else if (currentFilter === 'this_year') {
            const yearStart = new Date(today.getFullYear(), 0, 1);
            return { startDate: formatDate(yearStart), endDate: formatDate(today) };
        } else if (currentFilter === 'custom') {
            return { startDate: startDateInput, endDate: endDateInput };
        } else {
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return { startDate: formatDate(monthStart), endDate: formatDate(today) };
        }
    };

    const { startDate: initialModalStart, endDate: initialModalEnd } = getDateBoundaries();

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setIsCategoryModalOpen(true);
    };

    const handleAccountClick = (acc) => {
        setSelectedAccount(acc);
        setIsAccountModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingTransaction(null);
        setIsTransactionModalOpen(true);
    };

    const openEditModal = (transaction) => {
        setEditingTransaction(transaction);
        setIsTransactionModalOpen(true);
    };

    const handleDelete = () => {
        if (!deletingTransaction) return;
        router.delete(`/transactions/${deletingTransaction.id}`, {
            onSuccess: () => setDeletingTransaction(null),
        });
    };

    return (
        <AppLayout title="Dashboard" headerTitle="Personal Dashboard">
            {/* Header Controls aligned right on laptop/desktop */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="hidden sm:block text-sm text-zinc-400 font-medium">
                    Overview & Activity
                </div>

                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:ml-auto">
                    {currentFilter === 'custom' ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full sm:w-auto">
                            <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                                <Select value={currentFilter} onValueChange={handleFilterChange}>
                                    <SelectTrigger className="w-full sm:w-[150px] h-10 border-zinc-800 text-zinc-300">
                                        <SlidersHorizontal className="mr-2 h-4 w-4 shrink-0" />
                                        <SelectValue placeholder="Range" />
                                    </SelectTrigger>
                                    <SelectContent 
                                        align="start" 
                                        side="bottom" 
                                        sideOffset={4} 
                                        className="border-zinc-800 bg-background text-zinc-300 min-w-[var(--radix-select-trigger-width)]"
                                    >
                                        <SelectItem value="this_day">This Day</SelectItem>
                                        <SelectItem value="this_week">This Week</SelectItem>
                                        <SelectItem value="this_month">This Month</SelectItem>
                                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                        <SelectItem value="this_year">This Year</SelectItem>
                                        <SelectItem value="custom">Custom</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button onClick={openCreateModal} className="gap-2 h-10 sm:hidden">
                                    <Plus className="h-4 w-4" /> New
                                </Button>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <Input 
                                    type="date" 
                                    value={startDateInput} 
                                    onChange={(e) => setStartDateInput(e.target.value)}
                                    className="w-full sm:w-[130px] h-10 border-zinc-800 text-zinc-300 text-xs text-center sm:text-left bg-transparent"
                                />
                                <span className="text-xs text-zinc-400 shrink-0 text-center sm:text-left">to</span>
                                <Input 
                                    type="date" 
                                    value={endDateInput} 
                                    onChange={(e) => setEndDateInput(e.target.value)}
                                    className="w-full sm:w-[130px] h-10 border-zinc-800 text-zinc-300 text-xs text-center sm:text-left bg-transparent"
                                />
                                <Button size="sm" variant="secondary" onClick={handleApplyCustomDates} className="h-10 px-3 shrink-0 w-full sm:w-auto">
                                    Apply
                                </Button>
                            </div>

                            <Button onClick={openCreateModal} className="gap-2 h-10 hidden sm:flex shrink-0">
                                <Plus className="h-4 w-4" /> New Transaction
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 sm:flex items-center justify-end sm:gap-2.5 w-full sm:w-auto">
                            <Select value={currentFilter} onValueChange={handleFilterChange}>
                                <SelectTrigger className="w-full sm:w-[160px] h-10 border-zinc-800 text-zinc-300">
                                    <SlidersHorizontal className="mr-2 h-4 w-4 shrink-0" />
                                    <SelectValue placeholder="Range" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-background text-zinc-300">
                                    <SelectItem value="this_day">This Day</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                    <SelectItem value="this_year">This Year</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={openCreateModal} className="gap-2 h-10 w-full sm:w-auto shrink-0">
                                <Plus className="h-4 w-4" /> 
                                <span className="inline sm:hidden">New</span>
                                <span className="hidden sm:inline">New Transaction</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Balance</CardTitle>
                        <Wallet className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-200">{formatCurrency(kpis?.totalBalance)}</div>
                        <p className="text-xs text-zinc-400 mt-1">Across all liquid accounts</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Income</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{formatCurrency(kpis?.totalIncome)}</div>
                        <p className="text-xs text-zinc-400 mt-1">Earned this period</p>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-400">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-rose-500">{formatCurrency(kpis?.totalExpense)}</div>
                        <p className="text-xs text-zinc-400 mt-1">Spent this period</p>
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

            {/* Main Table & Chart Layout */}
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 items-start">
                <Card className="xl:col-span-2 border-zinc-800 flex flex-col min-h-[400px] max-h-[520px]">
                    <CardHeader className="p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
                            <Select value={activeView} onValueChange={setActiveView}>
                                <SelectTrigger className="w-[150px] sm:w-[180px] h-9 font-semibold border-zinc-800 text-zinc-300">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-background text-zinc-300">
                                    <SelectItem value="transactions">Transactions</SelectItem>
                                    <SelectItem value="accounts">Accounts</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button 
                                asChild 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 px-2 text-xs font-medium text-primary hover:text-primary hover:bg-transparent hover:underline gap-1"
                            >
                                <Link href={activeView === 'transactions' ? '/transactions' : '/accounts'}>
                                    View All
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        </div>

                        <CardDescription className="text-zinc-400 text-xs sm:text-sm">
                            {activeView === 'transactions' 
                                ? "Recent transaction history. Tap a row to view details." 
                                : 'Active financial accounts. Tap a row to view transactions.'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="p-0 sm:p-6 sm:pt-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {activeView === 'transactions' ? (
                            <>
                                <div className="divide-y divide-zinc-800 md:hidden">
                                    {latestTransactions && latestTransactions.length > 0 ? (
                                        latestTransactions.map((tx) => (
                                            <div 
                                                key={tx.id}
                                                className="p-4 flex items-center justify-between gap-3 active:bg-zinc-800/50 transition-colors cursor-pointer"
                                                onClick={() => setSelectedDetailTransaction(tx)}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <div className="text-xs text-zinc-400 mb-1">
                                                        {formatDateOnly(tx.transaction_date)}
                                                    </div>
                                                    <div className="font-medium text-sm text-zinc-200 truncate">
                                                        {tx.description || 'No description'}
                                                    </div>
                                                </div>

                                                <div className={`text-right font-semibold text-sm whitespace-nowrap shrink-0 ${
                                                    tx.type === 'income' 
                                                        ? 'text-emerald-500' 
                                                        : tx.type === 'expense' 
                                                            ? 'text-rose-500' 
                                                            : 'text-blue-400'
                                                }`}>
                                                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                                                    {formatCurrency(tx.amount)}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 px-4 text-zinc-400 text-sm">
                                            No transactions logged for this period.
                                        </div>
                                    )}
                                </div>

                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10">
                                            <TableRow className="border-b border-zinc-800">
                                                <TableHead className="text-zinc-400">Date</TableHead>
                                                <TableHead className="text-zinc-400">Description</TableHead>
                                                <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {latestTransactions && latestTransactions.length > 0 ? (
                                                latestTransactions.map((tx) => (
                                                    <TableRow 
                                                        key={tx.id} 
                                                        className="border-b border-zinc-800 cursor-pointer hover:bg-muted/50 transition-colors"
                                                        onClick={() => setSelectedDetailTransaction(tx)}
                                                    >
                                                        <TableCell className="font-medium whitespace-nowrap text-xs text-zinc-300">
                                                            {formatDateOnly(tx.transaction_date)}
                                                        </TableCell>
                                                        <TableCell className="max-w-[180px] truncate">
                                                            <span className="font-medium text-sm block truncate text-zinc-300">
                                                                {tx.description || 'No description'}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className={`text-right font-semibold text-sm ${
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
                                                    <TableCell colSpan={3} className="text-center text-zinc-400 py-6">
                                                        No transactions logged for this period.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="divide-y divide-zinc-800 md:hidden">
                                    {accounts && accounts.length > 0 ? (
                                        accounts.map((acc) => (
                                            <div 
                                                key={acc.id}
                                                className="p-4 flex items-center justify-between gap-3 active:bg-zinc-800/50 transition-colors cursor-pointer"
                                                onClick={() => handleAccountClick(acc)}
                                            >
                                                <span className="font-medium text-sm text-zinc-200 truncate">{acc.name}</span>
                                                <span className="font-semibold text-sm text-zinc-200 shrink-0">{formatCurrency(acc.balance, acc.currency)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 px-4 text-zinc-400 text-sm">
                                            No accounts created yet.
                                        </div>
                                    )}
                                </div>

                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader className="sticky top-0 z-10">
                                            <TableRow className="border-b border-zinc-800">
                                                <TableHead className="text-zinc-400">Account Name</TableHead>
                                                <TableHead className="text-right text-zinc-400">Balance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {accounts && accounts.length > 0 ? (
                                                accounts.map((acc) => (
                                                    <TableRow 
                                                        key={acc.id} 
                                                        className="border-b border-zinc-800 cursor-pointer hover:bg-muted/50 transition-colors"
                                                        onClick={() => handleAccountClick(acc)}
                                                    >
                                                        <TableCell className="font-medium text-zinc-300">{acc.name}</TableCell>
                                                        <TableCell className="text-right font-semibold text-zinc-300">{formatCurrency(acc.balance, acc.currency)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow className="border-b border-zinc-800">
                                                    <TableCell colSpan={2} className="text-center text-zinc-400 py-6">
                                                        No accounts created yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 flex flex-col justify-between min-h-[420px] lg:h-[520px]">
                    <CardHeader className="p-4 sm:p-6 shrink-0">
                        <CardTitle className="flex items-center gap-2 text-zinc-200">
                            <PieChartIcon className="h-5 w-5 text-zinc-400" />
                            Expense Categories
                        </CardTitle>
                        <CardDescription className="text-zinc-400">Tap or click a category to view transactions.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 sm:pt-0 flex-1 flex flex-col min-h-0 overflow-hidden">
                        <ExpensePieChart 
                            data={categoryBreakdown?.expense || []} 
                            formatCurrency={formatCurrency} 
                            onCategoryClick={handleCategoryClick}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Modals */}
            <CategoryTransactionsModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                category={selectedCategory}
                accounts={accounts}
                initialStartDate={initialModalStart}
                initialEndDate={initialModalEnd}
            />

            <AccountTransactionsModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                account={selectedAccount}
                categories={categories}
                initialStartDate={initialModalStart}
                initialEndDate={initialModalEnd}
            />

            {isTransactionModalOpen && (
                <TransactionFormModal 
                    isOpen={isTransactionModalOpen}
                    onClose={() => setIsTransactionModalOpen(false)}
                    editingTransaction={editingTransaction}
                    accounts={accounts}
                    categories={categories}
                    accountTypes={accountTypes}
                />
            )}

            <TransactionDetailSheet 
                open={!!selectedDetailTransaction}
                onOpenChange={(open) => !open && setSelectedDetailTransaction(null)}
                transaction={selectedDetailTransaction}
                onEdit={openEditModal}
                onDelete={setDeletingTransaction}
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