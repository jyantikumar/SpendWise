// resources/js/Pages/Subscriptions/Components/MasterRulesTab.jsx
import { useState, useMemo } from 'react';
import { 
    MoreHorizontal, 
    Pencil, 
    Power, 
    Trash2, 
    ChevronLeft, 
    ChevronRight, 
    Search, 
    X 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { dueDateLabel } from './dateHelpers';

const WEEKDAY_SHORT   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_COMPACT = ['Su',  'M',   'Tu',  'W',   'Th',  'F',   'Sa'];

function formatWeekdayList(weekdays, compact = false) {
    if (!Array.isArray(weekdays) || weekdays.length === 0) return null;
    const sorted = [...weekdays].map(Number).sort((a, b) => a - b);
    const labels = compact ? WEEKDAY_COMPACT : WEEKDAY_SHORT;
    return sorted.map((d) => labels[d]).join(compact ? ' ' : ', ');
}

export function MasterRulesTab({ 
    filteredRules = [], 
    rulesPage, 
    setRulesPage, 
    itemsPerPage, 
    formatCurrency, 
    setEditingItem, 
    setIsCreateOpen, 
    handleToggleActive, 
    setDeletingItem,
    filterStatus,
    setFilterStatus
}) {
    const [searchQuery, setSearchQuery] = useState('');

    // Apply internal search filter on top of the status/type filtered list
    const searchedRules = useMemo(() => {
        if (!searchQuery.trim()) return filteredRules;
        const query = searchQuery.toLowerCase().trim();
        return filteredRules.filter((item) => {
            const titleMatch = item.title?.toLowerCase().includes(query);
            const accountMatch = item.account?.name?.toLowerCase().includes(query);
            return titleMatch || accountMatch;
        });
    }, [filteredRules, searchQuery]);

    // Recalculate pagination against searched results
    const totalRulesPages = Math.ceil(searchedRules.length / itemsPerPage) || 1;
    const paginatedRules = useMemo(() => {
        return searchedRules.slice(
            (rulesPage - 1) * itemsPerPage,
            rulesPage * itemsPerPage
        );
    }, [searchedRules, rulesPage, itemsPerPage]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setRulesPage(1);
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setRulesPage(1);
    };

    return (
        <Card className="border-zinc-800">
            <CardHeader className="p-4 sm:p-6 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Title & Status Filter Badges */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <CardTitle className="text-sm sm:text-base text-zinc-200">Scheduled Rules</CardTitle>

                        <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded-lg border border-zinc-800 text-xs">
                            {[
                                { id: 'all',     label: 'All' },
                                { id: 'active',  label: 'Active' },
                                { id: 'paused',  label: 'Paused' },
                                { id: 'expired', label: 'Expired' },
                            ].map((statusOption) => (
                                <button
                                    key={statusOption.id}
                                    type="button"
                                    onClick={() => {
                                        setFilterStatus(statusOption.id);
                                        setRulesPage(1);
                                    }}
                                    className={`py-1 px-2.5 rounded-md text-[11px] font-medium transition-all ${
                                        filterStatus === statusOption.id 
                                            ? 'bg-zinc-800 text-zinc-100 shadow-sm' 
                                            : 'text-zinc-400 hover:text-zinc-200'
                                    }`}
                                >
                                    {statusOption.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Search Bar Input */}
                    <div className="relative w-full sm:w-64 shrink-0">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder="Search rules or accounts..."
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
                {/* Mobile View */}
                <div className="block sm:hidden space-y-2.5">
                    {paginatedRules.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 text-xs">
                            {searchQuery ? `No rules matching "${searchQuery}"` : 'No recurring rules found matching your filters.'}
                        </div>
                    ) : (
                        paginatedRules.map((item) => {
                            const weekdayList = item.frequency === 'weekly'
                                ? formatWeekdayList(item.weekdays, true)
                                : null;
                            const isExpired = Boolean(item.is_expired);
                            const isDimmed = !item.is_active || isExpired;

                            return (
                                <div 
                                    key={item.id} 
                                    className={`relative p-3 rounded-lg border bg-zinc-900/40 transition-all ${
                                        isDimmed ? 'border-zinc-800/60 opacity-50' : 'border-zinc-800 hover:border-zinc-700'
                                    }`}
                                >
                                    <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                                        isExpired
                                            ? 'bg-zinc-600'
                                            : item.is_active
                                                ? (item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500')
                                                : 'bg-zinc-600'
                                    }`} />

                                    <div className="pl-2 space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <p className={`text-xs font-semibold truncate ${
                                                        isExpired ? 'line-through text-zinc-500' : !item.is_active ? 'line-through text-zinc-400' : 'text-zinc-100'
                                                    }`}>
                                                        {item.title}
                                                    </p>
                                                    {isExpired && (
                                                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] font-medium border border-zinc-700/80">
                                                            Expired
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.account?.name || 'No account'}</p>
                                            </div>

                                            <span className={`text-sm font-bold shrink-0 ${
                                                isDimmed ? 'text-zinc-500' : item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                                            }`}>
                                                {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-[10px]">
                                            <div className="flex items-center gap-1.5 text-zinc-400 flex-wrap">
                                                <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium capitalize">
                                                    {item.frequency}
                                                </span>
                                                {weekdayList && (
                                                    <span className="px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-300 font-medium tracking-wide">
                                                        {weekdayList}
                                                    </span>
                                                )}
                                                <span>Next: {dueDateLabel(item.next_due_date)}</span>
                                            </div>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-zinc-400">
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                                    <DropdownMenuItem onClick={() => { setEditingItem(item); setIsCreateOpen(true); }} className="text-xs">
                                                        <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit
                                                    </DropdownMenuItem>
                                                    {!isExpired && (
                                                        <DropdownMenuItem onClick={() => handleToggleActive(item)} className="text-xs">
                                                            <Power className="mr-2 h-3.5 w-3.5 text-zinc-400" /> {item.is_active ? 'Pause' : 'Activate'}
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                    <DropdownMenuItem onClick={() => setDeletingItem(item)} className="text-xs text-rose-400">
                                                        <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Desktop View */}
                <div className="hidden sm:block">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                                <TableHead className="text-zinc-400">Title</TableHead>
                                <TableHead className="text-zinc-400">Frequency</TableHead>
                                <TableHead className="text-zinc-400">Account</TableHead>
                                <TableHead className="text-zinc-400">Next Due</TableHead>
                                <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                <TableHead className="text-right text-zinc-400">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRules.length > 0 ? (
                                paginatedRules.map((item) => {
                                    const weekdayList = item.frequency === 'weekly'
                                        ? formatWeekdayList(item.weekdays, false)
                                        : null;
                                    const isExpired = Boolean(item.is_expired);
                                    const isDimmed = !item.is_active || isExpired;

                                    return (
                                        <TableRow key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                                            <TableCell className="font-medium text-zinc-200 text-xs">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className={isExpired ? 'line-through text-zinc-500' : !item.is_active ? 'line-through text-zinc-400' : ''}>
                                                        {item.title}
                                                    </span>
                                                    {isExpired && (
                                                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] font-medium border border-zinc-700/80">
                                                            Expired
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-zinc-400">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span className="capitalize">{item.frequency}</span>
                                                    {weekdayList && (
                                                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-medium">
                                                            {weekdayList}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-zinc-400">{item.account?.name || '—'}</TableCell>
                                            <TableCell className="text-xs text-zinc-400">{dueDateLabel(item.next_due_date)}</TableCell>
                                            <TableCell className={`text-right font-semibold text-xs ${
                                                isDimmed ? 'text-zinc-500' : item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                                            }`}>
                                                {formatCurrency(item.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400">
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                                        <DropdownMenuItem onClick={() => { setEditingItem(item); setIsCreateOpen(true); }} className="text-xs">
                                                            <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit
                                                        </DropdownMenuItem>
                                                        {!isExpired && (
                                                            <DropdownMenuItem onClick={() => handleToggleActive(item)} className="text-xs">
                                                                <Power className="mr-2 h-3.5 w-3.5 text-zinc-400" /> {item.is_active ? 'Pause' : 'Activate'}
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator className="bg-zinc-800" />
                                                        <DropdownMenuItem onClick={() => setDeletingItem(item)} className="text-xs text-rose-400">
                                                            <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-xs text-zinc-500">
                                        {searchQuery ? `No rules matching "${searchQuery}"` : 'No recurring rules found matching your filters.'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {searchedRules.length > 0 && (
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-4 sm:px-6 py-4 text-xs text-zinc-400">
                    <div>
                        Showing <span className="font-medium text-zinc-200">{(rulesPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium text-zinc-200">{Math.min(rulesPage * itemsPerPage, searchedRules.length)}</span> of{' '}
                        <span className="font-medium text-zinc-200">{searchedRules.length}</span> records
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <Button variant="outline" size="sm" disabled={rulesPage === 1} onClick={() => setRulesPage((prev) => Math.max(prev - 1, 1))} className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs">
                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                        </Button>
                        <span className="text-xs font-medium text-zinc-300 px-1">{rulesPage} / {totalRulesPages}</span>
                        <Button variant="outline" size="sm" disabled={rulesPage >= totalRulesPages} onClick={() => setRulesPage((prev) => Math.min(prev + 1, totalRulesPages))} className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs">
                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                    </div>
                </CardFooter>
            )}
        </Card>
    );
}