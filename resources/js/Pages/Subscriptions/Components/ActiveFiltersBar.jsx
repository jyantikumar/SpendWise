import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ActiveFiltersBar({ 
    hasActiveFilters, 
    activeFilterCount, 
    dateFilter, 
    customStartDate,
    customEndDate,
    filterType, 
    filterStatus, 
    setDateFilter, 
    setFilterType, 
    setFilterStatus, 
    handleResetFilters,
    resetPages
}) {
    if (!hasActiveFilters) return null;

    const getTimeframeLabel = () => {
        if (dateFilter === '30_days') return 'Next 30 Days';
        if (dateFilter === 'all') return 'All Upcoming';
        if (dateFilter === 'custom') {
            if (customStartDate && customEndDate) return `${customStartDate} to ${customEndDate}`;
            if (customStartDate) return `From ${customStartDate}`;
            if (customEndDate) return `Until ${customEndDate}`;
            return 'Custom Range';
        }
        return 'This Month';
    };

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

            <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
                {dateFilter !== 'current_month' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs capitalize shrink-0">
                        <span>Range: {getTimeframeLabel()}</span>
                        <X 
                            className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" 
                            onClick={() => { setDateFilter('current_month'); resetPages.setUpcomingPage(1); }} 
                        />
                    </span>
                )}

                {filterType !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs capitalize shrink-0">
                        <span>Type: {filterType}</span>
                        <X 
                            className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" 
                            onClick={() => { setFilterType('all'); resetPages.setMissedPage(1); resetPages.setUpcomingPage(1); resetPages.setRulesPage(1); }} 
                        />
                    </span>
                )}

                {filterStatus !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-[11px] sm:text-xs capitalize shrink-0">
                        <span>Status: {filterStatus}</span>
                        <X 
                            className="h-3 w-3 shrink-0 cursor-pointer hover:text-rose-400" 
                            onClick={() => { setFilterStatus('all'); resetPages.setRulesPage(1); }} 
                        />
                    </span>
                )}
            </div>
        </div>
    );
}