import { Filter, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';

export function FilterSheet({ 
    open, 
    onOpenChange, 
    dateFilter, 
    setDateFilter, 
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    filterType, 
    setFilterType, 
    filterStatus, 
    setFilterStatus, 
    hasActiveFilters, 
    handleResetFilters,
    resetPages
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col justify-between">
                <div>
                    <SheetHeader className="pb-4 border-b border-zinc-800">
                        <SheetTitle className="text-zinc-100 flex items-center gap-2">
                            <Filter className="h-4 w-4 text-zinc-400" /> Filter Rules & Schedules
                        </SheetTitle>
                        <SheetDescription className="text-zinc-400 text-xs">
                            Filter your subscription and payment rules by timeframe, custom date ranges, type, and schedule status.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-5">
                        {/* Timeframe Filter */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Timeframe (Upcoming Dues)</label>
                            <div className="grid grid-cols-4 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                                {[
                                    { id: 'current_month', label: 'This Month' },
                                    { id: '30_days', label: '30 Days' },
                                    { id: 'all', label: 'All' },
                                    { id: 'custom', label: 'Custom' },
                                ].map((timeOption) => (
                                    <button
                                        key={timeOption.id}
                                        type="button"
                                        onClick={() => {
                                            setDateFilter(timeOption.id);
                                            resetPages.setUpcomingPage(1);
                                        }}
                                        className={`py-1.5 px-2 rounded-md text-[11px] font-medium text-center transition-all ${
                                            dateFilter === timeOption.id 
                                                ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                                                : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        {timeOption.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Date Inputs (only shown when 'Custom' is selected) */}
                        {dateFilter === 'custom' && (
                            <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg space-y-3">
                                <span className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-zinc-400" /> Custom Date Range
                                </span>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">Start Date</label>
                                        <Input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => {
                                                setCustomStartDate(e.target.value);
                                                resetPages.setUpcomingPage(1);
                                            }}
                                            className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-200"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">End Date</label>
                                        <Input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => {
                                                setCustomEndDate(e.target.value);
                                                resetPages.setUpcomingPage(1);
                                            }}
                                            className="h-8 text-xs bg-zinc-950 border-zinc-800 text-zinc-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Rule Type Filter */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Rule Type</label>
                            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                                {['all', 'expense', 'income'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => {
                                            setFilterType(type);
                                            resetPages.setMissedPage(1);
                                            resetPages.setUpcomingPage(1);
                                            resetPages.setRulesPage(1);
                                        }}
                                        className={`py-1.5 px-3 rounded-md text-[11px] font-medium capitalize text-center transition-all ${
                                            filterType === type 
                                                ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                                                : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rule Status Filter */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Rule Status</label>
                            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                                {['all', 'active', 'paused'].map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => {
                                            setFilterStatus(status);
                                            resetPages.setRulesPage(1);
                                        }}
                                        className={`py-1.5 px-2 rounded-md text-[11px] font-medium capitalize text-center transition-all ${
                                            filterStatus === status 
                                                ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                                                : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <SheetFooter className="pt-4 border-t border-zinc-800 flex flex-row items-center justify-between gap-2">
                    {hasActiveFilters ? (
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={handleResetFilters}
                            className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 gap-1 h-9"
                        >
                            <X className="h-3.5 w-3.5" /> Reset Filters
                        </Button>
                    ) : <div />}

                    <SheetClose asChild>
                        <Button className="h-9 px-6">Done</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}