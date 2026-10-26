import { 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    ArrowLeftRight,
    ListFilter,
    Power
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export function CategoryTableList({
    filteredCategories,
    openTransactionsModal,
    openEditModal,
    handleToggleActive,
    setDeletingCategory,
}) {
    const renderTypeBadge = (type) => {
        switch (type) {
            case 'income':
                return (
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 gap-1">
                        <ArrowUpCircle className="h-3 w-3" /> Income
                    </Badge>
                );
            case 'expense':
                return (
                    <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-400 gap-1">
                        <ArrowDownCircle className="h-3 w-3" /> Expense
                    </Badge>
                );
            case 'transfer':
                return (
                    <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400 gap-1">
                        <ArrowLeftRight className="h-3 w-3" /> Transfer
                    </Badge>
                );
            default:
                return <Badge variant="outline" className="border-zinc-800 text-zinc-300">{type}</Badge>;
        }
    };

    return (
        <>
            {/* Mobile Cards View */}
            <div className="divide-y divide-zinc-800 md:hidden">
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                        <div 
                            key={cat.id}
                            className={`p-4 flex items-center justify-between gap-3 active:bg-zinc-800/50 transition-colors cursor-pointer ${
                                !cat.is_active ? 'opacity-60' : ''
                            }`}
                            onClick={() => openTransactionsModal(cat)}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div 
                                    className="h-3.5 w-3.5 rounded-full shrink-0" 
                                    style={{ backgroundColor: cat.color || '#3b82f6' }}
                                />
                                <div className="truncate">
                                    <div className="font-medium text-zinc-200 text-sm truncate flex items-center gap-1.5">
                                        <span>{cat.name}</span>
                                        {!cat.is_active && (
                                            <span className="text-xs text-zinc-500 font-normal">(Inactive)</span>
                                        )}
                                    </div>
                                    <div className="mt-1">
                                        {renderTypeBadge(cat.type)}
                                    </div>
                                </div>
                            </div>

                            <div onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button 
                                            type="button"
                                            className="h-8 w-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 outline-none transition-colors"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-300">
                                        <DropdownMenuItem onClick={() => openTransactionsModal(cat)} className="cursor-pointer hover:bg-zinc-800">
                                            <ListFilter className="mr-2 h-4 w-4 text-zinc-400" /> View
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => openEditModal(cat)} className="cursor-pointer hover:bg-zinc-800">
                                            <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleToggleActive(cat)} className="cursor-pointer hover:bg-zinc-800">
                                            <Power className="mr-2 h-4 w-4 text-zinc-400" />
                                            {cat.is_active ? 'Deactivate' : 'Activate'}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => setDeletingCategory(cat)} 
                                            className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4 text-rose-400" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 px-4 text-zinc-400 text-sm">
                        No categories match your criteria.
                    </div>
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b border-zinc-800">
                            <TableHead className="text-zinc-400">Category Name</TableHead>
                            <TableHead className="text-zinc-400">Type</TableHead>
                            <TableHead className="text-right text-zinc-400"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCategories.length > 0 ? (
                            filteredCategories.map((cat) => (
                                <TableRow 
                                    key={cat.id}
                                    className={`cursor-pointer hover:bg-muted/50 border-b border-zinc-800 transition-colors ${
                                        !cat.is_active ? 'opacity-60' : ''
                                    }`}
                                    onClick={() => openTransactionsModal(cat)}
                                >
                                    <TableCell className="font-medium text-zinc-300">
                                        <div className="flex items-center gap-3">
                                            <div 
                                                className="h-3.5 w-3.5 rounded-full shrink-0" 
                                                style={{ backgroundColor: cat.color || '#3b82f6' }}
                                            />
                                            <span className="flex items-center gap-2">
                                                {cat.name}
                                                {!cat.is_active && (
                                                    <span className="text-xs font-normal text-zinc-500">(Inactive)</span>
                                                )}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{renderTypeBadge(cat.type)}</TableCell>
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
                                                <DropdownMenuItem onClick={() => openTransactionsModal(cat)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                    <ListFilter className="mr-2 h-4 w-4 text-zinc-400" /> View
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => openEditModal(cat)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                    <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleToggleActive(cat)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                    <Power className="mr-2 h-4 w-4 text-zinc-400" />
                                                    {cat.is_active ? 'Deactivate' : 'Activate'}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem 
                                                    onClick={() => setDeletingCategory(cat)} 
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
                                <TableCell colSpan={3} className="text-center py-8 text-zinc-400">
                                    No categories match your criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}