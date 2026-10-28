import { useState } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowLeft, Plus, ExternalLink, Trash2, Pencil, MoreVertical, Wallet, FileText } from 'lucide-react';

export default function WishlistShow({ wishlist, lowestPrice }) {
    const [priceModal, setPriceModal] = useState(false);
    const [editingPrice, setEditingPrice] = useState(null);
    const [notesModal, setNotesModal] = useState(false);

    const priceForm = useForm({
        site_name: '',
        price: '',
        product_url: '',
    });

    const openCreateModal = () => {
        setEditingPrice(null);
        priceForm.reset();
        setPriceModal(true);
    };

    const openEditModal = (p) => {
        setEditingPrice(p);
        priceForm.setData({
            site_name: p.site_name,
            price: p.price,
            product_url: p.product_url,
        });
        setPriceModal(true);
    };

    const handlePriceSubmit = (e) => {
        e.preventDefault();
        if (editingPrice) {
            priceForm.put(route('wishlist.prices.update', [wishlist.id, editingPrice.id]), {
                onSuccess: () => {
                    priceForm.reset();
                    setEditingPrice(null);
                    setPriceModal(false);
                },
            });
        } else {
            priceForm.post(route('wishlist.prices.store', wishlist.id), {
                onSuccess: () => {
                    priceForm.reset();
                    setPriceModal(false);
                },
            });
        }
    };

    const handleDeletePrice = (priceId) => {
        router.delete(route('wishlist.prices.destroy', [wishlist.id, priceId]));
    };

    const handleDeleteItem = () => {
        router.delete(route('wishlist.destroy', wishlist.id));
    };

    const isLongNotes = wishlist.description && wishlist.description.length > 50;

    return (
        <AppLayout title={wishlist.title} headerTitle={wishlist.title}>
            <div className="space-y-4">
                {/* Header Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Button asChild variant="outline" size="sm" className="border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 h-8 text-xs">
                            <Link href={route('wishlist.index')}>
                                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
                            </Link>
                        </Button>
                        <Badge variant="outline" className="border-zinc-800 bg-zinc-900 text-zinc-300 text-[10px] uppercase h-6">
                            {wishlist.priority} Priority
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button variant="outline" onClick={handleDeleteItem} className="flex-1 sm:flex-initial border-rose-900/40 text-rose-400 hover:bg-rose-950/30 text-xs h-8 px-3">
                            <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete
                        </Button>

                        <Button onClick={openCreateModal} className="flex-1 sm:flex-initial bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium text-xs h-8 px-3">
                            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Price
                        </Button>

                        {/* Add/Edit Price Modal */}
                        <Dialog open={priceModal} onOpenChange={setPriceModal}>
                            <DialogContent className="border-zinc-800 text-zinc-100 max-w-md w-[90vw] sm:w-full rounded-lg bg-zinc-950 p-4 sm:p-6">
                                <DialogHeader>
                                    <DialogTitle className="text-zinc-100 text-base">
                                        {editingPrice ? 'Edit Price Link' : 'Add Price Comparison Link'}
                                    </DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handlePriceSubmit} className="space-y-3 pt-2">
                                    <div>
                                        <Label htmlFor="site_name" className="text-zinc-300 text-xs">Store / Site Name</Label>
                                        <Input
                                            id="site_name"
                                            value={priceForm.data.site_name}
                                            onChange={(e) => priceForm.setData('site_name', e.target.value)}
                                            placeholder="e.g. Shopee, Lazada"
                                            className="border-zinc-800 bg-zinc-900 text-zinc-100 mt-1 h-9 text-xs focus-visible:ring-zinc-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="price" className="text-zinc-300 text-xs">Price (₱)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            value={priceForm.data.price}
                                            onChange={(e) => priceForm.setData('price', e.target.value)}
                                            placeholder="2999.00"
                                            className="border-zinc-800 bg-zinc-900 text-zinc-100 mt-1 h-9 text-xs focus-visible:ring-zinc-600"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="product_url" className="text-zinc-300 text-xs">Product URL</Label>
                                        <Input
                                            id="product_url"
                                            type="url"
                                            value={priceForm.data.product_url}
                                            onChange={(e) => priceForm.setData('product_url', e.target.value)}
                                            placeholder="https://shopee.ph/product/..."
                                            className="border-zinc-800 bg-zinc-900 text-zinc-100 mt-1 h-9 text-xs focus-visible:ring-zinc-600"
                                        />
                                    </div>

                                    <DialogFooter className="flex-col sm:flex-row gap-2 pt-2">
                                        <Button type="button" variant="outline" onClick={() => setPriceModal(false)} className="border-zinc-800 bg-zinc-900 text-zinc-300 h-8 text-xs">
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={priceForm.processing} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium h-8 text-xs">
                                            {editingPrice ? 'Save Changes' : 'Save Link'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Two Compact Summary Cards Side-by-Side on Mobile & Desktop */}
                <div className="grid grid-cols-2 gap-3">
                    <Card className="border-zinc-800 shadow-none p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-medium text-zinc-400">Target Budget</span>
                            <Wallet className="h-3.5 w-3.5 text-zinc-500" />
                        </div>
                        <div className="text-sm sm:text-lg font-bold text-zinc-100 mt-1 truncate">
                            {wishlist.target_price ? `₱${Number(wishlist.target_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'None set'}
                        </div>
                    </Card>

                    <Card className="border-zinc-800 shadow-none p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-medium text-zinc-400">Notes & Specs</span>
                            <FileText className="h-3.5 w-3.5 text-zinc-500" />
                        </div>
                        <div className="mt-1">
                            <p className={`text-xs text-zinc-200 ${isLongNotes ? 'line-clamp-1' : ''}`}>
                                {wishlist.description || 'No notes provided.'}
                            </p>
                            {isLongNotes && (
                                <button
                                    onClick={() => setNotesModal(true)}
                                    className="text-[10px] text-zinc-400 hover:text-zinc-100 font-medium underline underline-offset-2 mt-0.5 block"
                                >
                                    View more
                                </button>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Price Comparison Card */}
                <Card className="border-zinc-800 shadow-none">
                    <CardHeader className="p-3.5 sm:p-4 pb-2">
                        <CardTitle className="text-sm font-semibold text-zinc-200">Price Comparison Across Sites</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-4 sm:pt-0">
                        {/* Desktop Table View */}
                        <div className="hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-b border-zinc-800">
                                        <TableHead className="text-zinc-400 text-xs py-2">Store / Site</TableHead>
                                        <TableHead className="text-zinc-400 text-xs py-2">Price</TableHead>
                                        <TableHead className="text-right text-zinc-400 text-xs py-2">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {wishlist.prices.length === 0 ? (
                                        <TableRow className="border-b border-zinc-800">
                                            <TableCell colSpan={3} className="h-16 text-center text-zinc-500 text-xs">
                                                No price comparison links added yet.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        wishlist.prices.map((p) => {
                                            const isLowest = Number(p.price) === Number(lowestPrice);

                                            return (
                                                <TableRow key={p.id} className="border-b border-zinc-800 hover:bg-zinc-900/40">
                                                    <TableCell className="font-medium text-zinc-200 text-xs py-2.5 flex items-center gap-1.5">
                                                        {p.site_name}
                                                        {isLowest && (
                                                            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] py-0 px-1">
                                                                Best
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-zinc-100 text-xs py-2.5">
                                                        ₱{Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                    </TableCell>
                                                    <TableCell className="text-right py-2.5">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-100">
                                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-950 text-zinc-300 text-xs">
                                                                <DropdownMenuItem asChild className="hover:bg-zinc-900 focus:bg-zinc-900 cursor-pointer">
                                                                    <a href={p.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                                                                        <ExternalLink className="mr-2 h-3 w-3 text-zinc-400" /> Visit Link
                                                                    </a>
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => openEditModal(p)} className="hover:bg-zinc-900 focus:bg-zinc-900 cursor-pointer">
                                                                    <Pencil className="mr-2 h-3 w-3 text-zinc-400" /> Edit Link
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => handleDeletePrice(p.id)} className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer">
                                                                    <Trash2 className="mr-2 h-3 w-3" /> Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile Ultra-Compact List View */}
                        <div className="divide-y divide-zinc-800 md:hidden px-3.5 sm:px-0">
                            {wishlist.prices.length === 0 ? (
                                <p className="text-[11px] text-zinc-500 text-center py-3">No price comparison links added yet.</p>
                            ) : (
                                wishlist.prices.map((p) => {
                                    const isLowest = Number(p.price) === Number(lowestPrice);

                                    return (
                                        <div key={p.id} className="py-2 flex items-center justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1">
                                                    <span className="font-medium text-zinc-200 text-xs truncate">{p.site_name}</span>
                                                    {isLowest && (
                                                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1 py-0 h-3.5">
                                                            Best
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="font-semibold text-zinc-100 text-xs">
                                                    ₱{Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>

                                            <div className="flex items-center shrink-0">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-zinc-100">
                                                            <MoreVertical className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-950 text-zinc-300 text-xs">
                                                        <DropdownMenuItem asChild className="hover:bg-zinc-900 focus:bg-zinc-900 cursor-pointer">
                                                            <a href={p.product_url} target="_blank" rel="noopener noreferrer" className="flex items-center w-full">
                                                                <ExternalLink className="mr-2 h-3 w-3 text-zinc-400" /> Visit Link
                                                            </a>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => openEditModal(p)} className="hover:bg-zinc-900 focus:bg-zinc-900 cursor-pointer">
                                                            <Pencil className="mr-2 h-3 w-3 text-zinc-400" /> Edit Link
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeletePrice(p.id)} className="text-rose-400 hover:bg-rose-950/30 focus:bg-rose-950/30 cursor-pointer">
                                                            <Trash2 className="mr-2 h-3 w-3" /> Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notes Full View Modal */}
            <Dialog open={notesModal} onOpenChange={setNotesModal}>
                <DialogContent className="border-zinc-800 text-zinc-100 max-w-sm w-[90vw] sm:w-full rounded-lg p-4">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-100 text-sm">Item Notes & Specs</DialogTitle>
                    </DialogHeader>
                    <div className="py-2 text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
                        {wishlist.description}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setNotesModal(false)} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium w-full h-8 text-xs">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}