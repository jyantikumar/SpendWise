import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, LineChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NetFlowSparkline from './NetFlowSparkline';

export default function CashFlowTrendCard({ data = [], formatCurrency }) {
    const [open, setOpen] = useState(() => {
        if (typeof window === 'undefined') return true;
        const saved = localStorage.getItem('dashboard:showTrend');
        return saved !== null ? saved === 'true' : window.innerWidth >= 768;
    });

    useEffect(() => {
        localStorage.setItem('dashboard:showTrend', String(open));
    }, [open]);

    return (
        <Card className="border-zinc-800">
            <CardHeader
                className="px-3.5 py-2.5 sm:px-4 sm:py-3 flex flex-row items-center justify-between gap-2 cursor-pointer sm:cursor-default select-none"
                onClick={() => setOpen((o) => !o)}
            >
                <div className="flex items-center gap-2">
                    <LineChart className="h-3.5 w-3.5 text-emerald-500" />
                    <CardTitle className="text-xs sm:text-sm font-semibold text-zinc-200">
                        Cash Flow Trend
                    </CardTitle>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen((o) => !o);
                    }}
                    className="h-7 px-2 text-[11px] text-zinc-400 hover:text-zinc-200 gap-1 bg-zinc-900/40 sm:bg-transparent"
                >
                    <span className="hidden sm:inline">{open ? 'Hide' : 'Show'}</span>
                    {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </Button>
            </CardHeader>

            {open && (
                <CardContent className="px-3.5 pb-3 pt-0 sm:px-4">
                    <div className="h-[100px] sm:h-[150px] w-full">
                        <NetFlowSparkline data={data} formatCurrency={formatCurrency} />
                    </div>
                </CardContent>
            )}
        </Card>
    );
}