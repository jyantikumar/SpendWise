// resources/js/Pages/Dashboard.jsx
import { Head, Link, router } from '@inertiajs/react';
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
import { TooltipProvider } from '@/components/ui/tooltip'; // 👈 Import TooltipProvider
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function Dashboard({ auth, kpis, categoryBreakdown, accounts, currentFilter }) {
    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

    const handleFilterChange = (value) => {
        router.get(route('dashboard'), { range: value }, { preserveState: true });
    };

    return (
        <TooltipProvider> {/* 👈 Wrap outer tree with TooltipProvider */}
            <SidebarProvider>
                <Head title="Dashboard - SpendWise" />

                {/* Sidebar Navigation */}
                <AppSidebar user={auth.user} />

                {/* Main Content Area */}
                <SidebarInset>
                    {/* Top Bar */}
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <h1 className="text-lg font-semibold tracking-tight">Personal Dashboard</h1>
                    </header>

                    {/* Dashboard Body */}
                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                                <p className="text-sm text-muted-foreground">Monitor your account balance and income against expenses.</p>
                            </div>

                            <div className="flex items-center gap-3">
                                <Select defaultValue={currentFilter} onValueChange={handleFilterChange}>
                                    <SelectTrigger className="w-[160px]">
                                        <SlidersHorizontal className="mr-2 h-4 w-4" />
                                        <SelectValue placeholder="Range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="this_month">This Month</SelectItem>
                                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                        <SelectItem value="this_year">This Year</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button className="gap-2">
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
                                    <p className="text-xs text-muted-foreground">Across all liquid accounts</p>
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
                                    <p className="text-xs text-muted-foreground">Income minus expenses</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-600">{formatCurrency(kpis?.totalIncome)}</div>
                                    <p className="text-xs text-muted-foreground">Earned this period</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                                    <TrendingDown className="h-4 w-4 text-rose-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-rose-600">{formatCurrency(kpis?.totalExpense)}</div>
                                    <p className="text-xs text-muted-foreground">Spent this period</p>
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
                                        <Link href="#">
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
                                                    <TableCell colSpan={3} className="text-center text-muted-foreground">
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
                                                        className="h-3 w-3 rounded-full" 
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
            </SidebarProvider>
        </TooltipProvider>
    );
}