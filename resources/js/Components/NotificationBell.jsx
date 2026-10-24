import { useState } from 'react';
import { usePage, Link, router } from '@inertiajs/react';
import { Bell, AlertCircle, Clock, Check, ChevronRight, SkipForward } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
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

    const isExpense = (item) => item.type !== 'income';

    const renderRow = (item, isOverdue) => (
        <div 
            key={`${isOverdue ? 'overdue' : 'today'}-${item.id}`}
            className="group flex items-center justify-between p-2.5 hover:bg-zinc-800/50 rounded-lg transition-colors"
        >
            <div className="min-w-0 flex-1 pr-2">
                <p className="text-xs font-medium text-zinc-200 truncate group-hover:text-white">
                    {item.title}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5 text-[10px]">
                    <span className={isOverdue ? 'text-rose-400 font-medium' : 'text-amber-400 font-medium'}>
                        {isOverdue ? item.due_date : 'Today'}
                    </span>
                    <span className="text-zinc-600">•</span>
                    <span className="text-zinc-400 font-medium">
                        {formatCurrency(item.amount)}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <button
                    type="button"
                    onClick={() => handleSkip(item)}
                    className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
                    title="Skip"
                >
                    <SkipForward className="h-3.5 w-3.5" />
                </button>
                <Button 
    size="sm" 
    variant="ghost"
    onClick={() => setPayingInstance({ 
        ...item, 
        rule_id: item.id,
        account_id: item.account_id || item.account?.id || '' 
    })}
    className="h-6 text-[11px] px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded font-medium"
>
    Pay
</Button>
            </div>
        </div>
    );

    return (
        <>
            <Popover.Root>
                <Popover.Trigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="relative h-9 w-9 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 rounded-lg transition-colors"
                    >
                        <Bell className="h-4 w-4" />
                        {count > 0 && (
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-4 ring-zinc-900" />
                        )}
                    </Button>
                </Popover.Trigger>

                <Popover.Portal>
                    <Popover.Content 
                        align="end" 
                        sideOffset={8}
                        className="w-80 sm:w-[360px] p-0 z-50 focus:outline-none"
                    >
                        <Card className="border-zinc-800 bg-zinc-900 text-zinc-100 shadow-2xl overflow-hidden rounded-2xl p-1.5 space-y-1.5">
                            {/* Inset Header */}
                            <CardHeader className="flex flex-row items-center justify-between px-3 py-2 space-y-0 rounded-xl bg-zinc-950/60">
                                <CardTitle className="text-xs font-medium text-zinc-300">
                                    Payment Notifications
                                </CardTitle>
                                {count > 0 && (
                                    <span className="text-xs text-zinc-400">
                                        {count} action{count > 1 ? 's' : ''} needed
                                    </span>
                                )}
                            </CardHeader>

                            {/* Inset Body (Invisible Scrollbar Kept) */}
                            <CardContent className="p-1 max-h-[320px] overflow-y-auto space-y-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                                {count === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center px-4">
                                        <Check className="h-5 w-5 text-emerald-400 mb-1.5" />
                                        <p className="text-xs text-zinc-300">All payments settled</p>
                                    </div>
                                ) : (
                                    <>
                                        {overdue.length > 0 && (
                                            <div className="p-1 rounded-xl bg-zinc-950/40 space-y-0.5">
                                                <div className="px-2 py-1 text-[10px] font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" /> Overdue
                                                </div>
                                                <div className="divide-y divide-zinc-800/40">
                                                    {overdue.map((item) => renderRow(item, true))}
                                                </div>
                                            </div>
                                        )}

                                        {due_today.length > 0 && (
                                            <div className="p-1 rounded-xl bg-zinc-950/40 space-y-0.5">
                                                <div className="px-2 py-1 text-[10px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                                    <Clock className="h-3 w-3" /> Due Today
                                                </div>
                                                <div className="divide-y divide-zinc-800/40">
                                                    {due_today.map((item) => renderRow(item, false))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>

                            {/* Inset Footer */}
                            <CardFooter className="p-0 rounded-xl bg-zinc-950/60 overflow-hidden">
                                <Link 
                                    href={route('subscriptions.index')} 
                                    className="w-full text-[11px] text-zinc-400 hover:text-zinc-200 transition-colors font-medium py-2 px-3 flex items-center justify-between"
                                >
                                    <span>All subscriptions & dues</span>
                                    <ChevronRight className="h-3 w-3 text-zinc-500" />
                                </Link>
                            </CardFooter>
                        </Card>
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>

            <PayInstanceDialog
    open={!!payingInstance}
    onOpenChange={() => setPayingInstance(null)}
    instance={payingInstance}
    accounts={accounts}
    isAmountLocked={true}
/>
        </>
    );
}