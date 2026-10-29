<?php

namespace App\Http\Controllers;

use App\Models\SavingsGoal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SavingsGoalController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $status = $request->input('status', 'all'); // all | active | completed
        $search = $request->input('search');

        $goals = $user->savingsGoals()
            ->when($status !== 'all', fn ($q) => $q->where('status', $status))
            ->when($search, fn ($q) => $q->where('title', 'like', "%{$search}%"))
            ->withCount('transactions')
            ->orderByRaw("FIELD(status, 'active', 'completed')")
            ->orderBy('target_date', 'asc')
            ->paginate(12)
            ->withQueryString()
            ->through(fn (SavingsGoal $g) => [
                'id'                  => $g->id,
                'title'               => $g->title,
                'description'         => $g->description,
                'target_amount'       => (float) $g->target_amount,
                'current_amount'      => (float) $g->current_amount,
                'target_date'         => $g->target_date?->format('Y-m-d'),
                'status'              => $g->status,
                'progress_percentage' => $g->progress_percentage,
                'remaining_amount'    => $g->remaining_amount,
                'transactions_count'  => $g->transactions_count,
            ]);

        $summary = [
            'total_target'    => (float) $user->savingsGoals()->sum('target_amount'),
            'total_saved'     => (float) $user->savingsGoals()->sum('current_amount'),
            'active_count'    => $user->savingsGoals()->where('status', 'active')->count(),
            'completed_count' => $user->savingsGoals()->where('status', 'completed')->count(),
        ];

        return Inertia::render('Savings/SavingsIndex', [
            'goals'   => $goals,
            'summary' => $summary,
            'filters' => [
                'status' => $status,
                'search' => $search ?? '',
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'         => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string', 'max:1000'],
            'target_amount' => ['required', 'numeric', 'min:0.01'],
            'target_date'   => ['nullable', 'date', 'after_or_equal:today'],
        ]);

        $goal = $request->user()->savingsGoals()->create([
            ...$validated,
            'current_amount' => 0,
            'status'         => 'active',
        ]);

        return redirect()
            ->route('savings.show', $goal)
            ->with('success', 'Savings goal created.');
    }

    public function show(Request $request, SavingsGoal $savingsGoal)
    {
        $this->authorizeGoal($request, $savingsGoal);
        $user = $request->user();

        $deposits = $savingsGoal->transactions()
            ->with(['account'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($t) => [
                'id'               => $t->id,
                'amount'           => (float) $t->amount,
                'description'      => $t->description,
                'transaction_date' => $t->transaction_date?->format('Y-m-d'),
                'account_name'     => $t->account?->name,
            ]);

        return Inertia::render('Savings/SavingsShow', [
            'goal' => [
                'id'                  => $savingsGoal->id,
                'title'               => $savingsGoal->title,
                'description'         => $savingsGoal->description,
                'target_amount'       => (float) $savingsGoal->target_amount,
                'current_amount'      => (float) $savingsGoal->current_amount,
                'target_date'         => $savingsGoal->target_date?->format('Y-m-d'),
                'status'              => $savingsGoal->status,
                'progress_percentage' => $savingsGoal->progress_percentage,
                'remaining_amount'    => $savingsGoal->remaining_amount,
            ],
            'deposits' => $deposits,
            'accounts' => $user->accounts()->orderBy('name')->get(),
            'categories' => $user->categories()->orderBy('name')->get(),
            'accountTypes' => $user->accountTypes()->orderBy('name')->get(),
            'savingsGoals' => $user->savingsGoals()
                ->orderBy('title')
                ->get(['id', 'title', 'status', 'target_amount', 'current_amount']),
        ]);
    }

    public function update(Request $request, SavingsGoal $savingsGoal)
    {
        $this->authorizeGoal($request, $savingsGoal);

        $validated = $request->validate([
            'title'         => ['sometimes', 'required', 'string', 'max:255'],
            'description'   => ['nullable', 'string', 'max:1000'],
            'target_amount' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'target_date'   => ['nullable', 'date'],
        ]);

        $savingsGoal->update($validated);
        $savingsGoal->refresh()->syncStatus();

        return back();
    }

    public function destroy(Request $request, SavingsGoal $savingsGoal)
    {
        $this->authorizeGoal($request, $savingsGoal);

        DB::transaction(function () use ($savingsGoal) {
            $savingsGoal->transactions()->update(['savings_goal_id' => null]);
            $savingsGoal->delete();
        });

        return redirect()
            ->route('savings.index')
            ->with('success', 'Savings goal deleted.');
    }

    private function authorizeGoal(Request $request, SavingsGoal $goal): void
    {
        if ($goal->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}