import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
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

import AccountTypeFormModal from '@/components/AccountTypeFormModal';

export default function AccountTypeIndex({ auth, accountTypes }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [deletingType, setDeletingType] = useState(null);

    const openCreateModal = () => {
        setEditingType(null);
        setIsModalOpen(true);
    };

    const openEditModal = (type) => {
        setEditingType(type);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (!deletingType) return;
        router.delete(route('account-types.destroy', deletingType.id), {
            onSuccess: () => {
                toast.success(`Account type "${deletingType.name}" deleted successfully.`);
                setDeletingType(null);
            },
            onError: () => {
                toast.error('Failed to delete account type.');
            }
        });
    };

    return (
        <AppLayout title="Account Types" headerTitle="Account Types">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-zinc-100"></h2>
                        <p className="text-sm text-zinc-400">
                                                        Define asset classes, banking types, and wallet classifications for your accounts.

                        </p>
                    </div>

                    <Button onClick={openCreateModal} className="w-full sm:w-auto gap-2">
                        <Plus className="h-4 w-4" /> Add Account Type
                    </Button>
                </div>

                {/* Account Types Container */}
                <Card className="border-zinc-800">
                    <CardHeader className="p-4 sm:p-6">
                        <CardTitle className="text-zinc-200">All Account Types</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Manage classifications and color badges.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6 sm:pt-0">
                        {/* Mobile Cards View (Visible on screens smaller than `md`) */}
                        <div className="divide-y divide-zinc-800 md:hidden">
                            {accountTypes && accountTypes.length > 0 ? (
                                accountTypes.map((type) => (
                                    <div 
                                        key={type.id} 
                                        className="p-4 flex items-center justify-between gap-3 active:bg-zinc-800/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div 
                                                className="h-3.5 w-3.5 rounded-full shrink-0" 
                                                style={{ backgroundColor: type.color || '#3b82f6' }}
                                            />
                                            <span className="font-medium text-zinc-200 text-sm truncate">
                                                {type.name}
                                            </span>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="h-8 w-8 inline-flex items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 outline-none transition-colors shrink-0"
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-300">
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

                        {/* Desktop Table View (Visible on `md` and larger screens) */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-800">
                                        <TableHead className="text-zinc-400">Type Name</TableHead>
                                        <TableHead className="text-right text-zinc-400"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accountTypes && accountTypes.length > 0 ? (
                                        accountTypes.map((type) => (
                                            <TableRow key={type.id} className="border-b border-zinc-800 transition-colors hover:bg-muted/50">
                                                <TableCell className="font-medium text-zinc-300">
                                                    <div className="flex items-center gap-3">
                                                        <div 
                                                            className="h-3.5 w-3.5 rounded-full shrink-0" 
                                                            style={{ backgroundColor: type.color || '#3b82f6' }}
                                                        />
                                                        <span>{type.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
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
                                            <TableCell colSpan={2} className="text-center py-8 text-zinc-400">
                                                No account types created yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Reusable Account Type Form Modal */}
            <AccountTypeFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingType={editingType}
            />

            {/* Delete Confirmation Alert */}
            <AlertDialog open={!!deletingType} onOpenChange={() => setDeletingType(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Account Type?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{deletingType?.name}</strong>? 
                            Accounts linked to this type will retain their name, but their type classification link will be cleared.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}