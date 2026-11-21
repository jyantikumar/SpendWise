// resources/js/Pages/DashboardComponents/ProjectedMonthSheet.jsx
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';

export default function ProjectedMonthSheet({ 
    open, 
    onOpenChange, 
    formatCurrency, 
    projectedAmount = 0, 
    netCashFlow = 0, 
    recurringInstances = [],
    periodTransactions = []
}) {
    const [activeTab, setActiveTab] = useState('pending');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const pendingIncomeTotal = recurringInstances
        .filter((i) => i.type === 'income')
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const pendingExpenseTotal = recurringInstances
        .filter((i) => i.type === 'expense')
        .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    const pendingNet = pendingIncomeTotal - pendingExpenseTotal;

    const getListItems = () => {
        switch (activeTab) {
            case 'pending':
                return recurringInstances;
            case 'recorded':
                return periodTransactions;
            case 'expense':
                return [...recurringInstances, ...periodTransactions].filter((i) => i.type === 'expense');
            case 'income':
                return [...recurringInstances, ...periodTransactions].filter((i) => i.type === 'income');
            default:
                return recurringInstances;
        }
    };

    const displayList = getListItems();

    const getAmountColor = (type) => {
        switch (type) {
            case 'income':
                return 'text-emerald-400';
            case 'expense':
                return 'text-rose-400';
            default:
                return 'text-zinc-200';
        }
    };

    const tabs = [
        { id: 'pending', label: `Pending (${recurringInstances.length})` },
        { id: 'recorded', label: `Recorded (${periodTransactions.length})` },
        { id: 'expense', label: 'Expenses' },
        { id: 'income', label: 'Income' }
    ];

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent 
                side={isMobile ? 'bottom' : 'right'} 
                className={`border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col justify-between ${
                    isMobile
                        ? 'w-full h-auto max-h-[85vh] rounded-t-xl p-4 sm:p-6'
                        : 'w-full max-w-md h-full rounded-none p-6'
                }`}
            >
                <div className="flex flex-col h-full min-h-0">
                    
                    {/* Sheet Header */}
                    <SheetHeader className="pb-3 border-b border-zinc-800 shrink-0">
                        <SheetTitle className="text-zinc-100 text-base">
                            Projected Month Breakdown
                        </SheetTitle>
                        <SheetDescription className="text-zinc-400 text-xs mt-0.5">
                            Current net cash flow combined with upcoming recurring transactions.
                        </SheetDescription>
                    </SheetHeader>

                    {/* Breakdown Card */}
                    <div className="bg-zinc-900/90 rounded-xl p-4 my-4 shrink-0 space-y-3">
                        
                        {/* High-Impact Projected Total */}
                        <div className="pb-3 border-b border-zinc-800/80">
                            <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                                Total Projected Netflow
                            </span>
                            <div className={`text-2xl font-extrabold mt-0.5 ${projectedAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {formatCurrency(projectedAmount)}
                            </div>
                        </div>

                        {/* Hierarchical Formula Breakdown */}
                        <div className="space-y-2 text-xs pt-0.5">
                            <div className="flex justify-between items-center text-zinc-300">
                                <span className="font-medium">Current Net Cash Flow</span>
                                <span className={`font-bold ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formatCurrency(netCashFlow)}
                                </span>
                            </div>

                            <div className="space-y-1.5 pt-1 border-t border-zinc-800/60">
                                <div className="flex justify-between items-center text-zinc-200 font-medium">
                                    <span>Pending Recurring Net</span>
                                    <span className={`font-bold ${pendingNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {pendingNet >= 0 ? '+' : ''}{formatCurrency(pendingNet)}
                                    </span>
                                </div>

                                {/* Indented Enumeration List */}
                                <div className="pl-3 border-l-2 border-zinc-800 space-y-1 ml-1 text-zinc-400 text-[11px]">
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                                            Pending Incomes
                                        </span>
                                        <span className="font-semibold text-emerald-400">
                                            +{formatCurrency(pendingIncomeTotal)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-1.5">
                                            <span className="h-1 w-1 rounded-full bg-rose-400 shrink-0" />
                                            Pending Expenses
                                        </span>
                                        <span className="font-semibold text-rose-400">
                                            -{formatCurrency(pendingExpenseTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pure Underline Tabs */}
                    <div className="border-b border-zinc-800 shrink-0 mb-3 flex gap-6 overflow-x-auto [scrollbar-width:none]">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-2 text-xs font-medium transition-colors whitespace-nowrap outline-none border-b-2 ${
                                        isActive 
                                            ? 'text-white border-white' 
                                            : 'text-zinc-400 border-transparent hover:text-zinc-200'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Transaction List */}
                    <div className="flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        {displayList.length === 0 ? (
                            <div className="text-center py-10 text-zinc-500 text-xs italic">
                                No transaction records found for this view.
                            </div>
                        ) : (
                            displayList.map((item, idx) => (
                                <div 
                                    key={`${item.id || item.rule_id}-${item.date}-${idx}`}
                                    className="flex items-center justify-between py-2.5 border-b border-zinc-800/60 text-xs hover:bg-zinc-900/40 transition-colors px-1 rounded"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="truncate">
                                            <div className="flex items-center gap-1.5">
                                                <p className="font-medium text-zinc-200 truncate">{item.title}</p>
                                                {item.is_recurring && (
                                                    <span className="text-[10px] text-zinc-500 font-normal shrink-0">
                                                        • Recurring
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-zinc-400">
                                                {item.is_recurring ? `Due ${item.date}` : item.date}
                                            </p>
                                        </div>
                                    </div>

                                    <span className={`font-bold shrink-0 ml-3 ${getAmountColor(item.type)}`}>
                                        {item.type === 'income' && '+'}
                                        {item.type === 'expense' && '-'}
                                        {formatCurrency(item.amount)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}