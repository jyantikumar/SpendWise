import { Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SubscriptionKpiCards({ totalMonthlyExpenses, totalMonthlyIncome, formatCurrency }) {
    return (
        <div className="grid gap-3 sm:gap-4 grid-cols-2 w-full">
            <Card className="border-zinc-800 py-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                    <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400">Remaining Expenses</CardTitle>
                    <Calendar className="h-3.5 w-3.5" />
                </CardHeader>
                <CardContent className="px-3 pb-3">
                    <div className="text-base sm:text-xl font-bold text-rose-500">{formatCurrency(totalMonthlyExpenses)}</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Active commitments</p>
                </CardContent>
            </Card>

            <Card className="border-zinc-800 py-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                    <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400">Remaining Income</CardTitle>
                    <TrendingUp className="h-3.5 w-3.5 " />
                </CardHeader>
                <CardContent className="px-3 pb-3">
                    <div className="text-base sm:text-xl font-bold text-emerald-500">{formatCurrency(totalMonthlyIncome)}</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Active inflows</p>
                </CardContent>
            </Card>
        </div>
    );
}