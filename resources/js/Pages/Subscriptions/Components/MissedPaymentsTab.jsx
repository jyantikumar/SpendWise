import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function MissedPaymentsTab({ 
    overdueInstances, 
    paginatedMissed, 
    missedPage, 
    setMissedPage, 
    totalMissedPages, 
    itemsPerPage, 
    formatCurrency, 
    setPayingInstance, 
    handleSkipInstance 
}) {
    return (
        <Card className="border-zinc-800 w-full">
            <CardHeader className="p-4 sm:p-6 pb-3">
                <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" /> Missed & Overdue Payments
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                    Scheduled payments that passed their due date without being logged in transactions.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 sm:pt-0">
                {paginatedMissed.length > 0 ? (
                    <>
                        {/* Mobile View */}
                        <div className="block sm:hidden space-y-2.5">
                            {paginatedMissed.map((item, idx) => (
                                <div 
                                    key={`${item.rule_id}-${item.due_date}-${idx}`}
                                    className="relative p-3 rounded-lg border border-rose-950/60 bg-zinc-900/40 space-y-2"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-semibold text-zinc-200">{item.title}</span>
                                                <Badge variant="outline" className="text-[10px] border-rose-900/80 bg-rose-950/20 text-rose-400">
                                                    Due {item.due_date}
                                                </Badge>
                                            </div>
                                            <p className="text-[11px] text-zinc-400">
                                                {item.account?.name || 'No account'} • <span className="capitalize">{item.frequency}</span>
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-rose-500 shrink-0">
                                            -{formatCurrency(item.amount)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-zinc-800">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-6 text-[10px] px-2.5 border-rose-900/50 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"
                                            onClick={() => setPayingInstance(item)}
                                        >
                                            Pay
                                        </Button>
                                        <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="h-6 text-[10px] px-2 text-zinc-400 hover:text-zinc-200"
                                            onClick={() => handleSkipInstance(item)}
                                        >
                                            Skip
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop View */}
                        <div className="hidden sm:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                                        <TableHead className="text-zinc-400">Title</TableHead>
                                        <TableHead className="text-zinc-400">Due Date</TableHead>
                                        <TableHead className="text-zinc-400">Account</TableHead>
                                        <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                        <TableHead className="text-right text-zinc-400">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedMissed.map((item, idx) => (
                                        <TableRow key={`${item.rule_id}-${item.due_date}-${idx}`} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                                            <TableCell className="font-medium text-zinc-200 text-xs">{item.title}</TableCell>
                                            <TableCell className="text-xs text-rose-400 font-medium">{item.due_date}</TableCell>
                                            <TableCell className="text-xs text-zinc-400">{item.account?.name || '—'}</TableCell>
                                            <TableCell className="text-right font-semibold text-xs text-rose-500">
                                                -{formatCurrency(item.amount)}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline" 
                                                    onClick={() => setPayingInstance(item)} 
                                                    className="h-7 px-2.5 text-xs border-rose-900/50 text-rose-400 hover:bg-rose-950/30 hover:text-rose-300"
                                                >
                                                    Pay
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={() => handleSkipInstance(item)} 
                                                    className="h-7 px-2 text-xs text-zinc-400 hover:text-zinc-200"
                                                >
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
                        No missed or overdue payments found.
                    </div>
                )}
            </CardContent>

            {overdueInstances.length > 0 && (
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-4 sm:px-6 py-4 text-xs text-zinc-400">
                    <div>
                        Showing <span className="font-medium text-zinc-200">{(missedPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium text-zinc-200">{Math.min(missedPage * itemsPerPage, overdueInstances.length)}</span> of{' '}
                        <span className="font-medium text-zinc-200">{overdueInstances.length}</span> records
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <Button variant="outline" size="sm" disabled={missedPage === 1} onClick={() => setMissedPage((prev) => Math.max(prev - 1, 1))} className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs">
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                        </Button>
                        <span className="text-xs font-medium text-zinc-300 px-1">{missedPage} / {totalMissedPages}</span>
                        <Button variant="outline" size="sm" disabled={missedPage >= totalMissedPages} onClick={() => setMissedPage((prev) => Math.min(prev + 1, totalMissedPages))} className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs">
                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}