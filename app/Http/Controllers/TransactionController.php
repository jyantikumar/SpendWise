<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\SavingsGoal;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Carbon\Carbon;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $search    = $request->input('search');
        $type      = $request->input('type');
        $accountId = $request->input('account_id');
        $range     = $request->input('range', 'this_month');

        $customStartDate = $request->input('start_date');
        $customEndDate   = $request->input('end_date');

        // Resolve date boundaries based on selected range
        if ($range === 'custom' && $customStartDate && $customEndDate) {
            $startDate = Carbon::parse($customStartDate)->startOfDay();
            $endDate   = Carbon::parse($customEndDate)->endOfDay();
        } elseif ($range === 'all') {
            $startDate = null;
            $endDate   = null;
        } else {
            [$startDate, $endDate] = match ($range) {
                'this_day'     => [now()->startOfDay(), now()->endOfDay()],
                'this_week'    => [now()->startOfWeek(), now()->endOfWeek()],
                'last_30_days' => [now()->subDays(30)->startOfDay(), now()->endOfDay()],
                'this_year'    => [now()->startOfYear(), now()->endOfYear()],
                default        => [now()->startOfMonth(), now()->endOfMonth()], // 'this_month'
            };
        }

        // 1. Build filtered query
        $query = Transaction::where('user_id', $user->id)
            ->when($search, function ($q, $search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('description', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%");
                });
            })
            ->when($type, function ($q, $type) {
                $q->where('type', $type);
            })
            ->when($accountId, function ($q, $accountId) {
                $q->where(function ($sub) use ($accountId) {
                    $sub->where('account_id', $accountId)
                        ->orWhere('destination_account_id', $accountId);
                });
            })
            ->when($startDate, function ($q) use ($startDate) {
                $q->whereDate('transaction_date', '>=', $startDate->format('Y-m-d'));
            })
            ->when($endDate, function ($q) use ($endDate) {
                $q->whereDate('transaction_date', '<=', $endDate->format('Y-m-d'));
            });

        // 2. Dynamic KPI Calculations
        $totalIncome  = (clone $query)->where('type', 'income')->sum('amount');
        $totalExpense = (clone $query)->where('type', 'expense')->sum('amount');

        // Total balance reflects portfolio or selected account balance
        if ($accountId && $accountId !== 'all') {
            $totalBalance = Account::where('user_id', $user->id)
                ->where('id', $accountId)
                ->value('balance') ?? 0;
        } else {
            $totalBalance = Account::where('user_id', $user->id)
                ->where('is_active', true)
                ->sum('balance');
        }

        $kpis = [
            'totalBalance' => $totalBalance,
            'netCashFlow'  => $totalIncome - $totalExpense,
            'totalIncome'  => $totalIncome,
            'totalExpense' => $totalExpense,
        ];

        // 3. Paginated transactions
        $transactions = (clone $query)
            ->with(['account', 'destinationAccount', 'category', 'savingsGoal'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        $accounts   = $user->accounts()->orderBy('name')->get();
        $categories = $user->categories()->orderBy('name')->get();

        // Active savings goals for the deposit selector in the form modal
        $savingsGoals = $user->savingsGoals()
    ->where('status', 'active')
    ->orderBy('title')
    ->get(['id', 'title', 'status', 'target_amount', 'current_amount']);
        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'accounts'     => $accounts,
            'categories'   => $categories,
            'savingsGoals' => $savingsGoals,
            'kpis'         => $kpis,
            'filters'      => [
                'search'     => $search ?? '',
                'type'       => $type ?? 'all',
                'account_id' => $accountId ?? 'all',
                'range'      => $range,
                'start_date' => $customStartDate ?? ($startDate ? $startDate->format('Y-m-d') : ''),
                'end_date'   => $customEndDate ?? ($endDate ? $endDate->format('Y-m-d') : ''),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where('user_id', $user->id),
            ],
            'destination_account_id' => [
                'required_if:type,transfer',
                'nullable',
                'different:account_id',
                Rule::exists('accounts', 'id')->where('user_id', $user->id),
            ],
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where('user_id', $user->id),
            ],
            'savings_goal_id' => [
                'nullable',
                'required_if:type,savings',
                Rule::exists('savings_goals', 'id')->where('user_id', $user->id),
            ],
            'type'             => ['required', 'in:income,expense,transfer,savings'],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'description'      => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
        ]);

        // Guard: savings must have a goal. Validation above should catch it,
        // but this defends against edge cases where validate() drops empty keys.
        if ($validated['type'] === 'savings' && empty($validated['savings_goal_id'])) {
            throw ValidationException::withMessages([
                'savings_goal_id' => 'A savings goal must be selected for savings deposits.',
            ]);
        }

        // Strip the goal link if it isn't a savings deposit
        if ($validated['type'] !== 'savings') {
            $validated['savings_goal_id'] = null;
        }

        // Strip destination account if it isn't a transfer
        if ($validated['type'] !== 'transfer') {
            $validated['destination_account_id'] = null;
        }

        DB::transaction(function () use ($user, $validated) {
            $tx = $user->transactions()->create($validated);
            $this->applyEffects($tx);
        });

        return back();
    }

    public function update(Request $request, Transaction $transaction)
    {
        $user = $request->user();

        if ($transaction->user_id !== $user->id) {
            abort(403);
        }

        $validated = $request->validate([
            'account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where('user_id', $user->id),
            ],
            'destination_account_id' => [
                'required_if:type,transfer',
                'nullable',
                'different:account_id',
                Rule::exists('accounts', 'id')->where('user_id', $user->id),
            ],
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where('user_id', $user->id),
            ],
            'savings_goal_id' => [
                'nullable',
                'required_if:type,savings',
                Rule::exists('savings_goals', 'id')->where('user_id', $user->id),
            ],
            'type'             => ['required', 'in:income,expense,transfer,savings'],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'description'      => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
        ]);

        // Guard: savings must have a goal.
        if ($validated['type'] === 'savings' && empty($validated['savings_goal_id'])) {
            throw ValidationException::withMessages([
                'savings_goal_id' => 'A savings goal must be selected for savings deposits.',
            ]);
        }

        // Strip the goal link if it isn't a savings deposit
        if ($validated['type'] !== 'savings') {
            $validated['savings_goal_id'] = null;
        }

        // Strip destination account if it isn't a transfer
        if ($validated['type'] !== 'transfer') {
            $validated['destination_account_id'] = null;
        }

        DB::transaction(function () use ($transaction, $validated) {
            // 1. Reverse the old side-effects (using the transaction's current state)
            $this->applyEffects($transaction, reverse: true);

            // 2. Persist new values
            $transaction->update($validated);

            // 3. Apply the new side-effects
            $this->applyEffects($transaction->refresh());
        });

        return back();
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        DB::transaction(function () use ($transaction) {
            // Reverse balance + savings side-effects before deleting
            $this->applyEffects($transaction, reverse: true);
            $transaction->delete();
        });

        return back();
    }

    /**
     * Apply (or reverse) the balance and savings-goal side-effects for a transaction.
     *
     * @param  Transaction  $tx
     * @param  bool         $reverse  When true, undo the effects (used by update/destroy).
     */
    private function applyEffects(Transaction $tx, bool $reverse = false): void
    {
        $sign   = $reverse ? -1 : 1;
        $amount = (float) $tx->amount;

        $account = Account::findOrFail($tx->account_id);

        switch ($tx->type) {
            case 'income':
                $account->increment('balance', $sign * $amount);
                break;

            case 'expense':
                $account->decrement('balance', $sign * $amount);
                break;

            case 'transfer':
                $account->decrement('balance', $sign * $amount);

                if (!empty($tx->destination_account_id)) {
                    Account::findOrFail($tx->destination_account_id)
                        ->increment('balance', $sign * $amount);
                }
                break;

            case 'savings':
                // Deposit leaves the funding account...
                $account->decrement('balance', $sign * $amount);

                // ...and flows into the savings goal.
                if (empty($tx->savings_goal_id)) {
                    Log::warning('Savings transaction without goal', [
                        'transaction_id' => $tx->id,
                        'user_id'        => $tx->user_id,
                    ]);
                    break;
                }

                $goal = SavingsGoal::find($tx->savings_goal_id);

                if ($goal) {
                    if ($sign > 0) {
                        $goal->increment('current_amount', $amount);
                    } else {
                        $goal->decrement('current_amount', $amount);
                    }

                    // Auto-flip status between active / completed.
                    $goal->refresh()->syncStatus();
                }
                break;
        }
    }
}