// resources/js/Pages/Subscriptions/Components/MissedPaymentsTab.jsx
import { useState, useMemo } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, SkipForward, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dueDateLabel } from './dateHelpers';

export function MissedPaymentsTab({ 
    overdueInstances = [], 
    missedPage, 
    setMissedPage, 
    itemsPerPage, 
    formatCurrency, 
    setPayingInstance, 
    handleSkipInstance 
}) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter missed items by title or account name
    const searchedInstances = useMemo(() => {
        if (!searchQuery.trim()) return overdueInstances;
        const query = searchQuery.toLowerCase().trim();
        return overdueInstances.filter((item) => {
            const titleMatch = item.title?.toLowerCase().includes(query);
            const accountMatch = item.account?.name?.toLowerCase().includes(query);
            return titleMatch || accountMatch;
        });
    }, [overdueInstances, searchQuery]);

    // Calculate total pages and current page slice dynamically
    const totalPages = Math.ceil(searchedInstances.length / itemsPerPage) || 1;
    const paginatedMissed = useMemo(() => {
        return searchedInstances.slice(
            (missedPage - 1) * itemsPerPage,
            missedPage * itemsPerPage
        );
    }, [searchedInstances, missedPage, itemsPerPage]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setMissedPage(1);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setMissedPage(1);
    };

    return (
        <Card className="border-zinc-800 w-full">
            <CardHeader className="p-4 sm:p-6 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <CardTitle className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" /> Missed & Overdue Payments
                        </CardTitle>
                        <CardDescription className="text-xs text-zinc-400 mt-0.5">
                            Scheduled payments that passed their due date without being logged in transactions.
                        </CardDescription>
                    </div>

                    {/* Search Bar Input */}
                    <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Search missed payments..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="h-8 pl-8 pr-8 text-xs border-zinc-800 bg-zinc-900 text-zinc-200 focus-visible:ring-zinc-700"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
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
                                            </div>
                                            <p className="text-[11px] text-zinc-400">
                                                {item.account?.name || 'No account'}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-rose-500 shrink-0">
                                            -{formatCurrency(item.amount)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-[10px]">
                                        <div className="flex items-center gap-1.5 text-zinc-400 flex-wrap">
                                            <span className="font-medium text-rose-400">{dueDateLabel(item.due_date)}</span>
                                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium capitalize">{item.frequency}</span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => handleSkipInstance(item)}
                                                className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
                                                title="Skip"
                                            >
                                                <SkipForward className="h-3.5 w-3.5" />
                                            </button>
                                            <Button 
                                                size="sm" 
                                                variant="ghost"
                                                onClick={() => setPayingInstance(item)}
                                                className="h-6 text-[11px] px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded font-medium"
                                            >
                                                Pay
                                            </Button>
                                        </div>
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
                                        <TableHead className="text-zinc-400">Frequency</TableHead>
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
                                            <TableCell className="text-xs text-zinc-400 capitalize">{item.frequency}</TableCell>
                                            <TableCell className="text-xs text-rose-400 font-medium">{dueDateLabel(item.due_date)}</TableCell>
                                            <TableCell className="text-xs text-zinc-400">{item.account?.name || '—'}</TableCell>
                                            <TableCell className="text-right font-semibold text-xs text-rose-500">
                                                -{formatCurrency(item.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSkipInstance(item)}
                                                        className="p-1 text-zinc-500 hover:text-zinc-300 rounded transition-colors"
                                                        title="Skip"
                                                    >
                                                        <SkipForward className="h-3.5 w-3.5" />
                                                    </button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="ghost"
                                                        onClick={() => setPayingInstance(item)}
                                                        className="h-6 text-[11px] px-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded font-medium"
                                                    >
                                                        Pay
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </>
                ) : (
                    <div className="py-8 text-center text-xs text-zinc-500">
                        {searchQuery ? `No missed payments matching "${searchQuery}".` : 'No missed or overdue payments found.'}
                    </div>
                )}
            </CardContent>

            {searchedInstances.length > 0 && (
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-4 sm:px-6 py-4 text-xs text-zinc-400">
                    <div>
                        Showing <span className="font-medium text-zinc-200">{(missedPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium text-zinc-200">{Math.min(missedPage * itemsPerPage, searchedInstances.length)}</span> of{' '}
                        <span className="font-medium text-zinc-200">{searchedInstances.length}</span> records
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <Button variant="outline" size="sm" disabled={missedPage === 1} onClick={() => setMissedPage((prev) => Math.max(prev - 1, 1))} className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs">
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                        </Button>
                        <span className="text-xs font-medium text-zinc-300 px-1">{missedPage} / {totalPages}</span>
                        <Button variant="outline" size="sm" disabled={missedPage >= totalPages} onClick={() => setMissedPage((prev) => Math.min(prev + 1, totalPages))} className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs">
                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}