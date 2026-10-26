import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardActivitySection({
    activeView,
    setActiveView,
    latestTransactions = [],
    accounts = [],
    formatCurrency,
    formatDateOnly,
    setSelectedDetailTransaction,
    handleAccountClick,
}) {
    return (
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
    );
}