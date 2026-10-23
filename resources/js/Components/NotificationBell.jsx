import { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import { Bell, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PayInstanceDialog } from '@/components/PayInstanceDialog';

export function NotificationBell() {
    const { notifications, accounts = [] } = usePage().props;
    const { due_today = [], overdue = [], count = 0 } = notifications || {};

    const [payingInstance, setPayingInstance] = useState(null);

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const handleSkip = (item) => {
        router.post(
            route('recurring.skip', item.id), 
            { due_date: item.due_date }, 
            {
                preserveScroll: true,
                onSuccess: () => toast.info(`Skipped payment for ${item.title}`),
            }
        );
    };

    return (
        <>
            <Popover.Root>
                <Popover.Trigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="relative h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                    >
                        <Bell className="h-4 w-4" />
                        {count > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-zinc-950">
                                {count > 99 ? '99+' : count}
                            </span>
                        )}
                    </Button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content 
                        align="end" 
                        sideOffset={8}
                        className="w-80 sm:w-96 border border-zinc-800 bg-zinc-950 p-0 text-zinc-100 shadow-xl rounded-lg z-50 focus:outline-none"
                    >
                        {/* Popover Header */}
                        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-zinc-200">Payment Alerts</span>
                                {count > 0 && (
                                    <Badge variant="outline" className="border-rose-900/80 bg-rose-950/30 text-[10px] text-rose-400">
                                        {count} pending
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* List Area */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
                            {count === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                    <CheckCircle2 className="h-8 w-8 text-emerald-500/80 mb-2" />
                                    <p className="text-xs font-medium text-zinc-300">All caught up!</p>
                                    <p className="text-[11px] text-zinc-500 mt-0.5">No payments due today or overdue.</p>
                                </div>
                            ) : (
                                <>
                                    {/* Overdue Section */}
                                    {overdue.length > 0 && (
                                        <div className="p-2 space-y-1.5">
                                            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-rose-400 uppercase flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" /> Overdue ({overdue.length})
                                            </div>
                                            {overdue.map((item, idx) => (
                                                <div 
                                                    key={`overdue-${item.id}-${idx}`} 
                                                    className="p-2.5 rounded-lg border border-rose-950/40 bg-zinc-900/40 space-y-2"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-zinc-200 truncate">{item.title}</p>
                                                            <p className="text-[10px] text-rose-400 font-medium mt-0.5">Due {item.due_date}</p>
                                                        </div>
                                                        <span className="text-xs font-bold text-rose-500 shrink-0">
                                                            -{formatCurrency(item.amount)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-zinc-800/60">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-6 text-[10px] px-2.5 border-rose-900/50 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"
                                                            onClick={() => setPayingInstance({ ...item, rule_id: item.id })}
                                                        >
                                                            Pay
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            className="h-6 text-[10px] px-2 text-zinc-400 hover:text-zinc-200"
                                                            onClick={() => handleSkip(item)}
                                                        >
                                                            Skip
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Due Today Section */}
                                    {due_today.length > 0 && (
                                        <div className="p-2 space-y-1.5">
                                            <div className="px-2 py-1 text-[10px] font-semibold tracking-wider text-amber-400 uppercase flex items-center gap-1">
                                                <Clock className="h-3 w-3" /> Due Today ({due_today.length})
                                            </div>
                                            {due_today.map((item, idx) => (
                                                <div 
                                                    key={`today-${item.id}-${idx}`} 
                                                    className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/40 space-y-2"
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs font-semibold text-zinc-200 truncate">{item.title}</p>
                                                            <p className="text-[10px] text-amber-400/80 font-medium mt-0.5">Due Today</p>
                                                        </div>
                                                        <span className="text-xs font-bold text-zinc-200 shrink-0">
                                                            -{formatCurrency(item.amount)}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-end gap-1.5 pt-1.5 border-t border-zinc-800/60">
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline" 
                                                            className="h-6 text-[10px] px-2.5 border-zinc-800 text-zinc-300 hover:text-zinc-100"
                                                            onClick={() => setPayingInstance({ ...item, rule_id: item.id })}
                                                        >
                                                            Pay
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            className="h-6 text-[10px] px-2 text-zinc-400 hover:text-zinc-200"
                                                            onClick={() => handleSkip(item)}
                                                        >
                                                            Skip
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer Navigation Link */}
                        <div className="border-t border-zinc-800 p-2 text-center bg-zinc-900/40">
                            <Link 
                                href={route('subscriptions.index')} 
                                className="text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors font-medium block py-1"
                            >
                                View All Subscriptions & Dues →
                            </Link>
                        </div>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>

            {/* Modal for processing payment when clicking Pay from Popover */}
            <PayInstanceDialog
                open={!!payingInstance}
                onOpenChange={() => setPayingInstance(null)}
                instance={payingInstance}
                accounts={accounts}
            />
        </>
    );
}