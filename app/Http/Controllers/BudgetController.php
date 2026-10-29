<?php

namespace App\Http\Controllers;

use App\Models\Budget;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BudgetController extends Controller
{
    public function index(Request $request)
    {
        $user   = $request->user();
        $search = $request->input('search');
        $period = $request->input('period', 'all');

        $budgets = $user->budgets()
            ->with('category')
            ->when($search, fn ($q) => $q->where(function ($sub) use ($search) {
                $sub->where('name', 'like', "%{$search}%")
                    ->orWhereHas('category', fn ($c) => $c->where('name', 'like', "%{$search}%"));
            }))
            ->when($period !== 'all', fn ($q) => $q->where('period', $period))
            ->orderByDesc('start_date')
            ->get()
            ->map(fn (Budget $b) => [
                'id'                  => $b->id,
                'name'                => $b->name,
                'amount'              => (float) $b->amount,
                'period'              => $b->period,
                'start_date'          => $b->start_date?->format('Y-m-d'),
                'end_date'            => $b->end_date?->format('Y-m-d'),
                'rollover'            => (bool) $b->rollover,
                'category_id'         => $b->category_id,
                'category_name'       => $b->category?->name,
                'category_color'      => $b->category?->color,
                'spent'               => $b->spentAmount(),
                'remaining'           => $b->remainingAmount(),
                'utilization'         => $b->utilizationPercentage(),
            ]);

        $totalAllocated = $budgets->sum('amount');
        $totalSpent     = $budgets->sum('spent');
        $totalRemaining = $totalAllocated - $totalSpent;
        $overallPct     = $totalAllocated > 0
            ? (int) round(($totalSpent / $totalAllocated) * 100)
            : 0;

        return Inertia::render('Budgets/BudgetIndex', [
    'budgets' => $budgets,
    'summary' => [
        'total_allocated' => (float) $totalAllocated,
        'total_spent'     => (float) $totalSpent,
        'total_remaining' => (float) $totalRemaining,
        'overall_pct'     => (float) $overallPct,
    ],
    'filters' => [
        'search' => $search ?? '',
        'period' => $period,
    ],
    'categories' => $user->categories()
        ->where('type', 'expense')
        ->orderBy('name')
        ->get(['id', 'name', 'type', 'color']),
]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'        => ['nullable', 'string', 'max:255'],
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where('user_id', $user->id),
            ],
            'amount'      => ['required', 'numeric', 'min:0.01'],
            'period'      => ['required', 'in:monthly,weekly,custom'],
            'start_date'  => ['required', 'date'],
            'end_date'    => ['required_if:period,custom', 'nullable', 'date', 'after_or_equal:start_date'],
            'rollover'    => ['boolean'],
        ]);

        $user->budgets()->create($validated);

        return redirect()->route('budgets.index')->with('success', 'Budget created.');
    }

    public function show(Request $request, Budget $budget)
    {
        $this->authorizeBudget($request, $budget);
        $user = $request->user();

        [$from, $to] = $budget->resolveDateRange();

        $transactions = $user->transactions()
            ->with(['account', 'category'])
            ->where('type', 'expense')
            ->when($budget->category_id, fn ($q) => $q->where('category_id', $budget->category_id))
            ->whereBetween('transaction_date', [$from, $to])
            ->orderBy('transaction_date', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Budgets/BudgetShow', [
            'budget' => [
                'id'             => $budget->id,
                'name'           => $budget->name,
                'amount'         => (float) $budget->amount,
                'period'         => $budget->period,
                'start_date'     => $budget->start_date?->format('Y-m-d'),
                'end_date'       => $budget->end_date?->format('Y-m-d'),
                'rollover'       => (bool) $budget->rollover,
                'category_id'    => $budget->category_id,
                'category_name'  => $budget->category?->name,
                'category_color' => $budget->category?->color,
                'spent'          => $budget->spentAmount(),
                'remaining'      => $budget->remainingAmount(),
                'utilization'    => $budget->utilizationPercentage(),
            ],
            'transactions' => $transactions,
            'accounts'     => $user->accounts()->orderBy('name')->get(),
            'categories'   => $user->categories()->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Budget $budget)
    {
        $this->authorizeBudget($request, $budget);
        $user = $request->user();

        $validated = $request->validate([
            'name'        => ['nullable', 'string', 'max:255'],
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where('user_id', $user->id),
            ],
            'amount'      => ['required', 'numeric', 'min:0.01'],
            'period'      => ['required', 'in:monthly,weekly,custom'],
            'start_date'  => ['required', 'date'],
            'end_date'    => ['required_if:period,custom', 'nullable', 'date', 'after_or_equal:start_date'],
            'rollover'    => ['boolean'],
        ]);

        $budget->update($validated);

        return redirect()->back()->with('success', 'Budget updated.');
    }

    public function destroy(Request $request, Budget $budget)
    {
        $this->authorizeBudget($request, $budget);

        $budget->delete();

        return redirect()->route('budgets.index')->with('success', 'Budget deleted.');
    }

    private function authorizeBudget(Request $request, Budget $budget): void
    {
        if ($budget->user_id !== $request->user()->id) {
            abort(403);
        }
    }
}