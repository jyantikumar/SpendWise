import { Plus, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardHeaderControls({
    currentFilter,
    handleFilterChange,
    startDateInput,
    setStartDateInput,
    endDateInput,
    setEndDateInput,
    handleApplyCustomDates,
    openCreateModal,
}) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="hidden sm:block text-sm text-zinc-400 font-medium">
                Overview & Activity
            </div>

            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:ml-auto">
                {currentFilter === 'custom' ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 w-full sm:w-auto">
                        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
                            <Select value={currentFilter} onValueChange={handleFilterChange}>
                                <SelectTrigger className="w-full sm:w-[150px] h-10 border-zinc-800 text-zinc-300">
                                    <SlidersHorizontal className="mr-2 h-4 w-4 shrink-0" />
                                    <SelectValue placeholder="Range" />
                                </SelectTrigger>
                                <SelectContent 
                                    align="start" 
                                    side="bottom" 
                                    sideOffset={4} 
                                    className="border-zinc-800 bg-background text-zinc-300 min-w-[var(--radix-select-trigger-width)]"
                                >
                                    <SelectItem value="this_day">This Day</SelectItem>
                                    <SelectItem value="this_week">This Week</SelectItem>
                                    <SelectItem value="this_month">This Month</SelectItem>
                                    <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                    <SelectItem value="this_year">This Year</SelectItem>
                                    <SelectItem value="custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button onClick={openCreateModal} className="gap-2 h-10 sm:hidden">
                                <Plus className="h-4 w-4" /> New
                            </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <Input 
                                type="date" 
                                value={startDateInput} 
                                onChange={(e) => setStartDateInput(e.target.value)}
                                className="w-full sm:w-[130px] h-10 border-zinc-800 text-zinc-300 text-xs text-center sm:text-left bg-transparent"
                            />
                            <span className="text-xs text-zinc-400 shrink-0 text-center sm:text-left">to</span>
                            <Input 
                                type="date" 
                                value={endDateInput} 
                                onChange={(e) => setEndDateInput(e.target.value)}
                                className="w-full sm:w-[130px] h-10 border-zinc-800 text-zinc-300 text-xs text-center sm:text-left bg-transparent"
                            />
                            <Button size="sm" variant="secondary" onClick={handleApplyCustomDates} className="h-10 px-3 shrink-0 w-full sm:w-auto">
                                Apply
                            </Button>
                        </div>

                        <Button onClick={openCreateModal} className="gap-2 h-10 hidden sm:flex shrink-0">
                            <Plus className="h-4 w-4" /> New Transaction
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-2 sm:flex items-center justify-end sm:gap-2.5 w-full sm:w-auto">
                        <Select value={currentFilter} onValueChange={handleFilterChange}>
                            <SelectTrigger className="w-full sm:w-[160px] h-10 border-zinc-800 text-zinc-300">
                                <SlidersHorizontal className="mr-2 h-4 w-4 shrink-0" />
                                <SelectValue placeholder="Range" />
                            </SelectTrigger>
                            <SelectContent className="border-zinc-800 bg-background text-zinc-300">
                                <SelectItem value="this_day">This Day</SelectItem>
                                <SelectItem value="this_week">This Week</SelectItem>
                                <SelectItem value="this_month">This Month</SelectItem>
                                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                                <SelectItem value="this_year">This Year</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={openCreateModal} className="gap-2 h-10 w-full sm:w-auto shrink-0">
                            <Plus className="h-4 w-4" /> 
                            <span className="inline sm:hidden">New</span>
                            <span className="hidden sm:inline">New Transaction</span>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}