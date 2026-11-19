// resources/js/Pages/DashboardComponents/DashboardKpis.jsx
import { useState } from 'react';
import { Wallet, PieChart as PieChartIcon, Eye, EyeOff, TrendingUp, CalendarClock, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NetFlowSheet from './NetFlowSheet';

export default function DashboardKpis({ 
    kpis = {}, 
    dailyTrends = [], 
    formatCurrency, 
    onOpenProjectedSheet 
}) {
    const [showTotalBalance, setShowTotalBalance] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const currencyFormatter = formatCurrency;

    const income = parseFloat(kpis?.totalIncome) || 0;
    const expense = parseFloat(kpis?.totalExpense) || 0;
    const totalFlow = income + expense;

    // Projected Month: net cash flow + remaining recurring net
    const projectedAmount    = parseFloat(kpis?.projectedAmount) || 0;
    const projectedRecurring = parseFloat(kpis?.projectedRecurringNet) || 0;
    const isProjectedPositive = projectedAmount >= 0;

    const sparklineData = (dailyTrends || []).map((d) => ({
        date: d.transaction_date,
        rawDate: d.rawDate,
        income: d.income,
        expense: d.expense,
        net: (d.income || 0) - (d.expense || 0),
    }));

    return (
        <>
            {/* 
              Mobile: 2x2 Grid (grid-cols-2)
              Tablet: 2x2 Grid (md:grid-cols-2)
              Desktop: 4x1 Grid (lg:grid-cols-4)
            */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                
                {/* 1. Total Balance Card */}
                <Card className="border-zinc-800 flex flex-col justify-between py-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-3 sm:px-4">
                        <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400">Total Balance</CardTitle>
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
                    <CardContent className="pb-3 pt-0 px-3 sm:px-4">
                        <div className="text-base sm:text-xl font-bold text-zinc-200 truncate">
                            {showTotalBalance ? currencyFormatter(kpis?.totalBalance) : '••••••••'}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 truncate">Across all liquid accounts</p>
                    </CardContent>
                </Card>

                {/* 2. Income vs Expense Donut Card */}
                <Card className="border-zinc-800 flex flex-col justify-between py-1">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-3 sm:px-4">
                        <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400">Income vs. Expense</CardTitle>
                        <PieChartIcon className="h-3.5 w-3.5 text-zinc-400" />
                    </CardHeader>
                    <CardContent className="pb-2.5 pt-0 px-3 sm:px-4">
                        {totalFlow > 0 ? (
                            <div className="flex items-center justify-between gap-2 sm:gap-3">
                                <div className="h-[50px] w-[50px] sm:h-[70px] sm:w-[70px] shrink-0">
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

                                <div className="flex flex-col justify-center gap-1 flex-1 text-[9px] sm:text-[11px] overflow-hidden">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1 text-zinc-400 font-medium shrink-0">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /> Income
                                        </span>
                                        <span className="font-bold text-emerald-500 truncate">{currencyFormatter(kpis?.totalIncome)}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1 text-zinc-400 font-medium shrink-0">
                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" /> Expense
                                        </span>
                                        <span className="font-bold text-rose-500 truncate">{currencyFormatter(kpis?.totalExpense)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-2 text-zinc-400 text-[10px] sm:text-[11px]">
                                No flow recorded.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* 3. Net Cash Flow Interactive Card */}
                <Card 
                    className="border-zinc-800 flex flex-col justify-between py-1 cursor-pointer hover:border-zinc-700 transition-colors group"
                    onClick={() => setIsSheetOpen(true)}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-3 sm:px-4">
                        <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors">
                            Net Cash Flow
                        </CardTitle>
                        <div className="flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                        </div>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0 px-3 sm:px-4">
                        <div className={`text-base sm:text-xl font-bold truncate ${kpis?.netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {currencyFormatter(kpis?.netCashFlow)}
                        </div>
                        
                        <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                            <span className="truncate">
                                <span className="inline sm:hidden">Inc-Exp</span>
                                <span className="hidden sm:inline">Income vs. expense</span>
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-emerald-500/90 font-semibold underline shrink-0 whitespace-nowrap">
                                View trend
                            </span>
                        </div>
                    </CardContent>
                </Card>

                {/* 4. Projected Month Card (Interactive with View link) */}
                <Card 
                    className="border-zinc-800 flex flex-col justify-between py-1 cursor-pointer hover:border-zinc-700 transition-colors group"
                    onClick={() => onOpenProjectedSheet?.()}
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-3 sm:px-4">
                        <CardTitle className="text-[11px] sm:text-xs font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors truncate">
                            Projected Month
                        </CardTitle>
                        <div className="flex items-center gap-1">
                            <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                        </div>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0 px-3 sm:px-4">
                        <div className={`text-base sm:text-xl font-bold truncate ${isProjectedPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {currencyFormatter(projectedAmount)}
                        </div>
                        
                        <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] text-zinc-400 mt-0.5">
                            <span className="truncate">
                                <span className="inline sm:hidden">
                                    Incl. {projectedRecurring >= 0 ? '+' : ''}{currencyFormatter(projectedRecurring)}
                                </span>
                                <span className="hidden sm:inline">
                                    Net + recurring ({projectedRecurring >= 0 ? '+' : ''}{currencyFormatter(projectedRecurring)})
                                </span>
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-emerald-500/90 font-semibold underline shrink-0 whitespace-nowrap flex items-center">
                                View
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Sheet Drawer for Net Flow */}
            <NetFlowSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                data={sparklineData}
                formatCurrency={formatCurrency}
                netCashFlow={kpis?.netCashFlow}
            />
        </>
    );
}