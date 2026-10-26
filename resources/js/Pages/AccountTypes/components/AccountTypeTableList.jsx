import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function AccountTypeTableList({
    accountTypes,
    setViewingType,
    openEditModal,
    setDeletingType,
    formatCurrency,
}) {
    return (
        <>
            {/* Mobile Cards View */}
            <div className="divide-y divide-zinc-800 md:hidden">
                {accountTypes && accountTypes.length > 0 ? (
                    accountTypes.map((type) => (
                        <div 
                            key={type.id} 
                            onClick={() => setViewingType(type)}
                            className="p-4 flex items-center justify-between gap-3 active:bg-zinc-800/50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div 
                                    className="h-3.5 w-3.5 rounded-full shrink-0" 
                                    style={{ backgroundColor: type.color || '#3b82f6' }}
                                />
                                <div className="min-w-0">
                                    <span className="font-medium text-zinc-200 text-sm truncate block">
                                        {type.name}
                                    </span>
                                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                                        {type.accounts_count || 0} {type.accounts_count === 1 ? 'account' : 'accounts'} • {formatCurrency(type.total_balance)}
                                    </span>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 outline-none transition-colors shrink-0"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-300">
                                    <DropdownMenuItem onClick={() => setViewingType(type)} className="cursor-pointer hover:bg-zinc-800">
                                        <Eye className="mr-2 h-4 w-4 text-zinc-400" /> View Accounts
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => openEditModal(type)} className="cursor-pointer hover:bg-zinc-800">
                                        <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        onClick={() => setDeletingType(type)} 
                                        className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4 text-rose-400" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 px-4 text-zinc-400 text-sm">
                        No account types created yet.
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-zinc-800">
                            <TableHead className="text-zinc-400">Type Name</TableHead>
                            <TableHead className="text-zinc-400">Linked Accounts</TableHead>
                            <TableHead className="text-right text-zinc-400">Total Balance</TableHead>
                            <TableHead className="text-right text-zinc-400"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {accountTypes && accountTypes.length > 0 ? (
                            accountTypes.map((type) => (
                                <TableRow 
                                    key={type.id} 
                                    onClick={() => setViewingType(type)}
                                    className="border-b border-zinc-800 transition-colors hover:bg-muted/50 cursor-pointer"
                                >
                                    <TableCell className="font-medium text-zinc-300">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="h-3.5 w-3.5 rounded-full shrink-0" 
                                                style={{ backgroundColor: type.color || '#3b82f6' }}
                                            />
                                            <span>{type.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-zinc-400 text-xs">
                                        <Badge variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-300 font-normal">
                                            {type.accounts_count || 0} {type.accounts_count === 1 ? 'account' : 'accounts'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-zinc-200 text-xs">
                                        {formatCurrency(type.total_balance)}
                                    </TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 outline-none transition-colors"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="border-zinc-800 bg-background text-zinc-300">
                                                <DropdownMenuItem onClick={() => setViewingType(type)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                    <Eye className="mr-2 h-4 w-4 text-zinc-400" /> View Accounts
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openEditModal(type)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                    <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => setDeletingType(type)} 
                                                    className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4 text-rose-400" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow className="border-b border-zinc-800">
                                <TableCell colSpan={4} className="text-center py-8 text-zinc-400">
                                    No account types created yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}