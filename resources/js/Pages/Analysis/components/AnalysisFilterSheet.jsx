import { Filter, Wallet, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from '@/components/ui/sheet';

export function AnalysisFilterSheet({
    isFilterSheetOpen,
    handleSheetOpenChange,
    activeFilterCount,
    tempType,
    setTempType,
    tempAccountId,
    setTempAccountId,
    tempRange,
    setTempRange,
    tempStartDate,
    setTempStartDate,
    tempEndDate,
    setTempEndDate,
    accounts,
    getTimeHorizonLabel,
    hasActiveFilters,
    handleResetFilters,
    handleApplyAllFilters,
}) {
    return (
        <Sheet open={isFilterSheetOpen} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
                <Button variant="outline" className="relative w-full sm:w-auto gap-2 border-zinc-800 text-zinc-300">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-full sm:max-w-md border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col justify-between">
                <div>
                    <SheetHeader className="pb-4 border-b border-zinc-800">
                        <SheetTitle className="text-zinc-100 flex items-center gap-2">
                            <Filter className="h-4 w-4 text-zinc-400" /> Filter Analysis
                        </SheetTitle>
                        <SheetDescription className="text-zinc-400 text-xs">
                            Adjust flow type, selected account, and time horizons.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-5">
                        {/* Flow Type Filter */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Flow Type</label>
                            <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs">
                                {[
                                    { label: 'All Flow', value: 'all' },
                                    { label: 'Expenses', value: 'expense' },
                                    { label: 'Income', value: 'income' },
                                ].map((pill) => (
                                    <button
                                        key={pill.value}
                                        type="button"
                                        onClick={() => setTempType(pill.value)}
                                        className={`w-full py-1.5 rounded-md font-medium text-xs text-center transition-all whitespace-nowrap ${
                                            tempType === pill.value
                                                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                                                : 'text-zinc-400 hover:text-zinc-200'
                                        }`}
                                    >
                                        {pill.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Account Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Account</label>
                            <Select value={tempAccountId} onValueChange={setTempAccountId}>
                                <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300 bg-zinc-900">
                                    <Wallet className="mr-2 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                    <SelectValue placeholder="All Accounts" />
                                </SelectTrigger>
                                <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-300 max-h-60">
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map((acc) => (
                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Time Horizon Selector */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Time Horizon</label>
                            <Select value={tempRange} onValueChange={setTempRange}>
                                <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300 bg-zinc-900">
                                    <SlidersHorizontal className="mr-2 h-3.5 w-3.5 text-zinc-400 shrink-0" />
                                    <SelectValue>{getTimeHorizonLabel(tempRange)}</SelectValue>
                                </SelectTrigger>
                                <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectGroup>
                                        <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-2 py-1">
                                            Aggregated Comparisons
                                        </SelectLabel>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectGroup>

                                    <SelectSeparator className="bg-zinc-800 my-1" />

                                    <SelectGroup>
                                        <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-2 py-1">
                                            Time Horizons
                                        </SelectLabel>
                                        <SelectItem value="this_month">This Month</SelectItem>
                                        <SelectItem value="1_week">1 Week</SelectItem>
                                        <SelectItem value="6_months">6 Months</SelectItem>
                                        <SelectItem value="this_year">This Year</SelectItem>
                                        <SelectItem value="custom">Custom Range</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Date Range */}
                        {tempRange === 'custom' && (
                            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                                <label className="text-xs font-medium text-zinc-400">Custom Date Range</label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="date"
                                        value={tempStartDate}
                                        onChange={(e) => setTempStartDate(e.target.value)}
                                        className="h-9 border-zinc-800 text-zinc-300 text-xs bg-zinc-900"
                                    />
                                    <span className="text-xs text-zinc-400">to</span>
                                    <Input
                                        type="date"
                                        value={tempEndDate}
                                        onChange={(e) => setTempEndDate(e.target.value)}
                                        className="h-9 border-zinc-800 text-zinc-300 text-xs bg-zinc-900"
                                    />
                                </div>
                            </div>
                        )}
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

                    <Button onClick={handleApplyAllFilters} className="h-9 px-6">
                        Apply Filters
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}