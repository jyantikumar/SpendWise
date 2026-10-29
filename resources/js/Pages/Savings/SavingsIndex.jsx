import { useState, useMemo } from 'react';
import { Link } from '@inertiajs/react';
import { Plus, Target, Search, Calendar, TrendingUp, CheckCircle2, MoreHorizontal, Eye, Pencil, Filter, Wallet } from 'lucide-react';

import AppLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import SavingsGoalFormModal from '@/Pages/Savings/components/SavingsGoalFormModal';

export default function SavingsIndex({ auth, goals = [], summary = {}, filters = {} }) {
    const [status, setStatus] = useState(filters.status || 'all');
    const [search, setSearch] = useState(filters.search || '');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    const userCurrency = auth?.user?.currency || 'PHP';
    const formatCurrency = (val) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: userCurrency }).format(val || 0);

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

    const overallProgress =
        summary.total_target > 0
            ? Math.round((summary.total_saved / summary.total_target) * 100)
            : 0;

    const filteredGoals = useMemo(() => {
        return goals.filter((goal) => {
            const matchesSearch =
                goal.title.toLowerCase().includes(search.toLowerCase()) ||
                (goal.description && goal.description.toLowerCase().includes(search.toLowerCase()));

            const matchesStatus = status === 'all' || goal.status === status;

            return matchesSearch && matchesStatus;
        });
    }, [goals, search, status]);

    return (
        <AppLayout title="Savings Goals" headerTitle="Savings Goals">
            <div className="space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <p className="text-xs sm:text-sm text-zinc-400 line-clamp-1">
                        Track milestones and log deposits toward each goal.
                    </p>

                    <Button
                        onClick={() => setIsFormOpen(true)}
                        className="w-full sm:hidden bg-white hover:bg-zinc-200 text-zinc-900 font-medium h-9 text-xs gap-1.5"
                    >
                        <Plus className="h-4 w-4" /> New Goal
                    </Button>

                    <div className="hidden sm:flex sm:items-center sm:gap-2 sm:shrink-0">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                            <Input
                                placeholder="Search goals..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-9 w-[200px] lg:w-[240px] pl-9 border-zinc-800 bg-zinc-900 text-xs text-zinc-200 placeholder:text-zinc-500"
                            />
                        </div>

                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger className="h-9 w-[140px] border-zinc-800 bg-zinc-900 text-xs text-zinc-300 shrink-0">
                                <Filter className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                                <SelectItem value="all" className="text-xs">All Goals</SelectItem>
                                <SelectItem value="active" className="text-xs">Active</SelectItem>
                                <SelectItem value="completed" className="text-xs">Completed</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button onClick={() => setIsFormOpen(true)} size="sm" className="gap-1.5 h-9 text-xs">
                            <Plus className="h-3.5 w-3.5" /> New Goal
                        </Button>
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

                {/* Mobile filter row */}
                <div className="flex flex-row items-center gap-2 sm:hidden">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                        <Input
                            placeholder="Search goals..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-9 w-full pl-9 border-zinc-800 bg-zinc-900 text-xs text-zinc-200 placeholder:text-zinc-500"
                        />
                    </div>

                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-9 w-[130px] border-zinc-800 bg-zinc-900 text-xs text-zinc-300 shrink-0">
                            <Filter className="mr-1.5 h-3.5 w-3.5 text-zinc-400" />
                            <SelectValue placeholder="Filter status" />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-800 bg-zinc-900 text-zinc-200">
                            <SelectItem value="all" className="text-xs">All Goals</SelectItem>
                            <SelectItem value="active" className="text-xs">Active</SelectItem>
                            <SelectItem value="completed" className="text-xs">Completed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Goal list — one card containing flat rows */}
                {filteredGoals.length === 0 ? (
                    <Card className="border-zinc-800 shadow-none">
                        <CardContent className="py-10 text-center">
                            <Target className="h-7 w-7 mx-auto mb-2 text-zinc-600" />
                            <p className="text-xs text-zinc-400">
                                {goals.length === 0
                                    ? 'No savings goals found.'
                                    : 'Try adjusting your search or status filter.'}
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
                                {filteredGoals.length} {filteredGoals.length === 1 ? 'goal' : 'goals'}
                            </span>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-zinc-800/70 px-3 sm:px-4">
                                {filteredGoals.map((goal) => (
                                    <div key={goal.id} className="relative group">
                                        <Link href={route('savings.show', goal.id)}>
                                            <div className="flex items-center gap-3 py-3 -mx-3 sm:-mx-4 px-3 sm:px-4 hover:bg-zinc-900/40 transition-colors">
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
                    </Card>
                )}
            </div>

            <SavingsGoalFormModal isOpen={isFormOpen} onClose={handleCloseModal} editingGoal={editingGoal} />
        </AppLayout>
    );
}