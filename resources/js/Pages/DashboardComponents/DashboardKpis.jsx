import { useState } from 'react';
import { Wallet, DollarSign, PieChart as PieChartIcon, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function DashboardKpis({ kpis = {}, formatCurrency }) {
    const [showTotalBalance, setShowTotalBalance] = useState(false);

    const defaultFormat = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const currencyFormatter = formatCurrency || defaultFormat;

    const income = parseFloat(kpis?.totalIncome) || 0;
    const expense = parseFloat(kpis?.totalExpense) || 0;
    const totalFlow = income + expense;

    return (
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
            {/* Total Balance Card */}
            <Card className="border-zinc-800 flex flex-col justify-between py-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4">
                    <CardTitle className="text-xs font-medium text-zinc-400">Total Balance</CardTitle>
                    <div className="flex items-center gap-1.5">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                            onClick={() => setShowTotalBalance(!showTotalBalance)}
                            title={showTotalBalance ? "Hide Balance" : "Show Balance"}
                        >
                            {showTotalBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                        </Button>
                        <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                    </div>
                </CardHeader>
                <CardContent className="pb-3 pt-0 px-4">
                    <div className="text-xl font-bold text-zinc-200">
                        {showTotalBalance ? currencyFormatter(kpis?.totalBalance) : '••••••••'}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Across all liquid accounts</p>
                </CardContent>
            </Card>

            {/* Net Cash Flow Card */}
            <Card className="border-zinc-800 flex flex-col justify-between py-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4">
                    <CardTitle className="text-xs font-medium text-zinc-400">Net Cash Flow</CardTitle>
                    <DollarSign className="h-3.5 w-3.5 text-zinc-400" />
                </CardHeader>
                <CardContent className="pb-3 pt-0 px-4">
                    <div className={`text-xl font-bold ${kpis?.netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {currencyFormatter(kpis?.netCashFlow)}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">Income minus expenses</p>
                </CardContent>
            </Card>

            {/* Income vs Expense Donut Chart Card */}
            <Card className="border-zinc-800 flex flex-col justify-between py-1 col-span-2 lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4">
                    <CardTitle className="text-xs font-medium text-zinc-400">Income vs. Expense</CardTitle>
                    <PieChartIcon className="h-3.5 w-3.5 text-zinc-400" />
                </CardHeader>
                <CardContent className="pb-2.5 pt-0 px-4">
                    {totalFlow > 0 ? (
                        <div className="flex items-center justify-between gap-3">
                            <div className="h-[70px] w-[70px] shrink-0">
                                <svg viewBox="0 0 200 200" className="w-full h-full">
                                    {(() => {
                                        const data = [
                                            { name: 'Income', value: income, color: '#10b981' },
                                            { name: 'Expense', value: expense, color: '#f43f5e' }
                                        ];

                                        let cumulativeAngle = 0;
                                        return data.map((item, index) => {
                                            const angle = (item.value / totalFlow) * 360;
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

                                            const largeArc = angle > 180 ? 1 : 0;
                                            const pathData = angle >= 359.99 
                                                ? `M ${cx} ${cy - rOut} A ${rOut} ${rOut} 0 1 1 ${cx - 0.01} ${cy - rOut} L ${cx - 0.01} ${cy - rIn} A ${rIn} ${rIn} 0 1 0 ${cx} ${cy - rIn} Z`
                                                : `M ${x1Out} ${y1Out} A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2Out} ${y2Out} L ${x2In} ${y2In} A ${rIn} ${rIn} 0 ${largeArc} 0 ${x1In} ${y1In} Z`;

                                            return (
                                                <path
                                                    key={index}
                                                    d={pathData}
                                                    fill={item.color}
                                                    className="transition-all duration-200"
                                                />
                                            );
                                        });
                                    })()}
                                </svg>
                            </div>

                            <div className="flex flex-col justify-center gap-1 flex-1 text-[11px]">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /> Income
                                    </span>
                                    <span className="font-bold text-emerald-500">{currencyFormatter(kpis?.totalIncome)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" /> Expense
                                    </span>
                                    <span className="font-bold text-rose-500">{currencyFormatter(kpis?.totalExpense)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-2 text-zinc-400 text-[11px]">
                            No flow recorded for this period.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}