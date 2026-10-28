import { useState } from 'react';
import { useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, ArrowRight } from 'lucide-react';

export default function SplitIndex({ events }) {
    const [openModal, setOpenModal] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('splits.store'), {
            onSuccess: () => {
                reset();
                setOpenModal(false);
            },
        });
    };

    return (
        <AppLayout title="Split Payments" headerTitle="Split Payments Ledger">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-zinc-100">Expense Sharing Events</h2>
                        <p className="text-sm text-zinc-400">Keep track of shared group costs and who owes what.</p>
                    </div>

                    <Dialog open={openModal} onOpenChange={setOpenModal}>
                        <DialogTrigger asChild>
                            <Button className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium">
                                <Plus className="mr-2 h-4 w-4" /> New Split Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="border-zinc-800 text-zinc-100">
                            <DialogHeader>
                                <DialogTitle className="text-zinc-100">Create Split Event</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <Label htmlFor="title" className="text-zinc-300">Event Title</Label>
                                    <Input
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="e.g. Boracay Trip, Weekend Groceries"
                                        className="border-zinc-800 text-zinc-100 mt-1 focus-visible:ring-zinc-600"
                                    />
                                    {errors.title && <p className="text-xs text-zinc-400 mt-1">{errors.title}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="event_date" className="text-zinc-300">Date</Label>
                                    <Input
                                        id="event_date"
                                        type="date"
                                        value={data.event_date}
                                        onChange={(e) => setData('event_date', e.target.value)}
                                        className="border-zinc-800 text-zinc-100 mt-1 focus-visible:ring-zinc-600"
                                    />
                                    {errors.event_date && <p className="text-xs text-zinc-400 mt-1">{errors.event_date}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="description" className="text-zinc-300">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Add notes about this gathering..."
                                        className="border-zinc-800 text-zinc-100 mt-1 focus-visible:ring-zinc-600"
                                    />
                                </div>

                                <DialogFooter>
                                    <Button type="submit" disabled={processing} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium">
                                        Create Event
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {events.length === 0 ? (
                        <Card className="col-span-full border-zinc-800 p-12 text-center shadow-none">
                            <Users className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
                            <h3 className="text-lg font-medium text-zinc-200">No split events yet</h3>
                            <p className="text-sm text-zinc-500 mt-1">Create your first event to start tracking shared expenses.</p>
                        </Card>
                    ) : (
                        events.map((event) => (
                            <Card key={event.id} className="border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between shadow-none">
                                <CardHeader className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className={`border-zinc-800 font-mono text-[10px] tracking-wider ${event.status === 'settled' ? 'bg-zinc-900 text-zinc-200' : 'bg-zinc-900/60 text-zinc-400'}`}>
                                            {event.status.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs text-zinc-500 flex items-center gap-1 font-mono">
                                            <Calendar className="h-3.5 w-3.5" /> {event.event_date}
                                        </span>
                                    </div>
                                    <CardTitle className="text-base text-zinc-100 font-semibold">{event.title}</CardTitle>
                                    <CardDescription className="text-zinc-400 line-clamp-2 text-xs">
                                        {event.description || 'No description provided.'}
                                    </CardDescription>
                                </CardHeader>
                                <div className="p-6 pt-0 flex items-center justify-between mt-auto">
                                    <span className="text-xs font-mono text-zinc-500">
                                        {event.expenses?.length || 0} expenses
                                    </span>
                                    <Button asChild variant="ghost" size="sm" className="text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 font-medium">
                                        <Link href={route('splits.show', event.id)}>
                                            View Ledger <ArrowRight className="ml-1.5 h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}