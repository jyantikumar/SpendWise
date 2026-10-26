// resources/js/Pages/Accounts/components/AccountTableList.jsx
import { Wallet, MoreHorizontal, Pencil, Trash2, ListFilter, Power } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function AccountTableList({
    filteredAccounts,
    statusFilter,
    openTransactionsModal,
    openEditModal,
    handleToggleActive,
    setDeletingAccount,
    formatCurrency,
    userCurrency = 'PHP'
}) {
    return (
        <>
            {/* Mobile Cards View (Visible on screens smaller than `md`) */}
            <div className="divide-y divide-zinc-800 md:hidden">
                {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((acc) => {
                        return (
                            <div 
                                key={acc.id}
                                className={`p-4 flex items-center justify-between gap-3 active:bg-zinc-800/50 transition-colors ${
                                    !acc.is_active ? 'opacity-60' : ''
                                }`}
                                onClick={() => openTransactionsModal(acc)}
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div 
                                        className="relative flex h-10 w-10 items-center justify-center rounded-lg border shrink-0"
                                        style={{ 
                                            backgroundColor: acc.color ? `${acc.color}20` : '#27272a', 
                                            borderColor: acc.color || '#3f3f46' 
                                        }}
                                    >
                                        <Wallet className="h-5 w-5" style={{ color: acc.color || '#f4f4f5' }} />
                                        <span 
                                            className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 ${
                                                acc.is_active ? 'bg-emerald-500' : 'bg-zinc-600'
                                            }`} 
                                        />
                                    </div>

                                    <div className="truncate">
                                        <div className="font-semibold text-zinc-200 truncate flex items-center gap-1.5">
                                            <span>{acc.name}</span>
                                            {!acc.is_active && (
                                                <span className="text-xs text-zinc-500 font-normal">(Inactive)</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-zinc-400">{userCurrency}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <div className="text-right">
                                        <div className="font-bold text-sm text-zinc-200">
                                            {formatCurrency(acc.balance, userCurrency)}
                                        </div>
                                    </div>

                                    <div onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-300">
                                                <DropdownMenuItem onClick={() => openTransactionsModal(acc)} className="cursor-pointer hover:bg-zinc-800">
                                                    <ListFilter className="mr-2 h-4 w-4 text-zinc-400" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openEditModal(acc)} className="cursor-pointer hover:bg-zinc-800">
                                                    <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleActive(acc)} className="cursor-pointer hover:bg-zinc-800">
                                                    <Power className="mr-2 h-4 w-4 text-zinc-400" />
                                                    {acc.is_active ? 'Deactivate' : 'Activate'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => setDeletingAccount(acc)} 
                                                    className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4 text-rose-400" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8 px-4 text-zinc-400 text-sm">
                        No {statusFilter !== 'all' ? statusFilter : ''} accounts found.
                    </div>
                )}
            </div>

            {/* Desktop Table View (Visible on `md` and larger screens) */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-zinc-800">
                            <TableHead className="text-zinc-400">Account Name</TableHead>
                            <TableHead className="text-right text-zinc-400">Balance</TableHead>
                            <TableHead className="text-right text-zinc-400"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAccounts.length > 0 ? (
                            filteredAccounts.map((acc) => {
                                return (
                                    <TableRow 
                                        key={acc.id} 
                                        className={`cursor-pointer hover:bg-muted/50 border-b border-zinc-800 transition-colors ${
                                            !acc.is_active ? 'opacity-60' : ''
                                        }`} 
                                        onClick={() => openTransactionsModal(acc)}
                                    >
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="relative flex h-8 w-8 items-center justify-center rounded-lg border shrink-0 transition-colors"
                                                    style={{ 
                                                        backgroundColor: acc.color ? `${acc.color}20` : '#27272a', 
                                                        borderColor: acc.color || '#3f3f46' 
                                                    }}
                                                >
                                                    <Wallet className="h-4 w-4" style={{ color: acc.color || '#f4f4f5' }} />
                                                    <span 
                                                        className={`absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-zinc-950 ${
                                                            acc.is_active ? 'bg-emerald-500' : 'bg-zinc-600'
                                                        }`} 
                                                        title={acc.is_active ? 'Active' : 'Inactive'}
                                                    />
                                                </div>

                                                <div>
                                                    <div className="font-semibold text-zinc-200 flex items-center gap-2">
                                                        {acc.name}
                                                        {!acc.is_active && (
                                                            <span className="text-xs font-normal text-zinc-500">(Inactive)</span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-zinc-400">{userCurrency}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-bold text-base text-zinc-200">
                                            {formatCurrency(acc.balance, userCurrency)}
                                        </TableCell>
                                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="border-zinc-800 bg-background text-zinc-300">
                                                    <DropdownMenuItem onClick={() => openTransactionsModal(acc)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                        <ListFilter className="mr-2 h-4 w-4 text-zinc-400" /> View
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEditModal(acc)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                        <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleToggleActive(acc)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                        <Power className="mr-2 h-4 w-4 text-zinc-400" />
                                                        {acc.is_active ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        onClick={() => setDeletingAccount(acc)} 
                                                        className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4 text-rose-400" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        ) : (
                            <TableRow className="border-b border-zinc-800">
                                <TableCell colSpan={3} className="text-center py-8 text-zinc-400">
                                    No {statusFilter !== 'all' ? statusFilter : ''} accounts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}