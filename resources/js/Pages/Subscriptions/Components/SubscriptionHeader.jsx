// resources/js/Pages/Subscriptions/Components/SubscriptionHeader.jsx
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Filter, ChevronDown, SlidersHorizontal } from 'lucide-react';

export function SubscriptionHeader({
    activeFilterCount = 0,
    onOpenFilter,
    onOpenCreate,
}) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                <p className="text-xs sm:text-sm text-zinc-400 line-clamp-1">
                    Manage recurring bills, upcoming dues, and missed payments.
                </p>
            </div>

            {/* Split button: [ + New Recurring | ▾ ] */}
            <div className="flex items-center w-full sm:w-auto rounded-md overflow-hidden divide-x divide-zinc-300">
                <Button
                    onClick={onOpenCreate}
                    className="flex-1 sm:flex-initial rounded-none border-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs h-9 px-3 gap-1.5 shadow-none"
                >
                    <Plus className="h-3.5 w-3.5" /> New Recurring
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            className="rounded-none border-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 h-9 px-2 shadow-none relative"
                            aria-label="More actions"
                        >
                            <ChevronDown className="h-3.5 w-3.5" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-zinc-900 text-zinc-100 px-0.5 text-[9px] font-bold border border-zinc-100">
                                    {activeFilterCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="border-zinc-800 bg-zinc-950 text-zinc-300 text-xs w-[180px]"
                    >
                        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1.5">
                            Actions
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                            onClick={onOpenFilter}
                            className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                        >
                            <SlidersHorizontal className="mr-2 h-3 w-3 text-zinc-400" />
                            <span className="flex-1">Filter</span>
                            {activeFilterCount > 0 && (
                                <span className="text-[10px] text-zinc-500">
                                    {activeFilterCount}
                                </span>
                            )}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}