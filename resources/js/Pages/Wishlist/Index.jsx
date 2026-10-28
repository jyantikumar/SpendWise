import { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Gift, ArrowRight, Pencil, Trash2, MoreVertical, Search, CircleCheckBig,Power } from 'lucide-react';

export default function WishlistIndex({ items }) {
    const [openModal, setOpenModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const [statusTab, setStatusTab] = useState('all'); // 'all', 'active', 'acquired'
    const [searchQuery, setSearchQuery] = useState('');

    const { data, setData, post, put, processing, reset, errors } = useForm({
        title: '',
        description: '',
        target_price: '',
        priority: 'medium',
    });

    const openCreateModal = () => {
        setEditingItem(null);
        reset();
        setOpenModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setData({
            title: item.title,
            description: item.description || '',
            target_price: item.target_price || '',
            priority: item.priority || 'medium',
        });
        setOpenModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingItem) {
            put(route('wishlist.update', editingItem.id), {
                onSuccess: () => {
                    reset();
                    setEditingItem(null);
                    setOpenModal(false);
                },
            });
        } else {
            post(route('wishlist.store'), {
                onSuccess: () => {
                    reset();
                    setOpenModal(false);
                },
            });
        }
    };

    const handleDelete = () => {
        if (!deletingItem) return;
        router.delete(route('wishlist.destroy', deletingItem.id), {
            onSuccess: () => setDeletingItem(null),
        });
    };

    // Filter items based on active tab and search query
    const filteredItems = items.filter((item) => {
        const matchesTab = 
            statusTab === 'active' ? item.status !== 'purchased' :
            statusTab === 'acquired' ? item.status === 'purchased' : true;

        const matchesSearch = 
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            item.prices.some(p => p.site_name.toLowerCase().includes(searchQuery.toLowerCase()));

        return matchesTab && matchesSearch;
    });

    return (
        <AppLayout title="Wishlist" headerTitle="Product Wishlist & Comparison">
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <h2 className="text-lg font-bold tracking-tight text-zinc-100">Saved Wants & Goals</h2>
                        <p className="text-xs text-zinc-400">Track target items and compare prices across different sites.</p>
                    </div>

                    <Button onClick={openCreateModal} className="w-full sm:w-auto bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium h-8 text-xs px-3">
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Wishlist Item
                    </Button>
                </div>

                {/* Tabs & Search Filter Header Section */}
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
    <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 p-1 grid grid-cols-3 w-full sm:w-auto rounded-lg gap-1">
        <button
            type="button"
            onClick={() => setStatusTab('all')}
            className={`text-[11px] px-3 h-6 rounded font-medium transition-all flex items-center justify-center ${
                statusTab === 'all' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'hover:text-zinc-200'
            }`}
        >
            All ({items.length})
        </button>
        <button
            type="button"
            onClick={() => setStatusTab('active')}
            className={`text-[11px] px-3 h-6 rounded font-medium transition-all flex items-center justify-center ${
                statusTab === 'active' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'hover:text-zinc-200'
            }`}
        >
            Active ({items.filter(i => i.status !== 'purchased').length})
        </button>
        <button
            type="button"
            onClick={() => setStatusTab('acquired')}
            className={`text-[11px] px-3 h-6 rounded font-medium transition-all flex items-center justify-center ${
                statusTab === 'acquired' ? 'bg-zinc-800 text-zinc-100 shadow-sm' : 'hover:text-zinc-200'
            }`}
        >
            Acquired ({items.filter(i => i.status === 'purchased').length})
        </button>
    </div>

    {/* Search Bar matching the smaller height */}
    <div className="relative w-full sm:w-72">
        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-zinc-500" />
        <Input
            type="text"
            placeholder="Search wishlist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-zinc-800 bg-zinc-900 text-zinc-100 pl-8 h-7 text-xs focus-visible:ring-zinc-600"
        />
    </div>
</div>

                {/* Cards Grid Placed Strictly Below */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                    {filteredItems.length === 0 ? (
                        <Card className="col-span-full border-zinc-800 p-8 text-center shadow-none">
                            <Gift className="mx-auto h-10 w-10 text-zinc-600 mb-2" />
                            <h3 className="text-sm font-medium text-zinc-200">No wishlist items found</h3>
                            <p className="text-xs text-zinc-500 mt-0.5">Try adjusting your search query or tab filter.</p>
                        </Card>
                    ) : (
                        filteredItems.map((item) => {
                            const lowestPrice = item.prices.length > 0 ? Math.min(...item.prices.map(p => p.price)) : null;
                            const isPurchased = item.status === 'purchased';

                            return (
                                <Card 
                                    key={item.id} 
                                    className={`border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-none cursor-pointer group p-2.5 sm:p-3 space-y-1.5 ${isPurchased ? 'opacity-60 bg-zinc-900/20' : ''}`}
                                    onClick={() => router.visit(route('wishlist.show', item.id))}
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1">
                                                <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-300 text-[8px] sm:text-[9px] uppercase px-1 py-0 h-3.5">
                                                    {item.priority}
                                                </Badge>
                                                {isPurchased && (
                                                    <Badge className="bg-emerald-800 text-zinc-100  border-emerald-500/20 text-[8px] sm:text-[9px] px-1 py-0 h-3.5">
                                                        Acquired
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            {/* Ellipsis Menu */}
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-5 w-5 text-zinc-400 hover:text-zinc-100">
                                                            <MoreVertical className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-950 text-zinc-300 text-xs">
                                                       <DropdownMenuItem onClick={() => router.patch(route('wishlist.status.toggle', item.id))} className="hover:bg-zinc-900 focus:bg-zinc-900 cursor-pointer">
    {isPurchased ? (
        <>
            <Power className="mr-2 h-3 w-3 text-zinc-400" />Activate
        </>
    ) : (
        <>
            <CircleCheckBig className="mr-2 h-3 w-3 text-zinc-400" />Acquire
        </>
    )}
</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEditModal(item)} className="hover:bg-zinc-900 focus:bg-zinc-900 cursor-pointer">
                                                            <Pencil className="mr-2 h-3 w-3 text-zinc-400" /> Edit Item
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => setDeletingItem(item)} className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer">
                                                            <Trash2 className="mr-2 h-3 w-3" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>

                                        <div>
                                            <CardTitle className="text-xs sm:text-sm text-zinc-100 font-semibold line-clamp-1">{item.title}</CardTitle>
                                            {item.target_price && (
                                                <p className="text-[10px] text-zinc-400">
                                                    Target: ₱{Number(item.target_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-1.5 mt-auto border-t border-zinc-900">
                                        <div>
                                            <p className="text-[8px] uppercase tracking-wider text-zinc-500">Lowest</p>
                                            <p className="font-semibold text-zinc-100 text-[11px]">
                                                {lowestPrice ? `₱${Number(lowestPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'None'}
                                            </p>
                                        </div>
                                        <span className="text-[10px] text-zinc-400 flex items-center gap-0.5 font-medium group-hover:text-zinc-100 transition-colors">
                                            View <ArrowRight className="h-2.5 w-2.5" />
                                        </span>
                                    </div>
                                </Card>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={openModal} onOpenChange={setOpenModal}>
                <DialogContent className="border-zinc-800 text-zinc-100 max-w-md w-[90vw] sm:w-full rounded-lg bg-zinc-950 p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100 text-base">
                            {editingItem ? 'Edit Wishlist Item' : 'Add New Wishlist Item'}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                        <div>
                            <Label htmlFor="title" className="text-zinc-300 text-xs">Item Name</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => setData('title', e.target.value)}
                                placeholder="e.g. Mechanical Keyboard"
                                className="border-zinc-800 bg-zinc-900 text-zinc-100 mt-1 h-9 text-xs focus-visible:ring-zinc-600"
                            />
                            {errors.title && <p className="text-[11px] text-rose-400 mt-1">{errors.title}</p>}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="col-span-1">
                                <Label htmlFor="target_price" className="text-zinc-300 text-xs">Target Budget (₱)</Label>
                                <Input
                                    id="target_price"
                                    type="number"
                                    step="0.01"
                                    value={data.target_price}
                                    onChange={(e) => setData('target_price', e.target.value)}
                                    placeholder="3500.00"
                                    className="border-zinc-800 bg-zinc-900 text-zinc-100 mt-1 h-9 text-xs focus-visible:ring-zinc-600"
                                />
                            </div>
                            <div className="col-span-1">
                                <Label htmlFor="priority" className="text-zinc-300 text-xs">Priority</Label>
                                <Select value={data.priority} onValueChange={(val) => setData('priority', val)}>
                                    <SelectTrigger className="border-zinc-800 bg-zinc-900 text-zinc-100 mt-1 h-9 text-xs w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-300 text-xs">
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-zinc-300 text-xs">Notes / Specs (Optional)</Label>
                            <Textarea
                                id="description"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Add spec details, color, or model..."
                                className="border-zinc-800 bg-zinc-900 text-zinc-100 mt-1 text-xs focus-visible:ring-zinc-600 resize-none break-all"
                                rows={3}
                            />
                        </div>

                        <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setOpenModal(false)} className="border-zinc-800 bg-zinc-900 text-zinc-300 h-8 text-xs">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium h-8 text-xs">
                                {editingItem ? 'Save Changes' : 'Save Item'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
                <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100 max-w-sm w-[90vw] sm:w-full rounded-lg p-4">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-zinc-400">
                            This will permanently delete this wishlist item and all its price comparison links.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                        <AlertDialogCancel className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 h-8 text-xs">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700 text-white h-8 text-xs">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}