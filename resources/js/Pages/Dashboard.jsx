import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
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

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

import CategoryTransactionsModal from '@/components/CategoryTransactionsModal';

// Custom SVG Donut / Pie Chart Component
function ExpensePieChart({ data = [], formatCurrency, onCategoryClick }) {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const total = data.reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

    if (total === 0 || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
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
        <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* SVG Pie / Donut Canvas */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
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

                {/* Center Content readout */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-2">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider truncate max-w-[90px]">
                        {activeItem ? activeItem.name : 'Total Expense'}
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

            {/* Interactive Category Legend */}
            <div className="flex-1 w-full space-y-2 max-h-[190px] overflow-y-auto pr-1">
                {slices.map((slice, index) => (
                    <div
                        key={slice.id || index}
                        className={`flex items-center justify-between p-1.5 rounded-md transition-colors cursor-pointer text-xs ${
                            hoveredIndex === index ? 'bg-muted font-medium' : 'hover:bg-muted/50'
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
                            <span className="truncate text-zinc-300">{slice.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <span className="text-zinc-400 text-[11px]">
                                {slice.percentage.toFixed(0)}%
                            </span>
                            <span className="font-semibold text-zinc-300">{formatCurrency(slice.value)}</span>
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
    categories = [], 
    currentFilter 
}) {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [activeView, setActiveView] = useState('transactions'); // 'transactions' | 'accounts'

    // Category Drilldown Modal State
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const handleFilterChange = (value) => {
        router.get(route('dashboard'), { range: value }, { preserveState: true });
    };

    // Calculate default dates for category modal based on current dashboard range
    const getDateBoundaries = () => {
        const today = new Date();
        const formatDate = (d) => d.toISOString().split('T')[0];

        if (currentFilter === 'this_day') {
            return { startDate: formatDate(today), endDate: formatDate(today) };
        } else if (currentFilter === 'last_30_days') {
            const past = new Date();
            past.setDate(today.getDate() - 30);
            return { startDate: formatDate(past), endDate: formatDate(today) };
        } else if (currentFilter === 'this_year') {
            const yearStart = new Date(today.getFullYear(), 0, 1);
            return { startDate: formatDate(yearStart), endDate: formatDate(today) };
        } else {
            // default: this_month
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            return { startDate: formatDate(monthStart), endDate: formatDate(today) };
        }
    };

    const { startDate: initialModalStart, endDate: initialModalEnd } = getDateBoundaries();

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setIsCategoryModalOpen(true);
    };

    // Quick Transaction Form
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        account_id: accounts[0]?.id ? String(accounts[0].id) : '',
        destination_account_id: '',
        category_id: '',
        type: 'expense',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
    });

    const openTransactionModal = () => {
        clearErrors();
        reset();
        setData({
            account_id: accounts[0]?.id ? String(accounts[0].id) : '',
            destination_account_id: '',
            category_id: '',
            type: 'expense',
            amount: '',
            description: '',
            transaction_date: new Date().toISOString().split('T')[0],
        });
        setIsTransactionModalOpen(true);
    };

    const handleTransactionSubmit = (e) => {
        e.preventDefault();
        post(route('transactions.store'), {
            onSuccess: () => {
                setIsTransactionModalOpen(false);
                reset();
            },
        });
    };

    const handleTypeChange = (value) => {
        setData((prevData) => ({
            ...prevData,
            type: value,
            category_id: '',
            destination_account_id: '',
        }));
    };

    const filteredCategories = categories.filter((c) => c.type === data.type);

    return (
        <TooltipProvider>
            <SidebarProvider>
                <Head title="Dashboard - SpendWise" />

                <AppSidebar user={auth.user} />

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-800" />
                        <h1 className="text-lg font-semibold tracking-tight text-zinc-200">Personal Dashboard</h1>
                    </header>

                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Overview</h2>
                                <p className="text-sm text-zinc-400">Monitor your account balance and income against expenses.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Only show Range filter when viewing Accounts */}
                                {activeView !== 'transactions' && (
                                    <Select defaultValue={currentFilter} onValueChange={handleFilterChange}>
                                        <SelectTrigger className="w-[160px] h-10 border-zinc-800 text-zinc-300">
                                            <SlidersHorizontal className="mr-2 h-4 w-4" />
                                            <SelectValue placeholder="Range" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="this_month">This Month</SelectItem>
                                            <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                            <SelectItem value="this_year">This Year</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}

                                <Button onClick={openTransactionModal} className="gap-2">
                                    <Plus className="h-4 w-4" /> New Transaction
                                </Button>
                            </div>
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

                        {/* Combined Table & Category Breakdown Chart */}
                        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                            <Card className="xl:col-span-2 border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                                    <div className="flex items-center gap-3">
                                        <Select value={activeView} onValueChange={setActiveView}>
                                            <SelectTrigger className="w-[200px] h-9 font-semibold border-zinc-800 text-zinc-300">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="transactions">Transactions</SelectItem>
                                                <SelectItem value="accounts">Accounts</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <CardDescription className="hidden sm:inline text-zinc-400">
                                            {activeView === 'transactions' 
                                                ? "Transactions logged for today's date." 
                                                : 'Active financial accounts.'}
                                        </CardDescription>
                                    </div>

                                    <Button asChild size="sm" variant="outline" className="gap-1 border-zinc-800 text-zinc-300">
                                        <Link href={activeView === 'transactions' ? '/transactions' : '/accounts'}>
                                            View All
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardHeader>

                                <CardContent>
                                    {activeView === 'transactions' ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-b border-zinc-800">
                                                    <TableHead className="text-zinc-400">Date</TableHead>
                                                    <TableHead className="text-zinc-400">Description</TableHead>
                                                    <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {latestTransactions && latestTransactions.length > 0 ? (
                                                    latestTransactions.map((tx) => (
                                                        <TableRow key={tx.id} className="border-b border-zinc-800">
                                                            <TableCell className="font-medium whitespace-nowrap text-xs text-zinc-300">
                                                                {tx.transaction_date}
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
                                                        <TableCell colSpan={4} className="text-center text-zinc-400 py-6">
                                                            No transactions logged for today.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="border-b border-zinc-800">
                                                    <TableHead className="text-zinc-400">Account Name</TableHead>
                                                    <TableHead className="text-right text-zinc-400">Balance</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {accounts && accounts.length > 0 ? (
                                                    accounts.map((acc) => (
                                                        <TableRow key={acc.id} className="border-b border-zinc-800">
                                                            <TableCell className="font-medium text-zinc-300">{acc.name}</TableCell>
                                                            <TableCell className="text-right font-semibold text-zinc-300">{formatCurrency(acc.balance)}</TableCell>
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
                                    )}
                                </CardContent>
                            </Card>

                            {/* Expense Category Pie / Donut Chart */}
                            <Card className="border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-zinc-200">
                                        <PieChartIcon className="h-5 w-5 text-zinc-400" />
                                        Expense Categories
                                    </CardTitle>
                                    <CardDescription className="text-zinc-400">Click a slice or legend item to view transactions.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ExpensePieChart 
                                        data={categoryBreakdown?.expense || []} 
                                        formatCurrency={formatCurrency} 
                                        onCategoryClick={handleCategoryClick}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </SidebarInset>

                {/* Category Transactions Modal */}
                <CategoryTransactionsModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    category={selectedCategory}
                    accounts={accounts}
                    initialStartDate={initialModalStart}
                    initialEndDate={initialModalEnd}
                />

                {/* Quick Add Transaction Modal */}
                <Dialog open={isTransactionModalOpen} onOpenChange={setIsTransactionModalOpen}>
                    <DialogContent className="sm:max-w-[480px]">
                        <DialogHeader>
                            <DialogTitle>New Transaction</DialogTitle>
                            <DialogDescription>
                                Log income, expenses, or transfers directly to your accounts.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleTransactionSubmit} className="space-y-4 py-2">
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

                            {/* Source Account */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    {data.type === 'transfer' ? 'From Account' : 'Account'}
                                </label>
                                <Select 
                                    value={data.account_id} 
                                    onValueChange={(val) => {
                                        setData((prev) => ({
                                            ...prev,
                                            account_id: val,
                                            destination_account_id: prev.destination_account_id === val ? '' : prev.destination_account_id
                                        }));
                                    }}
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

                            {/* Destination Account */}
                            {data.type === 'transfer' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none">To Account (Destination)</label>
                                    <Select 
                                        value={data.destination_account_id} 
                                        onValueChange={(val) => setData('destination_account_id', val)}
                                    >
                                        <SelectTrigger className="w-full h-10">
                                            <SelectValue placeholder="Select destination account" />
                                        </SelectTrigger>
                                        <SelectContent className="w-[var(--radix-select-trigger-width)] min-w-[280px]">
                                            {accounts && accounts.length > 0 ? (
                                                accounts
                                                    .filter((acc) => String(acc.id) !== String(data.account_id))
                                                    .map((acc) => (
                                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                                            {acc.name} {acc.type ? `(${acc.type})` : ''}
                                                        </SelectItem>
                                                    ))
                                            ) : (
                                                <div className="p-2 text-xs text-center text-muted-foreground">
                                                    No additional accounts available.
                                                </div>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {errors.destination_account_id && (
                                        <p className="text-xs text-rose-500">{errors.destination_account_id}</p>
                                    )}
                                </div>
                            )}

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
                                    placeholder="e.g. Bank transfer" 
                                    value={data.description} 
                                    onChange={(e) => setData('description', e.target.value)} 
                                />
                                {errors.description && <p className="text-xs text-rose-500">{errors.description}</p>}
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsTransactionModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    Create Transaction
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </SidebarProvider>
        </TooltipProvider>
    );
}