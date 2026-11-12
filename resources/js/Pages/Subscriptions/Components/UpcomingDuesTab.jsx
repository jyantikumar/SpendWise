import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dueDateLabel } from './dateHelpers';

export function UpcomingDuesTab({ 
    dateFilter, 
    upcomingInstances, 
    paginatedUpcoming, 
    upcomingPage, 
    setUpcomingPage, 
    totalUpcomingPages, 
    itemsPerPage, 
    formatCurrency, 
    setPayingInstance, 
    handleSkipInstance 
}) {
    return (
        <Card className="border-zinc-800">
            <CardHeader className="p-4 sm:p-6 pb-3">
                <CardTitle className="text-sm font-semibold text-zinc-200">
                    Upcoming Dues ({
                        dateFilter === 'current_month' 
                            ? 'This Month' 
                            : dateFilter === '30_days' 
                            ? 'Next 30 Days' 
                            : 'All Scheduled'
                    })
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 sm:pt-0">
                {paginatedUpcoming.length > 0 ? (
                    <>
                        {/* Mobile List */}
                        <div className="block sm:hidden space-y-2.5">
                            {paginatedUpcoming.map((item, idx) => (
                                <div 
                                    key={`${item.rule_id}-${item.due_date}-${idx}`}
                                    className="relative p-3 rounded-lg border border-zinc-800 bg-zinc-900/40"
                                >
                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                                        item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`} />

                                    <div className="pl-2 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="text-xs font-semibold truncate text-zinc-100">{item.title}</p>
                                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.account?.name || 'No account'}</p>
                                            </div>

                                            <span className={`text-sm font-bold shrink-0 ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-[10px]">
                                            <div className="flex items-center gap-1.5 text-zinc-400 flex-wrap">
                                                <span className="font-medium text-zinc-300">Due {dueDateLabel(item.due_date)}</span>
                                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium capitalize">{item.frequency}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <Button size="sm" variant="outline" className="h-6 text-[10px] px-2.5 border-zinc-800 text-zinc-300" onClick={() => setPayingInstance(item)}>
                                                    Pay
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2 text-zinc-400" onClick={() => handleSkipInstance(item)}>
                                                    Skip
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden sm:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                                        <TableHead className="text-zinc-400">Title</TableHead>
                                        <TableHead className="text-zinc-400">Frequency</TableHead>
                                        <TableHead className="text-zinc-400">Due Date</TableHead>
                                        <TableHead className="text-zinc-400">Account</TableHead>
                                        <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                        <TableHead className="text-right text-zinc-400">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedUpcoming.map((item, idx) => (
                                        <TableRow key={`${item.rule_id}-${item.due_date}-${idx}`} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                                            <TableCell className="font-medium text-zinc-200 text-xs">{item.title}</TableCell>
                                            <TableCell className="text-xs text-zinc-400 capitalize">{item.frequency}</TableCell>
                                            <TableCell className="text-xs text-zinc-400">{dueDateLabel(item.due_date)}</TableCell>
                                            <TableCell className="text-xs text-zinc-400">{item.account?.name || '—'}</TableCell>
                                            <TableCell className={`text-right font-semibold text-xs ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => setPayingInstance(item)} className="h-7 px-2.5 text-xs border-zinc-800 text-zinc-300">
                                                    Pay
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleSkipInstance(item)} className="h-7 px-2 text-xs text-zinc-400">
                                                    Skip
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                ) : (
                    <div className="py-8 text-center text-xs text-zinc-500">
                        No upcoming dues scheduled for this timeframe matching your filters.
                    </div>
                )}
            </CardContent>

            {upcomingInstances.length > 0 && (
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-4 sm:px-6 py-4 text-xs text-zinc-400">
                    <div>
                        Showing <span className="font-medium text-zinc-200">{(upcomingPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium text-zinc-200">{Math.min(upcomingPage * itemsPerPage, upcomingInstances.length)}</span> of{' '}
                        <span className="font-medium text-zinc-200">{upcomingInstances.length}</span> records
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <Button variant="outline" size="sm" disabled={upcomingPage === 1} onClick={() => setUpcomingPage((prev) => Math.max(prev - 1, 1))} className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs">
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                        </Button>
                        <span className="text-xs font-medium text-zinc-300 px-1">{upcomingPage} / {totalUpcomingPages}</span>
                        <Button variant="outline" size="sm" disabled={upcomingPage >= totalUpcomingPages} onClick={() => setUpcomingPage((prev) => Math.min(prev + 1, totalUpcomingPages))} className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs">
                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}