import { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { 
    Wallet, 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    ArrowUpRight, 
    Plus, 
    PieChart,
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

export default function Dashboard({ auth, kpis, categoryBreakdown, accounts = [], categories = [], currentFilter }) {
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);
    
    const handleFilterChange = (value) => {
        router.get(route('dashboard'), { range: value }, { preserveState: true });
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
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h1 className="text-lg font-semibold tracking-tight">Personal Dashboard</h1>
                    </header>

                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                                <p className="text-sm text-muted-foreground">Monitor your account balance and income against expenses.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Select defaultValue={currentFilter} onValueChange={handleFilterChange}>
                                    <SelectTrigger className="w-[160px] h-10">
                                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="this_month">This Month</SelectItem>
                                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                        <SelectItem value="this_year">This Year</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button onClick={openTransactionModal} className="gap-2">
                                    <Plus className="h-4 w-4" /> New Transaction
                                </Button>
                            </div>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
                                    <Wallet className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatCurrency(kpis?.totalBalance)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Across all liquid accounts</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${kpis?.netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {formatCurrency(kpis?.netCashFlow)}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">Income minus expenses</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-600">{formatCurrency(kpis?.totalIncome)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Earned this period</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                    <TrendingDown className="h-4 w-4 text-rose-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-rose-600">{formatCurrency(kpis?.totalExpense)}</div>
                                    <p className="text-xs text-muted-foreground mt-1">Spent this period</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Accounts and Category Breakdown */}
                        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                            <Card className="xl:col-span-2">
                                <CardHeader className="flex flex-row items-center">
                                    <div className="grid gap-1">
                                        <CardTitle>Accounts</CardTitle>
                                        <CardDescription>Active financial accounts.</CardDescription>
                                    </div>
                                    <Button asChild size="sm" className="ml-auto gap-1">
                                        <Link href="/accounts">
                                            View All
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Account Name</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead className="text-right">Balance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {accounts && accounts.length > 0 ? (
                                                accounts.map((acc) => (
                                                    <TableRow key={acc.id}>
                                                        <TableCell className="font-medium">{acc.name}</TableCell>
                                                        <TableCell className="capitalize text-muted-foreground">{acc.type}</TableCell>
                                                        <TableCell className="text-right font-semibold">{formatCurrency(acc.balance)}</TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-muted-foreground py-6">
                                                        No accounts created yet.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChart className="h-5 w-5 text-muted-foreground" />
                                        Expense Categories
                                    </CardTitle>
                                    <CardDescription>Top spending categories.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4">
                                    {categoryBreakdown?.expense && categoryBreakdown.expense.length > 0 ? (
                                        categoryBreakdown.expense.map((cat) => (
                                            <div key={cat.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-3">
                                                    <div 
                                                        className="h-3 w-3 rounded-full shrink-0" 
                                                        style={{ backgroundColor: cat.color || '#3b82f6' }}
                                                    />
                                                    <span className="font-medium text-sm">{cat.name}</span>
                                                </div>
                                                <span className="font-semibold text-sm">{formatCurrency(cat.total)}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground py-4 text-center">
                                            No expenses recorded for this timeframe.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </SidebarInset>

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