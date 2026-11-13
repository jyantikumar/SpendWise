// resources/js/Pages/DashboardComponents/DashboardActivitySection.jsx
import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function DashboardActivitySection({
    latestTransactions = [],
    formatCurrency,
    formatDateOnly,
    setSelectedDetailTransaction,
}) {
    return (
        <Card className="xl:col-span-2 border-zinc-800 flex flex-col min-h-[400px] max-h-[520px]">
            <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between gap-3 shrink-0">
                <div>
                    <CardTitle className="text-base font-semibold text-zinc-200">Recent Transactions</CardTitle>
                    <CardDescription className="text-zinc-400 text-xs sm:text-sm">
                        Recent transaction history. Tap a row to view details.
                    </CardDescription>
                </div>

                <Button 
                    asChild 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 px-2 text-xs font-medium text-primary hover:text-primary hover:bg-transparent hover:underline gap-1"
                >
                    <Link href="/transactions">
                        View All
                        <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                </Button>
            </CardHeader>

            <CardContent className="p-0 sm:p-6 sm:pt-0 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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

                <div className="hidden md:block relative">
                    <Table>
                        <TableHeader className="sticky top-0 z-20 bg-zinc-950/95 backdrop-blur-md shadow-sm">
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
            </CardContent>
        </Card>
    );
}