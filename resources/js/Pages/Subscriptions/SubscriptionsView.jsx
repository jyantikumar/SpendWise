import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { 
    Calendar, 
    Plus, 
    RefreshCw, 
    Wallet, 
    CheckCircle2, 
    Clock, 
    Power,
    Tag,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    Zap,
    Loader2
} from 'lucide-react';
import { toast } from 'sonner';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateRecurringDialog } from '@/components/CreateRecurringDialog';

export default function SubscriptionsView({ 
    auth, 
    recurringTransactions = [], 
    accounts = [], 
    categories = [] 
}) {
    const [filterType, setFilterType] = useState('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [processingId, setProcessingId] = useState(null);

    const recurringList = Array.isArray(recurringTransactions) 
        ? recurringTransactions 
        : (recurringTransactions?.data || []);

    const prevLink = recurringTransactions?.prev_page_url || recurringTransactions?.links?.find(l => l.label.includes('Previous'))?.url;
    const nextLink = recurringTransactions?.next_page_url || recurringTransactions?.links?.find(l => l.label.includes('Next'))?.url;
    const currentPage = recurringTransactions?.current_page || 1;
    const lastPage = recurringTransactions?.last_page || 1;
    const fromRecord = recurringTransactions?.from || (recurringList.length > 0 ? 1 : 0);
    const toRecord = recurringTransactions?.to || recurringList.length;
    const totalRecords = recurringTransactions?.total || recurringList.length;

    const formatCurrency = (val) => 
        new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(val || 0);

    const handleProcess = (item) => {
        setProcessingId(item.id);
        router.post(route('recurring.process', item.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Processed "${item.title}" successfully!`, {
                    description: `${formatCurrency(item.amount)} logged to your transactions.`,
                });
            },
            onError: () => {
                toast.error('Failed to process recurring transaction.');
            },
            onFinish: () => {
                setProcessingId(null);
            },
        });
    };

    const handleToggleActive = (item) => {
        router.patch(route('recurring.toggle', item.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Schedule ${item.is_active ? 'paused' : 'activated'}.`);
            },
        });
    };

    const filteredItems = recurringList.filter((item) => {
        if (filterType === 'expense') return item.type === 'expense';
        if (filterType === 'income') return item.type === 'income';
        return true;
    });

    const totalMonthlyCommitment = recurringList
        .filter((item) => item.is_active && item.type === 'expense')
        .reduce((acc, item) => {
            let monthlyVal = Number(item.amount) || 0;
            if (item.frequency === 'daily') monthlyVal *= 30;
            if (item.frequency === 'weekly') monthlyVal *= 4.33;
            if (item.frequency === 'yearly') monthlyVal /= 12;
            return acc + monthlyVal;
        }, 0);

    return (
        <TooltipProvider>
            <SidebarProvider>
                <Head title="Recurring & Subscriptions - SpendWise" />

                <AppSidebar user={auth.user} />

                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-zinc-800 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-zinc-800" />
                        <h1 className="text-lg font-semibold tracking-tight text-zinc-200">Recurring & Subscriptions</h1>
                    </header>

                    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
                                    <RefreshCw className="h-6 w-6 text-primary" /> Recurring & Subscriptions
                                </h2>
                                <p className="text-sm text-zinc-400">
                                    Manage fixed operational cash outflows, memberships, and automated repeat income.
                                </p>
                            </div>

                            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                                <Plus className="h-4 w-4" /> Add Recurring Rule
                            </Button>
                        </div>

                        {/* Top KPI Cards */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Estimated Monthly Expenses</CardTitle>
                                    <Calendar className="h-4 w-4 text-rose-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-rose-500">{formatCurrency(totalMonthlyCommitment)}</div>
                                    <p className="text-xs text-zinc-400 mt-1">Normalized active commitments</p>
                                </CardContent>
                            </Card>

                            <Card className="border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Active Schedules</CardTitle>
                                    <Clock className="h-4 w-4 text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-zinc-200">
                                        {recurringList.filter(i => i.is_active).length}
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1">Rules currently active</p>
                                </CardContent>
                            </Card>

                            <Card className="border-zinc-800">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-zinc-400">Auto-Created Rules</CardTitle>
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-500">
                                        {recurringList.filter(i => i.auto_create).length}
                                    </div>
                                    <p className="text-xs text-zinc-400 mt-1">Managed via background scheduler</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Table */}
                        <Card className="border-zinc-800">
                            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <CardTitle className="text-zinc-200">Scheduled Rules</CardTitle>
                                    <CardDescription className="text-zinc-400">
                                        Overview of repeat processing schedules across accounts.
                                    </CardDescription>
                                </div>

                                <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 self-start sm:self-auto">
                                    {['all', 'expense', 'income'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setFilterType(type)}
                                            className={`px-3 py-1 rounded-md text-xs capitalize transition-all ${
                                                filterType === type 
                                                    ? 'bg-zinc-800 text-zinc-100 font-medium' 
                                                    : 'text-zinc-400 hover:text-zinc-200'
                                            }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-zinc-800">
                                            <TableHead className="text-zinc-400">Title</TableHead>
                                            <TableHead className="text-zinc-400">Frequency</TableHead>
                                            <TableHead className="text-zinc-400">Account</TableHead>
                                            <TableHead className="text-zinc-400">Next Due Date</TableHead>
                                            <TableHead className="text-zinc-400 text-center">Auto-Post</TableHead>
                                            <TableHead className="text-right text-zinc-400">Amount</TableHead>
                                            <TableHead className="text-right text-zinc-400">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item) => (
                                                <TableRow 
                                                    key={item.id} 
                                                    className="hover:bg-muted/50 border-b border-zinc-800 transition-colors"
                                                >
                                                    <TableCell className="font-medium text-zinc-300 text-sm">
                                                        <div>
                                                            <p className="font-semibold text-zinc-200">{item.title}</p>
                                                            <p className="text-xs text-zinc-500 capitalize">{item.type}</p>
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="text-xs text-zinc-400">
                                                        <Badge variant="outline" className="text-xs capitalize border-zinc-800 text-zinc-300">
                                                            {item.frequency}
                                                        </Badge>
                                                    </TableCell>

                                                    <TableCell className="text-xs text-zinc-400">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5 text-zinc-300">
                                                                <Wallet className="h-3.5 w-3.5 text-zinc-500" />
                                                                <span>{item.account?.name || '—'}</span>
                                                            </div>
                                                            {item.category && (
                                                                <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                                                                    <Tag className="h-3 w-3" />
                                                                    <span>{item.category.name}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>

                                                    <TableCell className="font-medium whitespace-nowrap text-zinc-300 text-xs">
                                                        {item.next_due_date ? String(item.next_due_date).split('T')[0] : '—'}
                                                    </TableCell>

                                                    <TableCell className="text-center">
                                                        {item.auto_create ? (
                                                            <Tooltip>
                                                                <TooltipTrigger>
                                                                    <Badge className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 gap-1">
                                                                        <Zap className="h-3 w-3" /> Auto
                                                                    </Badge>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="border-zinc-800 bg-zinc-900 text-xs">
                                                                    Automatically posts on due date
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <Badge variant="outline" className="text-xs border-zinc-800 text-zinc-400">
                                                                Manual
                                                            </Badge>
                                                        )}
                                                    </TableCell>

                                                    <TableCell className={`text-right font-semibold text-sm whitespace-nowrap ${
                                                        item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                                                    }`}>
                                                        {item.type === 'income' ? '+' : '-'}
                                                        {formatCurrency(item.amount)}
                                                    </TableCell>

                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button 
                                                                size="sm" 
                                                                variant="outline" 
                                                                disabled={processingId === item.id}
                                                                className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                                                onClick={() => handleProcess(item)}
                                                            >
                                                                {processingId === item.id ? (
                                                                    <>
                                                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin text-zinc-400" />
                                                                        Posting...
                                                                    </>
                                                                ) : (
                                                                    'Pay Now'
                                                                )}
                                                            </Button>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-200">
                                                                        <MoreHorizontal className="h-4 w-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                                                    <DropdownMenuLabel className="text-xs">Rule Actions</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                                                    <DropdownMenuItem 
                                                                        onClick={() => handleToggleActive(item)}
                                                                        className="cursor-pointer text-xs"
                                                                    >
                                                                        <Power className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                                                                        {item.is_active ? 'Pause Schedule' : 'Activate Schedule'}
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow className="border-b border-zinc-800">
                                                <TableCell colSpan={7} className="h-24 text-center text-zinc-400">
                                                    No recurring transactions match your criteria.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>

                            {/* Pagination Footer */}
                            {totalRecords > 0 && (
                                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800 px-6 py-4 text-xs text-zinc-400">
                                    <div>
                                        Showing <span className="font-medium text-zinc-200">{fromRecord}</span> to{' '}
                                        <span className="font-medium text-zinc-200">{toRecord}</span> of{' '}
                                        <span className="font-medium text-zinc-200">{totalRecords}</span> records
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!prevLink}
                                            onClick={() => prevLink && router.visit(prevLink, { preserveState: true, preserveScroll: true })}
                                            className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                        >
                                            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                                        </Button>

                                        <span className="text-xs font-medium text-zinc-300 px-1">
                                            {currentPage} / {lastPage}
                                        </span>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={!nextLink}
                                            onClick={() => nextLink && router.visit(nextLink, { preserveState: true, preserveScroll: true })}
                                            className="h-8 px-3 border-zinc-800 text-zinc-300 hover:text-zinc-100 text-xs"
                                        >
                                            Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            )}
                        </Card>
                    </main>
                </SidebarInset>

                <CreateRecurringDialog
                    open={isCreateOpen}
                    onOpenChange={setIsCreateOpen}
                    accounts={accounts}
                    categories={categories}
                />
            </SidebarProvider>
        </TooltipProvider>
    );
}