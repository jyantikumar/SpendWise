import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Plus, 
    MoreHorizontal, 
    Pencil, 
    Trash2, 
    ArrowUpCircle, 
    ArrowDownCircle, 
    ArrowLeftRight,
    ListFilter
} from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from '@/components/ui/alert-dialog';

import CategoryTransactionsModal from '@/components/CategoryTransactionsModal';
import CategoryFormModal from '@/components/CategoryFormModal';

export default function CategoryIndex({ auth, categories = [], accounts = [] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deletingCategory, setDeletingCategory] = useState(null);
    const [selectedTab, setSelectedTab] = useState('all');

    // Category Transactions Modal State
    const [selectedCategoryForModal, setSelectedCategoryForModal] = useState(null);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

    const openCreateModal = () => {
        setEditingCategory(null);
        setIsCreateOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setIsCreateOpen(true);
    };

    const openTransactionsModal = (category) => {
        setSelectedCategoryForModal(category);
        setIsCategoryModalOpen(true);
    };

    const handleDelete = () => {
        if (!deletingCategory) return;
        router.delete(route('categories.destroy', deletingCategory.id), {
            onSuccess: () => setDeletingCategory(null),
        });
    };

    const filteredCategories = categories.filter((cat) => {
        if (selectedTab === 'all') return true;
        return cat.type === selectedTab;
    });

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
        <TooltipProvider>
            <SidebarProvider>
                <Head title="Categories - SpendWise" />

                <AppSidebar user={auth.user} />

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-800" />
                        <h1 className="text-lg font-semibold tracking-tight text-zinc-200">Category Management</h1>
                    </header>

                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        {/* Header Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-100">Categories</h2>
                                <p className="text-sm text-zinc-400">
                                    Organize your cash flow into custom income, expense, and transfer categories.
                                </p>
                            </div>

                            <Button onClick={openCreateModal} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Category
                            </Button>
                        </div>

                        {/* Category Table Card */}
                        <Card className="border-zinc-800">
                            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-zinc-200">All Categories</CardTitle>
                                    <CardDescription className="text-zinc-400">Click any row to view transactions recorded under that category.</CardDescription>
                                </div>

                                {/* Type Filter Buttons */}
                                <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg text-xs">
                                    {['all', 'expense', 'income', 'transfer'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setSelectedTab(tab)}
                                            className={`px-3 py-1.5 rounded-md font-medium capitalize transition-colors ${
                                                selectedTab === tab
                                                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                                                    : 'text-zinc-400 hover:text-zinc-200'
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-zinc-800">
                                            <TableHead className="text-zinc-400">Category Name</TableHead>
                                            <TableHead className="text-zinc-400">Type</TableHead>
                                            <TableHead className="text-zinc-400">Transactions Count</TableHead>
                                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCategories.length > 0 ? (
                                            filteredCategories.map((cat) => (
                                                <TableRow 
                                                    key={cat.id}
                                                    className="cursor-pointer hover:bg-muted/50 border-b border-zinc-800 transition-colors"
                                                    onClick={() => openTransactionsModal(cat)}
                                                >
                                                    <TableCell className="font-medium text-zinc-300">
                                                        <div className="flex items-center gap-3">
                                                            <div 
                                                                className="h-3.5 w-3.5 rounded-full shrink-0" 
                                                                style={{ backgroundColor: cat.color || '#3b82f6' }}
                                                            />
                                                            <span>{cat.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{renderTypeBadge(cat.type)}</TableCell>
                                                    <TableCell className="text-zinc-400">
                                                        {cat.transactions_count || 0} transactions
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
                                                                <DropdownMenuItem onClick={() => openTransactionsModal(cat)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                                    <ListFilter className="mr-2 h-4 w-4 text-zinc-400" /> View
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => openEditModal(cat)} className="cursor-pointer hover:bg-zinc-800 focus:bg-zinc-800">
                                                                    <Pencil className="mr-2 h-4 w-4 text-zinc-400" /> Edit
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
                                                <TableCell colSpan={4} className="text-center py-8 text-zinc-400">
                                                    No categories found for the selected filter.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </main>

                    {/* Category Transactions Modal */}
                    <CategoryTransactionsModal
                        isOpen={isCategoryModalOpen}
                        onClose={() => setIsCategoryModalOpen(false)}
                        category={selectedCategoryForModal}
                        accounts={accounts}
                    />

                    {/* Reusable Category Form Modal */}
                    <CategoryFormModal
                        isOpen={isCreateOpen}
                        onClose={() => setIsCreateOpen(false)}
                        editingCategory={editingCategory}
                    />

                    {/* Delete Confirmation Alert Dialog */}
                    <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action will permanently remove the <strong>{deletingCategory?.name}</strong> category. 
                                    Existing transactions linked to this category will remain, but their category tag will be cleared.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white">
                                    Delete Category
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
}