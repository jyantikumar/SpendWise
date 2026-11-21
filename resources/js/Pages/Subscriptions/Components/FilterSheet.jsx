// resources/js/Pages/Subscriptions/Components/FilterSheet.jsx
import { Filter, X, Calendar, SlidersHorizontal } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

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
    filterAccountId,
    setFilterAccountId,
    filterCategoryId,
    setFilterCategoryId,
    filterFrequency,
    setFilterFrequency,
    accounts = [],
    categories = [],
    hasActiveFilters, 
    handleResetFilters,
    resetPages
}) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md border-none bg-zinc-950 text-zinc-100 flex flex-col justify-between overflow-y-auto">
                <div className="space-y-6">
                    {/* Sheet Header */}
                    <SheetHeader className="pb-4 border-b border-none">
                        <SheetTitle className="text-zinc-100 flex items-center gap-2 text-base font-semibold">
                            <Filter className="h-4 w-4 text-zinc-400" /> Filter Rules & Schedules
                        </SheetTitle>
                        <SheetDescription className="text-zinc-400 text-xs">
                            Refine recurring rules and scheduled dues by timeframe, accounts, categories, and status.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="space-y-5">
                        {/* Section 1: Schedule & Timeframe */}
                        <div className="space-y-3 p-3 rounded-xl">
                            <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-zinc-400" /> Schedule & Timeframe
                            </span>

                            {/* Timeframe Tabs */}
                            <div className="space-y-1.5">
                                <div className="grid grid-cols-4 gap-1 bg-zinc-900 p-1 rounded-lg border border-none text-xs">
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
                                                resetPages.setUpcomingPage?.(1);
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

                            {/* Custom Date Inputs */}
                            {dateFilter === 'custom' && (
                                <div className="pt-2 grid grid-cols-2 gap-2 border-t border-none/80">
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">Start Date</label>
                                        <Input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => {
                                                setCustomStartDate(e.target.value);
                                                resetPages.setUpcomingPage?.(1);
                                            }}
                                            className="h-8 w-full text-xs bg-zinc-950 border-none text-zinc-200"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] text-zinc-400">End Date</label>
                                        <Input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => {
                                                setCustomEndDate(e.target.value);
                                                resetPages.setUpcomingPage?.(1);
                                            }}
                                            className="h-8 w-full text-xs bg-zinc-950 border-none text-zinc-200"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 2: Classifications & Accounts */}
                        <div className="space-y-3 p-3 rounded-xl">
                            <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                                <SlidersHorizontal className="h-3.5 w-3.5 text-zinc-400" /> Filters & Properties
                            </span>

                            <div className="grid grid-cols-2 gap-3">
                                {/* Rule Type Dropdown */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-zinc-400">Type</label>
                                    <Select 
                                        value={filterType} 
                                        onValueChange={(val) => {
                                            setFilterType(val);
                                            resetPages.setMissedPage?.(1);
                                            resetPages.setUpcomingPage?.(1);
                                            resetPages.setRulesPage?.(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs border-none bg-zinc-900 text-zinc-200">
                                            <SelectValue placeholder="All Types" />
                                        </SelectTrigger>
                                        <SelectContent className="border-none bg-zinc-900 text-zinc-200">
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="expense">Expense Only</SelectItem>
                                            <SelectItem value="income">Income Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Rule Status Dropdown */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-zinc-400">Status</label>
                                    <Select 
                                        value={filterStatus} 
                                        onValueChange={(val) => {
                                            setFilterStatus(val);
                                            resetPages.setRulesPage?.(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs border-none bg-zinc-900 text-zinc-200">
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent className="border-none bg-zinc-900 text-zinc-200">
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="paused">Paused</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Account Dropdown */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-zinc-400">Account</label>
                                    <Select 
                                        value={filterAccountId} 
                                        onValueChange={(val) => {
                                            setFilterAccountId(val);
                                            resetPages.setTodayPage?.(1);
                                            resetPages.setMissedPage?.(1);
                                            resetPages.setUpcomingPage?.(1);
                                            resetPages.setRulesPage?.(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs border-none bg-zinc-900 text-zinc-200">
                                            <SelectValue placeholder="All Accounts" />
                                        </SelectTrigger>
                                        <SelectContent className="border-none bg-zinc-900 text-zinc-200">
                                            <SelectItem value="all">All Accounts</SelectItem>
                                            {accounts.map((acc) => (
                                                <SelectItem key={acc.id} value={String(acc.id)}>
                                                    {acc.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Category Dropdown */}
                                <div className="space-y-1">
                                    <label className="text-[11px] font-medium text-zinc-400">Category</label>
                                    <Select 
                                        value={filterCategoryId} 
                                        onValueChange={(val) => {
                                            setFilterCategoryId(val);
                                            resetPages.setTodayPage?.(1);
                                            resetPages.setMissedPage?.(1);
                                            resetPages.setUpcomingPage?.(1);
                                            resetPages.setRulesPage?.(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-full h-8 text-xs border-none bg-zinc-900 text-zinc-200">
                                            <SelectValue placeholder="All Categories" />
                                        </SelectTrigger>
                                        <SelectContent className="border-none bg-zinc-900 text-zinc-200">
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={String(cat.id)}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Frequency Dropdown */}
                            <div className="space-y-1 pt-1">
                                <label className="text-[11px] font-medium text-zinc-400">Recurrence Frequency</label>
                                <Select 
                                    value={filterFrequency} 
                                    onValueChange={(val) => {
                                        setFilterFrequency(val);
                                        resetPages.setTodayPage?.(1);
                                        resetPages.setMissedPage?.(1);
                                        resetPages.setUpcomingPage?.(1);
                                        resetPages.setRulesPage?.(1);
                                    }}
                                >
                                    <SelectTrigger className="w-full h-8 text-xs border-none bg-zinc-900 text-zinc-200">
                                        <SelectValue placeholder="All Frequencies" />
                                    </SelectTrigger>
                                    <SelectContent className="border-none bg-zinc-900 text-zinc-200">
                                        <SelectItem value="all">All Frequencies</SelectItem>
                                        <SelectItem value="daily">Daily</SelectItem>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="custom">Custom (Days)</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Action Bar */}
                <SheetFooter className="pt-4 border-t border-none flex flex-row items-center justify-between gap-2">
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
                        <Button className="h-9 px-6 bg-zinc-100 text-zinc-900 hover:bg-zinc-200 font-medium text-xs">
                            Apply & Close
                        </Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}