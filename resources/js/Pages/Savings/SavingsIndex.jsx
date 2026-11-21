// resources/js/Pages/Savings/Index.jsx
import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Plus, Target, Search, Calendar, TrendingUp, CheckCircle2, MoreHorizontal, Eye, Pencil, Filter, Wallet, ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SavingsGoalFormModal from '@/Pages/Savings/components/SavingsGoalFormModal';

export default function SavingsIndex({ auth, goals, summary = {}, filters = {} }) {
    const [status, setStatus] = useState(filters.status || 'all');
    const [search, setSearch] = useState(filters.search || '');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    const userCurrency = auth?.user?.currency || 'PHP';
    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(val || 0);

    // Pagination metadata
    const rows = goals?.data || [];
    const prevLink = goals?.prev_page_url;
    const nextLink = goals?.next_page_url;
    const currentPage = goals?.current_page || 1;
    const lastPage = goals?.last_page || 1;
    const fromRecord = goals?.from || 0;
    const toRecord = goals?.to || 0;
    const totalRecords = goals?.total || 0;

    const handleEditGoal = (e, goal) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingGoal(goal);
        setIsFormOpen(true);
    };

    const handleCloseModal = () => {
        setIsFormOpen(false);
        setEditingGoal(null);
    };

    const applyFilter = (overrides = {}) => {
        router.get(
            route('savings.index'),
            {
                status: overrides.status ?? status,
                search: overrides.search ?? search,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleStatusChange = (val) => {
        setStatus(val);
        applyFilter({ status: val });
    };

    const handleSearchChange = (val) => {
        setSearch(val);
        applyFilter({ search: val });
    };

    const overallProgress =
        summary.total_target > 0
            ? Math.round((summary.total_saved / summary.total_target) * 100)
            : 0;

    const statusLabel =
        status === 'active' ? 'Active' :
        status === 'completed' ? 'Completed' : 'All Goals';

    return (
        <AppLayout title="Savings Goals" headerTitle="Savings Goals">
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <p className="text-xs sm:text-sm text-zinc-400 line-clamp-1">
                        Track milestones and log deposits toward each goal.
                    </p>

                    {/* Mobile: split button full width */}
                    <div className="flex items-center w-full sm:hidden rounded-md overflow-hidden divide-x divide-zinc-300">
                        <Button
                            onClick={() => setIsFormOpen(true)}
                            className="flex-1 rounded-none border-0 bg-white hover:bg-zinc-200 text-zinc-900 font-medium h-9 text-xs gap-1.5 shadow-none"
                        >
                            <Plus className="h-4 w-4" /> New Goal
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className="rounded-none border-0 bg-white hover:bg-zinc-200 text-zinc-900 h-9 px-2 shadow-none"
                                    aria-label="Filter status"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-950 text-zinc-300 text-xs w-[160px]">
                                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1.5">
                                    Filter Status
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-zinc-800" />
                                {[
                                    { value: 'all', label: 'All Goals' },
                                    { value: 'active', label: 'Active' },
                                    { value: 'completed', label: 'Completed' },
                                ].map((opt) => (
                                    <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() => handleStatusChange(opt.value)}
                                        className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                    >
                                        <span className="flex-1">{opt.label}</span>
                                        {status === opt.value && <Check className="h-3 w-3 text-zinc-300" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* Desktop: search + split button inline */}
                    <div className="hidden sm:flex sm:items-center sm:gap-2 sm:shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                            <Input
                                placeholder="Search goals..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="h-9 w-[200px] lg:w-[240px] pl-9 border-zinc-800 bg-zinc-900 text-xs text-zinc-200 placeholder:text-zinc-500"
                            />
                        </div>

                        <div className="flex items-center rounded-md overflow-hidden divide-x divide-zinc-300">
                            <Button
                                onClick={() => setIsFormOpen(true)}
                                size="sm"
                                className="rounded-none border-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium h-9 text-xs gap-1.5 shadow-none"
                            >
                                <Plus className="h-3.5 w-3.5" /> New Goal
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        size="sm"
                                        className="rounded-none border-0 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 h-9 px-2 shadow-none"
                                        aria-label="Filter status"
                                    >
                                        <ChevronDown className="h-3.5 w-3.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-950 text-zinc-300 text-xs w-[160px]">
                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium px-2 py-1.5">
                                        Filter Status
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-zinc-800" />
                                    {[
                                        { value: 'all', label: 'All Goals' },
                                        { value: 'active', label: 'Active' },
                                        { value: 'completed', label: 'Completed' },
                                    ].map((opt) => (
                                        <DropdownMenuItem
                                            key={opt.value}
                                            onClick={() => handleStatusChange(opt.value)}
                                            className="cursor-pointer focus:bg-zinc-900 hover:bg-zinc-900"
                                        >
                                            <span className="flex-1">{opt.label}</span>
                                            {status === opt.value && <Check className="h-3 w-3 text-zinc-300" />}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Compact Summary KPIs */}
                <div className="grid gap-3 grid-cols-2">
                    <Card className="border-zinc-800 flex flex-col justify-between py-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4">
                            <CardTitle className="text-xs font-medium text-zinc-400">Total Saved</CardTitle>
                            <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                        </CardHeader>
                        <CardContent className="pb-3 pt-0 px-4">
                            <div className="text-xl font-bold text-emerald-500">
                                {formatCurrency(summary.total_saved)}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                                of {formatCurrency(summary.total_target)}
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-800 flex flex-col justify-between py-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4">
                            <CardTitle className="text-xs font-medium text-zinc-400">Overall Progress</CardTitle>
                            <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
                        </CardHeader>
                        <CardContent className="pb-3 pt-0 px-4">
                            <div className="text-xl font-bold text-zinc-200">{overallProgress}%</div>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                                {summary.active_count ?? 0} active · {summary.completed_count ?? 0} completed
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Mobile: search + active filter chip */}
                <div className="flex flex-row items-center gap-2 sm:hidden">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                        <Input
                            placeholder="Search goals..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="h-9 w-full pl-9 border-zinc-800 bg-zinc-900 text-xs text-zinc-200 placeholder:text-zinc-500"
                        />
                    </div>
                    {status !== 'all' && (
                        <button
                            type="button"
                            onClick={() => handleStatusChange('all')}
                            className="inline-flex items-center gap-1 h-9 px-3 text-xs rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 shrink-0"
                        >
                            <Filter className="h-3.5 w-3.5 text-zinc-400" />
                            {statusLabel}
                            <span className="text-zinc-500 ml-1">×</span>
                        </button>
                    )}
                </div>

                {/* Desktop: active filter chip (shown only when filtered) */}
                {status !== 'all' && (
                    <div className="hidden sm:flex items-center">
                        <button
                            type="button"
                            onClick={() => handleStatusChange('all')}
                            className="inline-flex items-center gap-1 h-7 px-2.5 text-[11px] rounded-md border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                        >
                            <Filter className="h-3 w-3 text-zinc-400" />
                            {statusLabel}
                            <span className="text-zinc-500 ml-1">×</span>
                        </button>
                    </div>
                )}

                {/* Goal list */}
                {rows.length === 0 ? (
                    <Card className="border-zinc-800 shadow-none">
                        <CardContent className="py-10 text-center">
                            <Target className="h-7 w-7 mx-auto mb-2 text-zinc-600" />
                            <p className="text-xs text-zinc-400">
                                {totalRecords === 0
                                    ? 'No savings goals found.'
                                    : 'No goals match your search or status filter.'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-zinc-800 shadow-none">
                        <CardHeader className="p-4 pb-2 sm:pb-3 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-semibold text-zinc-200">
                                All Goals
                            </CardTitle>
                            <span className="text-[11px] text-zinc-500">
                                {totalRecords} {totalRecords === 1 ? 'goal' : 'goals'}
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-zinc-800/70 px-3 sm:px-4">
                                {rows.map((goal) => (
                                    <div key={goal.id} className="relative group flex items-center gap-2">
                                        <div className="shrink-0 z-10">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-md transition-opacity"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                                    <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                                                        <Link href={route('savings.show', goal.id)}>
                                                            <Eye className="h-3.5 w-3.5" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={(e) => handleEditGoal(e, goal)} className="gap-2 text-xs cursor-pointer">
                                                        <Pencil className="h-3.5 w-3.5" /> Edit Goal
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <Link href={route('savings.show', goal.id)} className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 py-3 hover:bg-zinc-900/40 transition-colors rounded-md px-1">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-zinc-100 truncate">
                                                            {goal.title}
                                                        </span>
                                                        {goal.status === 'completed' ? (
                                                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                                                                <CheckCircle2 className="h-2.5 w-2.5" /> Done
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                                                                <TrendingUp className="h-2.5 w-2.5" /> Active
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                                                        <span className="text-zinc-300 font-medium">
                                                            {formatCurrency(goal.current_amount)}
                                                        </span>
                                                        <span>of {formatCurrency(goal.target_amount)}</span>
                                                        {goal.target_date && (
                                                            <>
                                                                <span className="text-zinc-700">·</span>
                                                                <span className="flex items-center gap-1">
                                                                    <Calendar className="h-3 w-3" />
                                                                    {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="hidden sm:flex flex-col items-end gap-1 w-48 shrink-0">
                                                    <div className="flex justify-between w-full text-[11px]">
                                                        <span className="text-zinc-400">{goal.progress_percentage}%</span>
                                                        <span className="text-zinc-500">{formatCurrency(goal.remaining_amount)} left</span>
                                                    </div>
                                                    <Progress value={goal.progress_percentage} className="h-1 w-full" />
                                                </div>

                                                <div className="sm:hidden text-[11px] font-medium text-zinc-300 shrink-0">
                                                    {goal.progress_percentage}%
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </CardContent>

                        {totalRecords > 0 && (
                            <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800/70 p-4 sm:px-4 text-xs text-zinc-400">
                                <div>
                                    Showing <span className="font-medium text-zinc-200">{fromRecord}</span> to{' '}
                                    <span className="font-medium text-zinc-200">{toRecord}</span> of{' '}
                                    <span className="font-medium text-zinc-200">{totalRecords}</span> records
                                </div>

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
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
                )}
            </div>

            <SavingsGoalFormModal isOpen={isFormOpen} onClose={handleCloseModal} editingGoal={editingGoal} />
        </AppLayout>
    );
}