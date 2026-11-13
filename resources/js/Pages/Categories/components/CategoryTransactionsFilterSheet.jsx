// resources/js/Pages/Categories/components/CategoryTransactionsFilterSheet.jsx
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function CategoryTransactionsFilterSheet({
    isOpen,
    onOpenChange,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    selectedAccount,
    setSelectedAccount,
    accounts = [],
    handleResetFilters,
    handleApplyFilters,
    activeFilterCount,
}) {
    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="border-zinc-800 bg-background text-zinc-200 flex flex-col sm:max-w-md">
                <SheetHeader className="pb-4 border-b border-zinc-800">
                    <SheetTitle className="flex items-center gap-2 text-zinc-100">
                        <SlidersHorizontal className="h-4 w-4 text-primary" /> Filter Transactions
                    </SheetTitle>
                    <SheetDescription className="text-xs text-zinc-400">
                        Narrow down records by date range or specific account.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 py-6 space-y-5 overflow-y-auto">
                    {/* Date Range Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <span className="text-[11px] text-zinc-400">Start Date</span>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="h-9 text-xs border-zinc-800 bg-zinc-900 text-zinc-200"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-[11px] text-zinc-400">End Date</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="h-9 text-xs border-zinc-800 bg-zinc-900 text-zinc-200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Account Select Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Account Filter
                        </label>
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                            <SelectTrigger className="h-9 text-xs border-zinc-800 bg-zinc-900 text-zinc-200 w-full">
                                <SelectValue placeholder="All Accounts" />
                            </SelectTrigger>
                            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
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

                <SheetFooter className="pt-4 border-t border-zinc-800 flex flex-row items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetFilters}
                        className="flex-1 h-9 border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs gap-1.5"
                    >
                        <RotateCcw className="h-3.5 w-3.5" /> Reset
                    </Button>
                    <Button
                        size="sm"
                        onClick={handleApplyFilters}
                        className="flex-1 h-9 text-xs font-medium"
                    >
                        Apply Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </Button>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}