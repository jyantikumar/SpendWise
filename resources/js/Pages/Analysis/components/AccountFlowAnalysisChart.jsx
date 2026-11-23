// resources/js/Pages/Analysis/components/AccountFlowAnalysisChart.jsx
import { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Wallet } from 'lucide-react';

const AccountTooltip = ({ active, payload, label, formatCurrency }) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5 shadow-md text-xs space-y-1">
                <p className="text-zinc-300 font-bold border-b border-zinc-800 pb-1 text-[11px]">{label}</p>
                {payload.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between gap-3 font-semibold text-[11px]" style={{ color: entry.fill }}>
                        <span>{entry.name}:</span>
                        <span>{formatCurrency(entry.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function AccountFlowAnalysisChart({ 
    data = [], 
    formatCurrency, 
    onAccountClick 
}) {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 min-h-[260px]">
                <Wallet className="h-10 w-10 stroke-1 text-zinc-600 mb-2" />
                <p className="text-sm text-zinc-400">No account flow recorded for this period.</p>
            </div>
        );
    }

    return (
        <div className="h-[260px] sm:h-[280px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                    data={data} 
                    margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis 
                        tick={{ fontSize: 10 }} 
                        tickLine={false}
                        tickFormatter={(v) => `${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`}
                    />
                    <Tooltip content={<AccountTooltip formatCurrency={formatCurrency} />} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />

                    <Bar 
                        dataKey="Income" 
                        stackId={isMobile ? "a" : undefined}
                        fill="#10b981" 
                        radius={isMobile ? [0, 0, 4, 4] : [4, 4, 0, 0]} 
                        onClick={(entry) => onAccountClick && onAccountClick(entry)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                    <Bar 
                        dataKey="Expense" 
                        stackId={isMobile ? "a" : undefined}
                        fill="#f43f5e" 
                        radius={[4, 4, 0, 0]} 
                        onClick={(entry) => onAccountClick && onAccountClick(entry)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}