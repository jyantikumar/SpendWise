import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from '@/components/ui/sheet';

export default function TransactionFilterSheet({
    isFilterSheetOpen,
    setIsFilterSheetOpen,
    activeFilterCount,
    search,
    setSearch,
    selectedType,
    setSelectedType,
    selectedAccount,
    setSelectedAccount,
    selectedRange,
    handleRangeChange,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    handleApplyCustomDates,
    hasActiveFilters,
    handleResetFilters,
    accounts = [],
    handleApplyFilters,
}) {
    return (
        <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" className="relative flex-1 sm:flex-initial gap-2 border-zinc-800 text-zinc-300">
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
                            <Filter className="h-4 w-4 text-zinc-400" /> Filter Transactions
                        </SheetTitle>
                        <SheetDescription className="text-zinc-400 text-xs">
                            Refine your transaction list by description, type, account, or date range.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-5">
                        {/* Search Filter */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Search</label>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                                <Input
                                    placeholder="Search description..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-8 h-9 border-zinc-800 text-zinc-300 bg-zinc-900"
                                />
                            </div>
                        </div>

                        {/* Type & Account Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Type</label>
                                <Select 
                                    value={selectedType} 
                                    onValueChange={(val) => setSelectedType(val)}
                                >
                                    <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300 bg-zinc-900">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-300">
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="expense">Expense</SelectItem>
                                        <SelectItem value="income">Income</SelectItem>
                                        <SelectItem value="transfer">Transfer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-zinc-400">Account</label>
                                <Select 
                                    value={selectedAccount} 
                                    onValueChange={(val) => setSelectedAccount(val)}
                                >
                                    <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300 bg-zinc-900">
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
                        </div>

                        {/* Date Range Filter */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-zinc-400">Date Range</label>
                            <Select value={selectedRange} onValueChange={handleRangeChange}>
                                <SelectTrigger className="h-9 w-full border-zinc-800 text-zinc-300 bg-zinc-900">
                                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Range" />
                                </SelectTrigger>
                                <SelectContent position="popper" align="start" className="border-zinc-800 bg-zinc-900 text-zinc-300">
                                    <SelectItem value="this_day">This Day</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                    <SelectItem value="this_year">This Year</SelectItem>
                                    <SelectItem value="custom">Custom Range</SelectItem>
                                    <SelectItem value="all">All Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Range Inputs */}
                        {selectedRange === 'custom' && (
                            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
                                <label className="text-xs font-medium text-zinc-400">Custom Date Range</label>
                                <div className="flex items-center gap-2">
                                    <Input 
                                        type="date" 
                                        value={startDate} 
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="h-9 border-zinc-800 text-zinc-300 text-xs bg-zinc-900"
                                    />
                                    <span className="text-xs text-zinc-400">to</span>
                                    <Input 
                                        type="date" 
                                        value={endDate} 
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="h-9 border-zinc-800 text-zinc-300 text-xs bg-zinc-900"
                                    />
                                </div>
                                <Button size="sm" variant="secondary" onClick={handleApplyCustomDates} className="w-full h-9 mt-2">
                                    Apply Custom Range
                                </Button>
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

                    <Button onClick={handleApplyFilters} className="h-9 px-6">
                        Done
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}