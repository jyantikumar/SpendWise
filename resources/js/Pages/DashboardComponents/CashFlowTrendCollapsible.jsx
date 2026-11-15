import { useState, useEffect } from 'react';
import { LineChart, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import NetFlowSparkline from './NetFlowSparkline';

export default function CashFlowTrendCollapsible({ data = [], formatCurrency }) {
    const [isOpen, setIsOpen] = useState(() => {
        if (typeof window === 'undefined') return true;
        const saved = localStorage.getItem('dashboard:showTrend');
        return saved !== null ? saved === 'true' : window.innerWidth >= 768;
    });

    useEffect(() => {
        localStorage.setItem('dashboard:showTrend', String(isOpen));
    }, [isOpen]);

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm overflow-hidden transition-colors"
        >
            <div className="flex items-center justify-between px-3.5 py-2.5 sm:px-4 sm:py-3 select-none">
                <div className="flex items-center gap-2">
                    <LineChart className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                        Cash Flow Trend
                    </span>
                </div>

                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 gap-1"
                    >
                        <span className="hidden sm:inline">{isOpen ? 'Hide Trend' : 'View Trend'}</span>
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                    </Button>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up overflow-hidden">
                <div className="px-3.5 pb-3.5 pt-1 sm:px-4 sm:pb-4">
                    <div className="h-[110px] sm:h-[160px] w-full">
                        <NetFlowSparkline data={data} formatCurrency={formatCurrency} />
                    </div>
                </div>
            </CollapsibleContent>
        </Collapsible>
    );
}