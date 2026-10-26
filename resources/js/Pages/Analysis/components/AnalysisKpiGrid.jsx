import { DollarSign, Calendar as CalendarIcon, PieChart as PieIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function AnalysisKpiGrid({ kpis, formatCurrency, totalFlow, incomeVal, expenseVal, incomeVsExpenseData }) {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-zinc-800 py-1 flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3.5 sm:px-4">
                    <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400">Net Cash Flow</CardTitle>
                    <DollarSign className="h-3.5 w-3.5 text-zinc-400" />
                </CardHeader>
                <CardContent className="px-3.5 sm:px-4 pb-3 pt-1">
                    <div className={`text-base sm:text-xl font-bold ${kpis?.netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {formatCurrency(kpis?.netCashFlow)}
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">Income - Expenses</p>
                </CardContent>
            </Card>

            <Card className="border-zinc-800 py-1 flex flex-col justify-between">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3.5 sm:px-4">
                    <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400">Peak Activity</CardTitle>
                    <CalendarIcon className="h-3.5 w-3.5 text-zinc-400" />
                </CardHeader>
                <CardContent className="px-3.5 sm:px-4 pb-3 pt-1">
                    <div className="text-base sm:text-xl font-bold text-zinc-200">{formatCurrency(kpis?.peakAmount)}</div>
                    <p className="text-[10px] text-zinc-400 mt-0.5 truncate">
                        {kpis?.peakDate ? `Peak on ${kpis.peakDate}` : 'No activity'}
                    </p>
                </CardContent>
            </Card>

            <Card className="border-zinc-800 flex flex-col justify-between py-1 col-span-2 lg:col-span-1">
                <CardHeader className="pb-1 pt-3 px-3.5 sm:px-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-[11px] sm:text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Income vs. Expense
                    </CardTitle>
                    <PieIcon className="h-3.5 w-3.5 text-zinc-400" />
                </CardHeader>
                <CardContent className="px-3.5 sm:px-4 pb-3 pt-1">
                    {totalFlow > 0 ? (
                        <div className="flex items-center justify-between gap-2">
                            <div className="h-[65px] w-[65px] shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={incomeVsExpenseData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={18}
                                            outerRadius={30}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {incomeVsExpenseData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex flex-col justify-center gap-1 flex-1 text-xs">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-zinc-400 font-medium text-[10px] sm:text-[11px]">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" /> Income
                                    </span>
                                    <span className="font-bold text-emerald-500 text-[11px] sm:text-xs">
                                        {formatCurrency(incomeVal)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-zinc-400 font-medium text-[10px] sm:text-[11px]">
                                        <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" /> Expense
                                    </span>
                                    <span className="font-bold text-rose-500 text-[11px] sm:text-xs">
                                        {formatCurrency(expenseVal)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[65px] text-zinc-400 text-xs">
                            No flow recorded.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}