// resources/js/Pages/Subscriptions/Components/UpcomingDuesTab.jsx
import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, SkipForward, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { dueDateLabel } from './dateHelpers';

export function UpcomingDuesTab({ 
    dateFilter, 
    upcomingInstances = [], 
    upcomingPage, 
    setUpcomingPage, 
    itemsPerPage, 
    formatCurrency, 
    setPayingInstance, 
    handleSkipInstance 
}) {
    const [searchQuery, setSearchQuery] = useState('');

    // Filter upcoming items by title or account name
    const searchedInstances = useMemo(() => {
        if (!searchQuery.trim()) return upcomingInstances;
        const query = searchQuery.toLowerCase().trim();
        return upcomingInstances.filter((item) => {
            const titleMatch = item.title?.toLowerCase().includes(query);
            const accountMatch = item.account?.name?.toLowerCase().includes(query);
            return titleMatch || accountMatch;
        });
    }, [upcomingInstances, searchQuery]);

    // Calculate total pages and current page slice dynamically
    const totalPages = Math.ceil(searchedInstances.length / itemsPerPage) || 1;
    const paginatedUpcoming = useMemo(() => {
        return searchedInstances.slice(
            (upcomingPage - 1) * itemsPerPage,
            upcomingPage * itemsPerPage
        );
    }, [searchedInstances, upcomingPage, itemsPerPage]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setUpcomingPage(1);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setUpcomingPage(1);
    };

    return (
        <Card className="border-zinc-800">
            <CardHeader className="p-4 sm:p-6 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="text-sm font-semibold text-zinc-200">
                        Upcoming Dues ({
                            dateFilter === 'current_month' 
                                ? 'This Month' 
                                : dateFilter === '30_days' 
                                ? 'Next 30 Days' 
                                : 'All Scheduled'
                        })
                    </CardTitle>

                    {/* Search Bar Input */}
                    <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Search upcoming dues..."
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
                        {searchQuery ? `No upcoming dues matching "${searchQuery}".` : 'No upcoming dues scheduled for this timeframe matching your filters.'}
                    </div>
                )}
            </CardContent>

            {searchedInstances.length > 0 && (
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-4 sm:px-6 py-4 text-xs text-zinc-400">
                    <div>
                        Showing <span className="font-medium text-zinc-200">{(upcomingPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium text-zinc-200">{Math.min(upcomingPage * itemsPerPage, searchedInstances.length)}</span> of{' '}
                        <span className="font-medium text-zinc-200">{searchedInstances.length}</span> records
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <Button variant="outline" size="sm" disabled={upcomingPage === 1} onClick={() => setUpcomingPage((prev) => Math.max(prev - 1, 1))} className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs">
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                        </Button>
                        <span className="text-xs font-medium text-zinc-300 px-1">{upcomingPage} / {totalPages}</span>
                        <Button variant="outline" size="sm" disabled={upcomingPage >= totalPages} onClick={() => setUpcomingPage((prev) => Math.min(prev + 1, totalPages))} className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs">
                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}