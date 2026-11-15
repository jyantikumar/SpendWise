// resources/js/Pages/DashboardComponents/NetFlowSheet.jsx
import { LineChart } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import NetFlowSparkline from './NetFlowSparkline';

export default function NetFlowSheet({ open, onOpenChange, data = [], formatCurrency, netCashFlow = 0 }) {
    const isPositive = netCashFlow >= 0;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent 
                side="bottom" 
                className="border-t border-zinc-800 bg-zinc-900 text-zinc-100 rounded-t-2xl max-h-[85vh] p-4 sm:p-6"
            >
                {/* Visual drag handle for mobile affordance */}
                <div className="mx-auto w-12 h-1.5 rounded-full bg-zinc-800 mb-4 sm:hidden" />

                <SheetHeader className="text-left pb-2 space-y-1">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-zinc-200 text-base font-semibold flex items-center gap-2">
                            <LineChart className="h-4 w-4" />
                            Net Cash Flow Trend
                        </SheetTitle>
                        <span className={`text-base font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {formatCurrency(netCashFlow)}
                        </span>
                    </div>
                    <SheetDescription className="text-zinc-400 text-xs">
                        Drag or hover across the line to inspect daily income, expense, and net values.
                    </SheetDescription>
                </SheetHeader>

                <div className="h-[180px] sm:h-[220px] w-full pt-2">
                    <NetFlowSparkline data={data} formatCurrency={formatCurrency} />
                </div>
            </SheetContent>
        </Sheet>
    );
}