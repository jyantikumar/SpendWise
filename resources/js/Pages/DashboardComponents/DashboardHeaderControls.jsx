// resources/js/Pages/DashboardComponents/DashboardHeaderControls.jsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Calendar, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';

const RANGE_OPTIONS = [
    { value: 'this_day', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_30_days', label: 'Last 30 Days' },
    { value: 'this_year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
];

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
    const currentLabel =
        RANGE_OPTIONS.find((o) => o.value === currentFilter)?.label || 'This Month';

    // Build a human-friendly phrase: "today", "this week", "a custom range", etc.
    const periodPhrase =
        currentFilter === 'this_day' ? 'today' :
        currentFilter === 'this_week' ? 'this week' :
        currentFilter === 'this_month' ? 'this month' :
        currentFilter === 'last_30_days' ? 'the last 30 days' :
        currentFilter === 'this_year' ? 'this year' :
        currentFilter === 'custom' ? 'your custom range' :
        'the selected period';

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-xs sm:text-sm text-zinc-400 line-clamp-1">
                    Overview of your finances for {periodPhrase}.
                </p>

                {/* Split button: [ + Add Transaction | ▾ ] */}
                <div className="flex items-center w-full sm:w-auto rounded-md overflow-hidden divide-x divide-zinc-300">
                    <Button
                        onClick={openCreateModal}
                        className="flex-1 sm:flex-initial rounded-none border-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs h-9 px-3 gap-1.5 shadow-none"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add Transaction
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                className="rounded-none border-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 h-9 px-2 shadow-none"
                                aria-label="Date range options"
                            >
                                <ChevronDown className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="border-zinc-800 bg-zinc-950 text-zinc-300 text-xs w-[180px]"
                        >
                            <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1.5">
                                Date Range
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            {RANGE_OPTIONS.map((opt) => (
                                <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() => handleFilterChange(opt.value)}
                                    className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                >
                                    <Calendar className="mr-2 h-3 w-3 text-zinc-400" />
                                    <span className="flex-1">{opt.label}</span>
                                    {currentFilter === opt.value && (
                                        <Check className="h-3 w-3 text-zinc-300" />
                                    )}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Custom date inputs — only when "Custom Range" is selected */}
            {currentFilter === 'custom' && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-md border border-zinc-800 bg-zinc-900/60">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400 shrink-0">
                        <SlidersHorizontal className="h-3.5 w-3.5" />
                        <span>Custom:</span>
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                        <Input
                            type="date"
                            value={startDateInput}
                            onChange={(e) => setStartDateInput(e.target.value)}
                            className="h-8 border-zinc-800 bg-zinc-900 text-zinc-200 text-xs flex-1"
                        />
                        <span className="text-xs text-zinc-500">to</span>
                        <Input
                            type="date"
                            value={endDateInput}
                            onChange={(e) => setEndDateInput(e.target.value)}
                            className="h-8 border-zinc-800 bg-zinc-900 text-zinc-200 text-xs flex-1"
                        />
                        <Button
                            size="sm"
                            onClick={handleApplyCustomDates}
                            className="h-8 px-3 text-xs shrink-0"
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            )}

            {/* Active range chip — hidden when on default range */}
            {currentFilter !== 'this_day' && currentFilter !== 'this_month' && currentFilter !== 'custom' && (
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => handleFilterChange('this_month')}
                        className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    >
                        <Calendar className="h-3 w-3 text-zinc-400" />
                        {currentLabel}
                        <span className="text-zinc-500 ml-1">×</span>
                    </button>
                </div>
            )}
        </div>
    );
}