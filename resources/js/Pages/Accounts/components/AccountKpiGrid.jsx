// resources/js/Pages/Accounts/components/AccountKpiGrid.jsx
import { Wallet, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AccountKpiGrid({ totalPortfolioBalance, accountsCount, formatCurrency, userCurrency = 'PHP' }) {
    return (
        <div className="grid gap-3 sm:gap-4 grid-cols-2">
            <Card className="border-zinc-800 py-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3.5 sm:px-4">
                    <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400">Total Balance</CardTitle>
                    <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                </CardHeader>
                <CardContent className="px-3.5 sm:px-4 pb-3 pt-1">
                    <div className="text-base sm:text-xl font-bold text-zinc-200">{formatCurrency(totalPortfolioBalance, userCurrency)}</div>
                </CardContent>
            </Card>

            <Card className="border-zinc-800 py-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3.5 sm:px-4">
                    <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400">Total Accounts</CardTitle>
                    <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                </CardHeader>
                <CardContent className="px-3.5 sm:px-4 pb-3 pt-1">
                    <div className="text-base sm:text-xl font-bold text-zinc-200">{accountsCount}</div>
                </CardContent>
            </Card>
        </div>
    );
}