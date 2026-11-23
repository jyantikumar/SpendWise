// resources/js/Pages/Analysis/components/AnalysisFilterSheet.jsx
import { Filter, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetTrigger,
    SheetFooter
} from '@/components/ui/sheet';
import { 
    Select, 
    SelectContent, 
    SelectGroup, 
    SelectItem, 
    SelectLabel, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';

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
    accounts = [],
    getTimeHorizonLabel,
    hasActiveFilters,
    handleResetFilters,
    handleApplyAllFilters,
}) {
    return (
        <Sheet open={isFilterSheetOpen} onOpenChange={handleSheetOpenChange}>
            <SheetTrigger asChild>
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs h-9 relative"
                >
                    <Filter className="h-3.5 w-3.5 mr-2 text-zinc-400" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-950">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md border-zinc-800 bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6">
                <div className="space-y-6">
                    <SheetHeader>
                        <SheetTitle className="text-zinc-100 font-bold flex items-center justify-between">
                            Filter Visual Analytics
                        </SheetTitle>
                    </SheetHeader>

                    <div className="space-y-4">
                        {/* Transaction Type Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-zinc-400">Transaction Type</Label>
                            <Select value={tempType} onValueChange={setTempType}>
                                <SelectTrigger className="w-full border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-300">
                                    <SelectItem value="all">All Transactions</SelectItem>
                                    <SelectItem value="expense">Expenses Only</SelectItem>
                                    <SelectItem value="income">Income Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Account Scope Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-zinc-400">Account Scope</Label>
                            <Select value={tempAccountId} onValueChange={setTempAccountId}>
                                <SelectTrigger className="w-full border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectValue placeholder="Select Account" />
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-300">
                                    <SelectItem value="all">All Accounts</SelectItem>
                                    {accounts.map((acc) => (
                                        <SelectItem key={acc.id} value={String(acc.id)}>
                                            {acc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Time Horizon Filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold text-zinc-400">Time Horizon</Label>
                            <Select value={tempRange} onValueChange={setTempRange}>
                                <SelectTrigger className="w-full border-zinc-800 bg-zinc-900 text-zinc-200">
                                    <SelectValue>{getTimeHorizonLabel(tempRange)}</SelectValue>
                                </SelectTrigger>
                                <SelectContent className="border-zinc-800 bg-zinc-950 text-zinc-300">
                                    <SelectGroup>
                                        <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-2 py-1">
                                            Macro Views
                                        </SelectLabel>
                                        <SelectItem value="monthly">Monthly Breakdown</SelectItem>
                                        <SelectItem value="yearly">Yearly Breakdown</SelectItem>
                                    </SelectGroup>
                                    <SelectGroup>
                                        <SelectLabel className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-2 py-1">
                                            Time Horizons
                                        </SelectLabel>
                                        <SelectItem value="this_month">This Month</SelectItem>
                                        <SelectItem value="1_week">1 Week</SelectItem>
                                        <SelectItem value="3_months">3 Months</SelectItem>
                                        <SelectItem value="6_months">6 Months</SelectItem>
                                        <SelectItem value="this_year">This Year</SelectItem>
                                        <SelectItem value="custom">Custom Range</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Custom Date Inputs */}
                        {tempRange === 'custom' && (
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-zinc-400">Start Date</Label>
                                    <Input
                                        type="date"
                                        value={tempStartDate}
                                        onChange={(e) => setTempStartDate(e.target.value)}
                                        className="border-zinc-800 bg-zinc-900 text-zinc-200 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[11px] font-medium text-zinc-400">End Date</Label>
                                    <Input
                                        type="date"
                                        value={tempEndDate}
                                        onChange={(e) => setTempEndDate(e.target.value)}
                                        className="border-zinc-800 bg-zinc-900 text-zinc-200 text-xs"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <SheetFooter className="flex-row items-center justify-between gap-3 pt-6 border-t border-zinc-900">
                    <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={handleResetFilters}
                        disabled={!hasActiveFilters}
                        className="text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 h-9 px-3"
                    >
                        <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                        Reset
                    </Button>
                    <Button 
                        type="button" 
                        onClick={handleApplyAllFilters}
                        className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200 font-semibold text-xs h-9 px-4 flex-1"
                    >
                        Apply Filters
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}