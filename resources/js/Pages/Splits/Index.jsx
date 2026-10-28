import { useState, useMemo } from 'react';
import { useForm, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Calendar, Users, ArrowRight, Search, Filter, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/currency';

export default function SplitIndex({ auth, events }) {
    const [openModal, setOpenModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [deletingEvent, setDeletingEvent] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'open' | 'settled'

    const userCurrency = auth?.user?.currency || 'PHP';

    const { data, setData, post, put, processing, reset, errors } = useForm({
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
    });

    const openCreateModal = () => {
        setEditingEvent(null);
        reset();
        setData({
            title: '',
            description: '',
            event_date: new Date().toISOString().split('T')[0],
        });
        setOpenModal(true);
    };

    const openEditModal = (event) => {
        setEditingEvent(event);
        setData({
            title: event.title,
            description: event.description || '',
            event_date: event.event_date ? event.event_date.split('T')[0] : new Date().toISOString().split('T')[0],
        });
        setOpenModal(true);
    };

    const submit = (e) => {
        e.preventDefault();
        if (editingEvent) {
            put(route('splits.update', editingEvent.id), {
                onSuccess: () => {
                    reset();
                    setEditingEvent(null);
                    setOpenModal(false);
                },
            });
        } else {
            post(route('splits.store'), {
                onSuccess: () => {
                    reset();
                    setOpenModal(false);
                },
            });
        }
    };

    const handleDeleteEvent = () => {
        if (!deletingEvent) return;
        router.delete(route('splits.destroy', deletingEvent.id), {
            onSuccess: () => {
                setDeletingEvent(null);
            },
        });
    };

    // Filter events based on search query and status filter
    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesSearch = 
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
            
            const matchesStatus = 
                statusFilter === 'all' || event.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [events, searchQuery, statusFilter]);

    return (
        <AppLayout title="Split Payments" headerTitle="Split Payments Ledger">
            <div className="space-y-4 sm:space-y-6">
                {/* Header & New Event Action */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <p className="text-xs sm:text-sm text-zinc-400">Keep track of shared group costs and who owes what.</p>
                    </div>

                    <Button size="sm" onClick={openCreateModal} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium h-9 text-xs w-full sm:w-auto">
                        <Plus className="mr-1.5 h-3.5 w-3.5" /> New Event
                    </Button>

                    {/* Create / Edit Event Modal */}
                    <Dialog open={openModal} onOpenChange={setOpenModal}>
                        <DialogContent className="border-zinc-800 text-zinc-100">
                            <DialogHeader>
                                <DialogTitle className="text-zinc-100 text-sm font-semibold">
                                    {editingEvent ? 'Edit Split Event' : 'Create Split Event'}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4 pt-2">
                                <div>
                                    <Label htmlFor="title" className="text-zinc-300 text-xs">Event Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. Boracay Trip, Weekend Groceries"
                                        className="border-zinc-800 text-zinc-100 mt-1 text-xs h-9"
                                    />
                                    {errors.title && <p className="text-xs text-rose-400 mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="event_date" className="text-zinc-300 text-xs">Date</Label>
                                    <Input
                                        id="event_date"
                                        type="date"
                                        value={data.event_date}
                                        onChange={(e) => setData('event_date', e.target.value)}
                                        className="border-zinc-800 text-zinc-100 mt-1 text-xs h-9"
                                    />
                                    {errors.event_date && <p className="text-xs text-rose-400 mt-1">{errors.event_date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description" className="text-zinc-300 text-xs">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Add notes about this gathering..."
                                        className="border-zinc-800 text-zinc-100 mt-1 text-xs"
                                    />
                                </div>

                                <DialogFooter className="pt-2">
                                    <Button type="submit" disabled={processing} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium h-9 text-xs">
                                        {editingEvent ? 'Save Changes' : 'Create Event'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search Bar & Status Filter Bar (Side-by-Side) */}
                <div className="flex flex-row items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                        <Input
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 w-full pl-9 border-zinc-800 bg-zinc-900 text-xs text-zinc-200 placeholder:text-zinc-500"
                        />
                    </div>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 w-[130px] sm:w-[160px] border-zinc-800 bg-zinc-900 text-xs text-zinc-300 shrink-0">
                            <Filter className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                            <SelectItem value="all" className="text-xs">All Events</SelectItem>
                            <SelectItem value="open" className="text-xs">Unpaid</SelectItem>
                            <SelectItem value="settled" className="text-xs">Settled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Events Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {filteredEvents.length === 0 ? (
                        <Card className="col-span-full border-zinc-800 p-8 sm:p-12 text-center shadow-none">
                            <Users className="mx-auto h-10 w-10 text-zinc-600 mb-3" />
                            <h3 className="text-sm font-medium text-zinc-200">No split events found</h3>
                            <p className="text-xs text-zinc-500 mt-1">
                                {events.length === 0 ? "Create your first event to start tracking shared expenses." : "Try adjusting your search or status filter."}
                            </p>
                        </Card>
                    ) : (
                        filteredEvents.map((event) => (
                            <Card key={event.id} className="border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-none p-3.5 sm:p-5 gap-3">
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className={`border-zinc-800      text-[9px] sm:text-[10px] tracking-wider py-0.5 px-2 ${
                                            event.status === 'settled' 
                                                ? 'bg-green-900 text-zinc-200' 
                                                : 'bg-zinc-900/60 text-zinc-400'
                                        }`}>
                                            {event.status.toUpperCase()}
                                        </Badge>
                                        
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[11px] text-zinc-500 flex items-center gap-1     ">
                                                <Calendar className="h-3 w-3" /> {event.event_date ? event.event_date.split('T')[0] : ''}
                                            </span>
                                            
                                            {/* Event Actions Dropdown */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900">
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                                    <DropdownMenuItem onClick={() => openEditModal(event)} className="text-xs cursor-pointer">
                                                        <Pencil className="mr-2 h-3.5 w-3.5 text-zinc-400" /> Edit Event
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setDeletingEvent(event)} className="text-xs text-rose-400 focus:text-rose-400 cursor-pointer">
                                                        <Trash2 className="mr-2 h-3.5 w-3.5 text-rose-400" /> Delete Event
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                    <CardTitle className="text-sm sm:text-base text-zinc-100 font-semibold">{event.title}</CardTitle>
                                    <CardDescription className="text-zinc-400 line-clamp-1 text-[11px] sm:text-xs">
                                        {event.description || 'No description provided.'}
                                    </CardDescription>
                                </div>
                                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 mt-auto">
                                    <span className="text-[11px] text-zinc-400     ">
                                        <strong className="text-zinc-200 font-semibold">{formatCurrency(event.total_spent || 0, userCurrency)}</strong>
                                    </span>
                                    <Button asChild variant="ghost" size="sm" className="h-7 px-2.5 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 text-xs font-medium">
                                        <Link href={route('splits.show', event.id)}>
                                            View Ledger <ArrowRight className="ml-1 h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog open={!!deletingEvent} onOpenChange={(open) => !open && setDeletingEvent(null)}>
                <AlertDialogContent className="border-zinc-800 bg-zinc-950 text-zinc-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-sm font-semibold text-zinc-100">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs text-zinc-400">
                            This will permanently delete this split event along with all its logged expenses, participant shares, and settlements.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 text-xs h-9">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteEvent} className="bg-rose-600 hover:bg-rose-700 text-white text-xs h-9">
                            Delete Event
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}