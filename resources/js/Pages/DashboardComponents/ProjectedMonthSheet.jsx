// resources/js/Pages/DashboardComponents/ProjectedMonthSheet.jsx
import { useState, useEffect, useMemo } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Clock, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ProjectedMonthSheet({ 
    open, 
    onOpenChange, 
    formatCurrency, 
    projectedAmount = 0, 
    netCashFlow = 0, 
    recurringInstances = [],
    periodTransactions = []
}) {
    const [activeTab, setActiveTab] = useState('all');
    const [isMobile, setIsMobile] = useState(false);

    // Collapsible states (defaulted to closed)
    const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
    const [isPendingListOpen, setIsPendingListOpen] = useState(false);
    const [isRecordedListOpen, setIsRecordedListOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Recorded Breakdown
    const recordedIncomeTotal = useMemo(() => 
        periodTransactions
            .filter((i) => i.type === 'income')
            .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0),
        [periodTransactions]
    );

    const recordedExpenseTotal = useMemo(() => 
        periodTransactions
            .filter((i) => i.type === 'expense')
            .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0),
        [periodTransactions]
    );

    // Pending Breakdown
    const pendingIncomeTotal = useMemo(() => 
        recurringInstances
            .filter((i) => i.type === 'income')
            .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0),
        [recurringInstances]
    );

    const pendingExpenseTotal = useMemo(() => 
        recurringInstances
            .filter((i) => i.type === 'expense')
            .reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0),
        [recurringInstances]
    );

    const pendingNet = pendingIncomeTotal - pendingExpenseTotal;

    const filteredPending = useMemo(() => {
        if (activeTab === 'expense') return recurringInstances.filter((i) => i.type === 'expense');
        if (activeTab === 'income') return recurringInstances.filter((i) => i.type === 'income');
        return recurringInstances;
    }, [recurringInstances, activeTab]);

    const filteredRecorded = useMemo(() => {
        if (activeTab === 'expense') return periodTransactions.filter((i) => i.type === 'expense');
        if (activeTab === 'income') return periodTransactions.filter((i) => i.type === 'income');
        return periodTransactions;
    }, [periodTransactions, activeTab]);

    // Subtotal Calculations for Headers
    const pendingSubtotal = useMemo(() => {
        const income = filteredPending
            .filter((i) => i.type === 'income')
            .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
        const expense = filteredPending
            .filter((i) => i.type === 'expense')
            .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

        if (activeTab === 'income') return { val: income, type: 'income' };
        if (activeTab === 'expense') return { val: expense, type: 'expense' };
        return { val: income - expense, type: income - expense >= 0 ? 'income' : 'expense' };
    }, [filteredPending, activeTab]);

    const recordedSubtotal = useMemo(() => {
        const income = filteredRecorded
            .filter((i) => i.type === 'income')
            .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
        const expense = filteredRecorded
            .filter((i) => i.type === 'expense')
            .reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

        if (activeTab === 'income') return { val: income, type: 'income' };
        if (activeTab === 'expense') return { val: expense, type: 'expense' };
        return { val: income - expense, type: income - expense >= 0 ? 'income' : 'expense' };
    }, [filteredRecorded, activeTab]);

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
        { id: 'all', label: `Overview (${recurringInstances.length + periodTransactions.length})` },
        { id: 'expense', label: 'Expenses' },
        { id: 'income', label: 'Income' }
    ];

    const renderItemRow = (item, isPending, idx) => (
        <div 
            key={`${isPending ? 'pending' : 'recorded'}-${item.id || item.rule_id}-${item.date}-${idx}`}
            className="flex items-center justify-between py-2 px-2.5 rounded-lg border-none transition-colors text-xs"
        >
            <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <p className="font-medium text-zinc-200 truncate">{item.title}</p>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                        {isPending ? `Due ${item.date}` : item.date}
                    </p>
                </div>
            </div>

            <span className={`font-bold shrink-0 text-xs ${getAmountColor(item.type)}`}>
                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
            </span>
        </div>
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent 
                side={isMobile ? 'bottom' : 'right'} 
                className={`border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col justify-between ${
                    isMobile
                        ? 'w-full h-auto max-h-[88vh] rounded-t-xl p-4 sm:p-6'
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
                            Combined view of settled transactions and pending recurring commitments.
                        </SheetDescription>
                    </SheetHeader>

                    {/* Financial Summary Card with Toggle Header */}
                    <div className="bg-zinc-900/90 rounded-xl p-3.5 my-3 shrink-0 space-y-3 border-none">
                        <button
                            type="button"
                            onClick={() => setIsBreakdownOpen((prev) => !prev)}
                            className="w-full text-left flex items-center justify-between group outline-none"
                        >
                            <div>
                                <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
                                    Total Projected Netflow
                                </span>
                                <div className={`text-2xl font-extrabold mt-0.5 ${projectedAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {formatCurrency(projectedAmount)}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors py-1 px-2 rounded-md group-hover:bg-zinc-800/60">
                                <span className="text-[11px] font-medium">{isBreakdownOpen ? 'Hide' : 'Breakdown'}</span>
                                <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${isBreakdownOpen ? 'rotate-90' : ''}`} />
                            </div>
                        </button>

                        {/* Collapsible Enumeration Content */}
                        {isBreakdownOpen && (
                            <div className="space-y-2 text-xs pt-2 border-t border-zinc-800/80 animate-in fade-in-50 duration-200">
                                {/* Current Net Cash Flow Enumeration */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-zinc-200 font-medium">
                                        <span>Current Net Cash Flow</span>
                                        <span className={`font-bold ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {formatCurrency(netCashFlow)}
                                        </span>
                                    </div>
                                    <div className="pl-2.5 border-l-2 border-zinc-800 space-y-0.5 ml-0.5 text-zinc-400 text-[11px]">
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-1.5">
                                                <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                                                Recorded Income
                                            </span>
                                            <span className="font-semibold text-emerald-400">
                                                +{formatCurrency(recordedIncomeTotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-1.5">
                                                <span className="h-1 w-1 rounded-full bg-rose-400 shrink-0" />
                                                Recorded Expense
                                            </span>
                                            <span className="font-semibold text-rose-400">
                                                -{formatCurrency(recordedExpenseTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pending Recurring Net Enumeration */}
                                <div className="space-y-1 pt-1.5 border-t border-zinc-800/60">
                                    <div className="flex justify-between items-center text-zinc-200 font-medium">
                                        <span>Pending Recurring Net</span>
                                        <span className={`font-bold ${pendingNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {pendingNet >= 0 ? '+' : ''}{formatCurrency(pendingNet)}
                                        </span>
                                    </div>
                                    <div className="pl-2.5 border-l-2 border-zinc-800 space-y-0.5 ml-0.5 text-zinc-400 text-[11px]">
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-1.5">
                                                <span className="h-1 w-1 rounded-full bg-emerald-400 shrink-0" />
                                                Pending Income
                                            </span>
                                            <span className="font-semibold text-emerald-400">
                                                +{formatCurrency(pendingIncomeTotal)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="flex items-center gap-1.5">
                                                <span className="h-1 w-1 rounded-full bg-rose-400 shrink-0" />
                                                Pending Expense
                                            </span>
                                            <span className="font-semibold text-rose-400">
                                                -{formatCurrency(pendingExpenseTotal)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Underline Tabs */}
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

                    {/* Collapsible Notion-style Section Lists */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                        
                        {/* Section 1: Pending Recurring Dues Toggle */}
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setIsPendingListOpen((prev) => !prev)}
                                className="w-full sticky top-0 bg-zinc-950 py-1.5 flex items-center justify-between text-[11px] font-semibold border-b border-zinc-800/80 z-10 text-left transition-colors"
                            >
                                <span className="flex items-center gap-1.5 text-zinc-400    ">
                                    <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isPendingListOpen ? 'rotate-90' : ''}`} />
                                    <Clock className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
                                    Upcoming / Dues Yet To Be Paid
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold ${getAmountColor(pendingSubtotal.type)}`}>
                                        {pendingSubtotal.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(pendingSubtotal.val))}
                                    </span>
                                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-bold">
                                        {filteredPending.length}
                                    </span>
                                </div>
                            </button>

                            {isPendingListOpen && (
                                filteredPending.length === 0 ? (
                                    <div className="text-center py-3 text-zinc-500 text-[11px] italic">
                                        No pending recurring dues.
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 pl-2 animate-in fade-in-50 duration-150">
                                        {filteredPending.map((item, idx) => renderItemRow(item, true, idx))}
                                    </div>
                                )
                            )}
                        </div>

                        {/* Section 2: Recorded Transactions Toggle */}
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setIsRecordedListOpen((prev) => !prev)}
                                className="w-full sticky top-0 bg-zinc-950 py-1.5 flex items-center justify-between text-[11px] font-semibold text-zinc-400 border-b border-zinc-800/80 z-10 text-left hover:text-zinc-200 transition-colors"
                            >
                                <span className="flex items-center gap-1.5">
                                    <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${isRecordedListOpen ? 'rotate-90' : ''}`} />
                                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                                    Recorded / Settled Transactions
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold ${getAmountColor(recordedSubtotal.type)}`}>
                                        {recordedSubtotal.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(recordedSubtotal.val))}
                                    </span>
                                    <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-bold">
                                        {filteredRecorded.length}
                                    </span>
                                </div>
                            </button>

                            {isRecordedListOpen && (
                                filteredRecorded.length === 0 ? (
                                    <div className="text-center py-3 text-zinc-500 text-[11px] italic">
                                        No recorded transactions for this view.
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 pl-2 animate-in fade-in-50 duration-150">
                                        {filteredRecorded.map((item, idx) => renderItemRow(item, false, idx))}
                                    </div>
                                )
                            )}
                        </div>

                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
