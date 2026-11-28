// resources/js/Pages/Accounts/components/AccountTableList.jsx
import { Wallet, MoreHorizontal, Pencil, Trash2, ListFilter, Power, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AccountTableList({
    filteredAccounts,
    statusFilter,
    openTransactionsModal,
    openEditModal,
    openReconcileModal, // 👈 New Prop
    handleToggleActive,
    setDeletingAccount,
    formatCurrency,
    userCurrency = 'PHP',
}) {
    return (
        <>
            {/* Mobile Cards View */}
            <div className="divide-y divide-zinc-800 md:hidden">
                {filteredAccounts.length > 0 ? (
                    filteredAccounts.map((acc) => (
                        <div
                            key={acc.id}
                            className={`p-4 flex items-center justify-between gap-3 active:bg-zinc-800/40 transition-colors cursor-pointer ${
                                !acc.is_active ? 'opacity-50' : ''
                            }`}
                            onClick={() => openTransactionsModal(acc)}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 shrink-0">
                                    <Wallet className="h-4 w-4 text-zinc-400" />
                                    <span
                                        className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full border-2 border-zinc-950"
                                        style={{ backgroundColor: acc.color || '#71717a' }}
                                    />
                                </div>

                                <div className="truncate">
                                    <div className="font-medium text-zinc-200 truncate text-sm flex items-center gap-1.5">
                                        {acc.name}
                                        {!acc.is_active && (
                                            <span className="text-[11px] text-zinc-500 font-normal">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-zinc-500">
                                        {acc.type || userCurrency}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <div className="text-right font-semibold text-sm text-zinc-100 tabular-nums">
                                    {formatCurrency(acc.balance, userCurrency)}
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
                                        <DropdownMenuContent
                                            align="end"
                                            className="border-zinc-800 bg-zinc-950 text-zinc-300 text-xs"
                                        >
                                            <DropdownMenuItem
                                                onClick={() => openTransactionsModal(acc)}
                                                className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                            >
                                                <ListFilter className="mr-2 h-3.5 w-3.5 text-zinc-400" /> View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => openReconcileModal(acc)}
                                                className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                            >
                                                <Scale className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Reconcile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => openEditModal(acc)}
                                                className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                            >
                                                <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleToggleActive(acc)}
                                                className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                            >
                                                <Power className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                                                {acc.is_active ? 'Deactivate' : 'Activate'}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => setDeletingAccount(acc)}
                                                className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer"
                                            >
                                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 px-4 text-zinc-500 text-sm">
                        No {statusFilter !== 'all' ? statusFilter : ''} accounts found.
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-zinc-800 hover:bg-transparent">
                            <TableHead className="text-zinc-400 text-xs">Account</TableHead>
                            <TableHead className="text-right text-zinc-400 text-xs">Balance</TableHead>
                            <TableHead className="text-right text-zinc-400 text-xs w-[60px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredAccounts.length > 0 ? (
                            filteredAccounts.map((acc) => (
                                <TableRow
                                    key={acc.id}
                                    className={`cursor-pointer hover:bg-zinc-900/40 border-b border-zinc-800 transition-colors ${
                                        !acc.is_active ? 'opacity-50' : ''
                                    }`}
                                    onClick={() => openTransactionsModal(acc)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 shrink-0">
                                                <Wallet className="h-4 w-4 text-zinc-400" />
                                                <span
                                                    className="absolute -top-1 -right-1 h-2 w-2 rounded-full border-2 border-zinc-950"
                                                    style={{ backgroundColor: acc.color || '#71717a' }}
                                                    title={acc.is_active ? 'Active' : 'Inactive'}
                                                />
                                            </div>

                                            <div>
                                                <div className="font-medium text-zinc-200 flex items-center gap-2 text-sm">
                                                    {acc.name}
                                                    {!acc.is_active && (
                                                        <span className="text-[11px] font-normal text-zinc-500">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-zinc-500">
                                                    {acc.type || userCurrency}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-sm text-zinc-100 tabular-nums">
                                        {formatCurrency(acc.balance, userCurrency)}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 p-0 text-zinc-400 hover:text-zinc-200"
                                                >
                                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="end"
                                                className="border-zinc-800 bg-zinc-950 text-zinc-300 text-xs"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => openTransactionsModal(acc)}
                                                    className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                                >
                                                    <ListFilter className="mr-2 h-3.5 w-3.5 text-zinc-400" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => openReconcileModal(acc)}
                                                    className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                                >
                                                    <Scale className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Reconcile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => openEditModal(acc)}
                                                    className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                                >
                                                    <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleActive(acc)}
                                                    className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                                >
                                                    <Power className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                                                    {acc.is_active ? 'Deactivate' : 'Activate'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => setDeletingAccount(acc)}
                                                    className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="border-b border-zinc-800">
                                <TableCell colSpan={3} className="text-center py-8 text-zinc-500 text-sm">
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