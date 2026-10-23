import { RefreshCw, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SubscriptionHeader({ 
    activeFilterCount, 
    onOpenFilter, 
    onOpenCreate 
}) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                    <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 text-primary" /> Recurring & Subscriptions
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400">
                    Track scheduled dues, missed payments, and recurring cash flow.
                </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                    variant="outline" 
                    onClick={onOpenFilter} 
                    className="relative flex-1 sm:flex-initial gap-2 border-zinc-800 text-zinc-300 h-9 text-xs"
                >
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                    {activeFilterCount > 0 && (
                        <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                            {activeFilterCount}
                        </span>
                    )}
                </Button>

                <Button onClick={onOpenCreate} className="flex-1 sm:flex-initial gap-2 text-xs h-9">
                    <Plus className="h-4 w-4" /> Add Recurring Rule
                </Button>
            </div>
        </div>
    );
}