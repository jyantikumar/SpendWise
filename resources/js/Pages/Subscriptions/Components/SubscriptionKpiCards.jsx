import { Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SubscriptionKpiCards({ totalMonthlyExpenses, totalMonthlyIncome, formatCurrency }) {
    return (
        <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 w-full">
            <Card className="border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-zinc-400">Estimated Monthly Expenses</CardTitle>
                    <Calendar className="h-4 w-4 text-rose-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-rose-500">{formatCurrency(totalMonthlyExpenses)}</div>
                    <p className="text-[11px] text-zinc-400 mt-1">Normalized active commitments</p>
                </CardContent>
            </Card>

            <Card className="border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-zinc-400">Estimated Monthly Income</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-emerald-500">{formatCurrency(totalMonthlyIncome)}</div>
                    <p className="text-[11px] text-zinc-400 mt-1">Normalized active recurring inflows</p>
                </CardContent>
            </Card>
        </div>
    );
}