import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    Plus, Target, Search, Calendar, TrendingUp, CheckCircle2, MoreHorizontal,
    Eye, Pencil, Filter, Wallet, Trash2, AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import BudgetFormModal from '@/Pages/Budgets/components/BudgetFormModal';

export default function BudgetIndex({ auth, budgets = [], summary = {}, filters = {}, categories = [] }) {
    const [search, setSearch] = useState(filters.search || '');
    const [period, setPeriod] = useState(filters.period || 'all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState(null);
    const [deletingBudget, setDeletingBudget] = useState(null);

    const userCurrency = auth?.user?.currency || 'PHP';
    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(val || 0);

    const applyFilter = (overrides = {}) => {
        router.get(route('budgets.index'), {
            search: overrides.search ?? search,
            period: overrides.period ?? period,
        }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const handleSearchChange = (val) => { setSearch(val); applyFilter({ search: val }); };
    const handlePeriodChange = (val) => { setPeriod(val); applyFilter({ period: val }); };

    const openCreate = () => { setEditingBudget(null); setIsFormOpen(true); };
    const openEdit   = (budget) => { setEditingBudget(budget); setIsFormOpen(true); };
    const closeForm  = () => { setIsFormOpen(false); setEditingBudget(null); };

    const confirmDelete = () => {
        if (!deletingBudget) return;
        router.delete(route('budgets.destroy', deletingBudget.id), {
            onSuccess: () => { toast.success('Budget deleted.'); setDeletingBudget(null); },
            onError: () => toast.error('Failed to delete budget.'),
        });
    };

    const getStatusBadge = (pct) => {
        if (pct >= 100) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <AlertTriangle className="h-2.5 w-2.5" /> Over
                </span>
            );
        }
        if (pct >= 80) {
            return (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertTriangle className="h-2.5 w-2.5" /> Near
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-2.5 w-2.5" /> On Track
            </span>
        );
    };

    return (
        <AppLayout title="Budgets" headerTitle="Budgets">
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <p className="text-xs sm:text-sm text-zinc-400 line-clamp-1">
                        Set spending limits and track how close you are to them.
                    </p>
                    <Button
                        onClick={openCreate}
                        className="w-full sm:hidden bg-white hover:bg-zinc-200 text-zinc-900 font-medium h-9 text-xs gap-1.5"
                    >
                        <Plus className="h-4 w-4" /> New Budget
                    </Button>
                    <div className="hidden sm:flex sm:items-center sm:gap-2 sm:shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                            <Input
                                placeholder="Search budgets..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="h-9 w-[200px] lg:w-[240px] pl-9 border-zinc-800 bg-zinc-900 text-xs text-zinc-200 placeholder:text-zinc-500"
                            />
                        </div>
                        <Select value={period} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="h-9 w-[140px] border-zinc-800 bg-zinc-900 text-xs text-zinc-300 shrink-0">
                                <Filter className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                <SelectItem value="all" className="text-xs">All Periods</SelectItem>
                                <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
                                <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
                                <SelectItem value="custom" className="text-xs">Custom</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={openCreate} size="sm" className="gap-1.5 h-9 text-xs">
                            <Plus className="h-3.5 w-3.5" /> New Budget
                        </Button>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid gap-3 grid-cols-2">
                    <Card className="border-zinc-800 flex flex-col justify-between py-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4">
                            <CardTitle className="text-xs font-medium text-zinc-400">Allocated</CardTitle>
                            <Wallet className="h-3.5 w-3.5 text-zinc-400" />
                        </CardHeader>
                        <CardContent className="pb-3 pt-0 px-4">
                            <div className="text-xl font-bold text-zinc-100">
                                {formatCurrency(summary.total_allocated)}
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                                Spent {formatCurrency(summary.total_spent)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-zinc-800 flex flex-col justify-between py-1">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-4">
                            <CardTitle className="text-xs font-medium text-zinc-400">Utilization</CardTitle>
                            <TrendingUp className="h-3.5 w-3.5 text-zinc-400" />
                        </CardHeader>
                        <CardContent className="pb-3 pt-0 px-4">
                            <div className={`text-xl font-bold ${
                                summary.overall_pct >= 100 ? 'text-rose-500'
                                : summary.overall_pct >= 80 ? 'text-amber-400'
                                : 'text-emerald-400'
                            }`}>
                                {summary.overall_pct}%
                            </div>
                            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                                Remaining {formatCurrency(summary.total_remaining)}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Mobile filter row */}
                <div className="flex flex-row items-center gap-2 sm:hidden">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                        <Input
                            placeholder="Search budgets..."
                            value={search}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="h-9 w-full pl-9 border-zinc-800 bg-zinc-900 text-xs text-zinc-200 placeholder:text-zinc-500"
                        />
                    </div>
                    <Select value={period} onValueChange={handlePeriodChange}>
                        <SelectTrigger className="h-9 w-[130px] border-zinc-800 bg-zinc-900 text-xs text-zinc-300 shrink-0">
                            <Filter className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                            <SelectValue placeholder="Period" />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                            <SelectItem value="all" className="text-xs">All</SelectItem>
                            <SelectItem value="monthly" className="text-xs">Monthly</SelectItem>
                            <SelectItem value="weekly" className="text-xs">Weekly</SelectItem>
                            <SelectItem value="custom" className="text-xs">Custom</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Budget list */}
                {budgets.length === 0 ? (
                    <Card className="border-zinc-800 shadow-none">
                        <CardContent className="py-10 text-center">
                            <Target className="h-7 w-7 mx-auto mb-2 text-zinc-600" />
                            <p className="text-xs text-zinc-400">
                                No budgets yet. Create one to start tracking your spending limits.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="border-zinc-800 shadow-none">
                        <CardHeader className="p-4 pb-2 sm:pb-3 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-sm font-semibold text-zinc-200">All Budgets</CardTitle>
                            <span className="text-[11px] text-zinc-500">
                                {budgets.length} {budgets.length === 1 ? 'budget' : 'budgets'}
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* 👇 px moved from divide-y container onto each child wrapper */}
                            <div className="divide-y divide-zinc-800/70">
                                {budgets.map((budget) => (
                                    <div key={budget.id} className="relative group px-3 sm:px-4">
                                        <Link href={route('budgets.show', budget.id)}>
                                            <div className="flex items-center gap-3 py-3 -mx-3 sm:-mx-4 px-3 sm:px-4 hover:bg-zinc-900/40 transition-colors">
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold text-zinc-100 truncate">
                                                            {budget.name || budget.category_name || 'Overall Budget'}
                                                        </span>
                                                        {getStatusBadge(budget.utilization)}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-zinc-500">
                                                        <span className="text-zinc-300 font-medium">
                                                            {formatCurrency(budget.spent)}
                                                        </span>
                                                        <span>of {formatCurrency(budget.amount)}</span>
                                                        <span className="text-zinc-700">·</span>
                                                        <span className="flex items-center gap-1 capitalize">
                                                            <Calendar className="h-3 w-3" />
                                                            {budget.period}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="hidden sm:flex flex-col items-end gap-1 w-48 shrink-0">
                                                    <div className="flex justify-between w-full text-[11px]">
                                                        <span className="text-zinc-400">{budget.utilization}%</span>
                                                        <span className="text-zinc-500">
                                                            {formatCurrency(budget.remaining)} left
                                                        </span>
                                                    </div>
                                                    <Progress
                                                        value={Math.min(budget.utilization, 100)}
                                                        className="h-1 w-full"
                                                    />
                                                </div>

                                                <div className="sm:hidden text-[11px] font-medium text-zinc-300 shrink-0">
                                                    {budget.utilization}%
                                                </div>
                                            </div>
                                        </Link>

                                        <div className="absolute top-2.5 right-2 z-10 sm:top-1/2 sm:-translate-y-1/2 sm:right-2">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <MoreHorizontal className="h-3.5 w-3.5" />
                                                        <span className="sr-only">Actions</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                                                    <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                                                        <Link href={route('budgets.show', budget.id)}>
                                                            <Eye className="h-3.5 w-3.5" /> View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEdit(budget); }}
                                                        className="gap-2 text-xs cursor-pointer"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeletingBudget(budget); }}
                                                        className="gap-2 text-xs text-rose-400 focus:text-rose-300 cursor-pointer"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            <BudgetFormModal
                isOpen={isFormOpen}
                onClose={closeForm}
                editingBudget={editingBudget}
                categories={categories}
            />

            <AlertDialog open={!!deletingBudget} onOpenChange={(open) => !open && setDeletingBudget(null)}>
                <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base sm:text-lg">Delete this budget?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs sm:text-sm">
                            This will permanently remove{' '}
                            <strong>{deletingBudget?.name || deletingBudget?.category_name || 'this budget'}</strong>.
                            Your transactions are preserved.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                        <AlertDialogCancel className="mt-0 text-xs sm:text-sm">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-rose-600 hover:bg-rose-700 text-xs sm:text-sm">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}