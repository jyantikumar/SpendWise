import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AnalysisActiveFiltersBar({
    activeFilterCount,
    handleResetFilters,
    type,
    setType,
    applyFilters,
    accountId,
    setAccountId,
    accounts,
    range,
    setRange,
    setStartDate,
    setEndDate,
    calendarMonth,
    startDate,
    endDate,
}) {
    return (
        <div className="space-y-1.5 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/80">
            <div className="flex items-center justify-between text-[11px] sm:text-xs">
                <span className="text-zinc-400 font-medium">
                    Active Filters ({activeFilterCount})
                </span>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleResetFilters}
                    className="text-[11px] sm:text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 h-5 px-1.5 -mr-1"
                >
                    Clear All
                </Button>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pt-0.5">
                {type !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs capitalize shrink-0">
                        <span>Type: {type}</span>
                        <X className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" onClick={() => { setType('all'); applyFilters({ type: 'all' }); }} />
                    </span>
                )}

                {accountId !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs shrink-0 max-w-[130px]">
                        <span className="truncate">{accounts.find(a => String(a.id) === String(accountId))?.name || 'Account'}</span>
                        <X className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" onClick={() => { setAccountId('all'); applyFilters({ account_id: 'all' }); }} />
                    </span>
                )}

                {range !== 'monthly' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs shrink-0">
                        <span>
                            {range === 'this_month'
                                ? new Date(`${calendarMonth}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                : range === 'custom' && startDate && endDate
                                ? `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}`
                                : range.replace(/_/g, ' ')}
                        </span>
                        <X 
                            className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" 
                            onClick={() => { 
                                setRange('monthly'); 
                                setStartDate(''); 
                                setEndDate(''); 
                                applyFilters({ range: 'monthly', start_date: '', end_date: '' }); 
                            }} 
                        />
                    </span>
                )}
            </div>
        </div>
    );
}