import { MoreHorizontal, Pencil, Power, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MasterRulesTab({ 
    filteredRules, 
    paginatedRules, 
    rulesPage, 
    setRulesPage, 
    totalRulesPages, 
    itemsPerPage, 
    formatCurrency, 
    setEditingItem, 
    setIsCreateOpen, 
    handleToggleActive, 
    setDeletingItem 
}) {
    return (
        <Card className="border-zinc-800">
            <CardHeader className="p-4 sm:p-6 pb-3">
                <CardTitle className="text-sm sm:text-base text-zinc-200">Scheduled Rules</CardTitle>
                <CardDescription className="text-xs text-zinc-400">
                    Overview of repeat processing schedules across accounts.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 sm:pt-0">
                {/* Mobile View */}
                <div className="block sm:hidden space-y-2.5">
                    {paginatedRules.length === 0 ? (
                        <div className="text-center py-8 text-zinc-500 text-xs">
                            No recurring rules found matching your filters.
                        </div>
                    ) : (
                        paginatedRules.map((item) => (
                            <div 
                                key={item.id} 
                                className={`relative p-3 rounded-lg border bg-zinc-900/40 transition-all ${
                                    !item.is_active ? 'border-zinc-800/60 opacity-50' : 'border-zinc-800 hover:border-zinc-700'
                                }`}
                            >
                                <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full ${
                                    item.is_active ? (item.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500') : 'bg-zinc-600'
                                }`} />

                                <div className="pl-2 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-xs font-semibold truncate ${!item.is_active ? 'line-through text-zinc-400' : 'text-zinc-100'}`}>
                                                {item.title}
                                            </p>
                                            <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.account?.name || 'No account'}</p>
                                        </div>

                                        <span className={`text-sm font-bold shrink-0 ${
                                            !item.is_active ? 'text-zinc-500' : item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                                        }`}>
                                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60 text-[10px]">
                                        <div className="flex items-center gap-1.5 text-zinc-400 flex-wrap">
                                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium capitalize">{item.frequency}</span>
                                            <span>Next: {item.next_due_date ? String(item.next_due_date).split('T')[0] : '—'}</span>
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
                                                <DropdownMenuItem onClick={() => handleToggleActive(item)} className="text-xs">
                                                    <Power className="mr-2 h-3.5 w-3.5 text-zinc-400" /> {item.is_active ? 'Pause' : 'Activate'}
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-zinc-800" />
                                                <DropdownMenuItem onClick={() => setDeletingItem(item)} className="text-xs text-rose-400">
                                                    <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        ))
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
                                paginatedRules.map((item) => (
                                    <TableRow key={item.id} className="border-b border-zinc-800 hover:bg-zinc-800/40">
                                        <TableCell className="font-medium text-zinc-200 text-xs">{item.title}</TableCell>
                                        <TableCell className="text-xs text-zinc-400 capitalize">{item.frequency}</TableCell>
                                        <TableCell className="text-xs text-zinc-400">{item.account?.name || '—'}</TableCell>
                                        <TableCell className="text-xs text-zinc-400">{item.next_due_date ? String(item.next_due_date).split('T')[0] : '—'}</TableCell>
                                        <TableCell className={`text-right font-semibold text-xs ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
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
                                                    <DropdownMenuItem onClick={() => handleToggleActive(item)} className="text-xs">
                                                        <Power className="mr-2 h-3.5 w-3.5 text-zinc-400" /> {item.is_active ? 'Pause' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                    <DropdownMenuItem onClick={() => setDeletingItem(item)} className="text-xs text-rose-400">
                                                        <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-8 text-center text-xs text-zinc-500">
                                        No recurring rules found matching your filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            {filteredRules.length > 0 && (
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-4 sm:px-6 py-4 text-xs text-zinc-400">
                    <div>
                        Showing <span className="font-medium text-zinc-200">{(rulesPage - 1) * itemsPerPage + 1}</span> to{' '}
                        <span className="font-medium text-zinc-200">{Math.min(rulesPage * itemsPerPage, filteredRules.length)}</span> of{' '}
                        <span className="font-medium text-zinc-200">{filteredRules.length}</span> records
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