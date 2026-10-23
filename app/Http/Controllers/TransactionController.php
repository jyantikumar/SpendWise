<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
            ->with(['account', 'destinationAccount', 'category'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        $accounts   = $user->accounts()->orderBy('name')->get();
        $categories = $user->categories()->orderBy('name')->get();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'accounts'     => $accounts,
            'categories'   => $categories,
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
        $validated = $request->validate([
            'account_id'             => ['required', 'exists:accounts,id'],
            'destination_account_id' => ['required_if:type,transfer', 'nullable', 'different:account_id', 'exists:accounts,id'],
            'category_id'            => ['nullable', 'exists:categories,id'],
            'type'                   => ['required', 'in:income,expense,transfer'],
            'amount'                 => ['required', 'numeric', 'min:0.01'],
            'description'            => ['nullable', 'string', 'max:255'],
            'transaction_date'       => ['required', 'date'],
        ]);

        DB::transaction(function () use ($request, $validated) {
            $request->user()->transactions()->create($validated);

            $account = Account::findOrFail($validated['account_id']);

            if ($validated['type'] === 'income') {
                $account->increment('balance', $validated['amount']);
            } elseif ($validated['type'] === 'expense') {
                $account->decrement('balance', $validated['amount']);
            } elseif ($validated['type'] === 'transfer') {
                $account->decrement('balance', $validated['amount']);

                if (!empty($validated['destination_account_id'])) {
                    $destAccount = Account::findOrFail($validated['destination_account_id']);
                    $destAccount->increment('balance', $validated['amount']);
                }
            }
        });

        return back();
    }

    public function update(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'account_id'             => ['required', 'exists:accounts,id'],
            'destination_account_id' => ['required_if:type,transfer', 'nullable', 'different:account_id', 'exists:accounts,id'],
            'category_id'            => ['nullable', 'exists:categories,id'],
            'type'                   => ['required', 'in:income,expense,transfer'],
            'amount'                 => ['required', 'numeric', 'min:0.01'],
            'description'            => ['nullable', 'string', 'max:255'],
            'transaction_date'       => ['required', 'date'],
        ]);

        DB::transaction(function () use ($transaction, $validated) {
            $oldAccount = Account::findOrFail($transaction->account_id);
            if ($transaction->type === 'income') {
                $oldAccount->decrement('balance', $transaction->amount);
            } elseif ($transaction->type === 'expense') {
                $oldAccount->increment('balance', $transaction->amount);
            } elseif ($transaction->type === 'transfer') {
                $oldAccount->increment('balance', $transaction->amount);
                if ($transaction->destination_account_id) {
                    $oldDestAccount = Account::findOrFail($transaction->destination_account_id);
                    $oldDestAccount->decrement('balance', $transaction->amount);
                }
            }

            $transaction->update($validated);

            $newAccount = Account::findOrFail($validated['account_id']);
            if ($validated['type'] === 'income') {
                $newAccount->increment('balance', $validated['amount']);
            } elseif ($validated['type'] === 'expense') {
                $newAccount->decrement('balance', $validated['amount']);
            } elseif ($validated['type'] === 'transfer') {
                $newAccount->decrement('balance', $validated['amount']);
                if (!empty($validated['destination_account_id'])) {
                    $newDestAccount = Account::findOrFail($validated['destination_account_id']);
                    $newDestAccount->increment('balance', $validated['amount']);
                }
            }
        });

        return back()->with('success', 'Transaction updated successfully.');
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            abort(403);
        }

        DB::transaction(function () use ($transaction) {
            $account = Account::findOrFail($transaction->account_id);

            if ($transaction->type === 'income') {
                $account->decrement('balance', $transaction->amount);
            } elseif ($transaction->type === 'expense') {
                $account->increment('balance', $transaction->amount);
            } elseif ($transaction->type === 'transfer') {
                $account->increment('balance', $transaction->amount);
                if ($transaction->destination_account_id) {
                    $destAccount = Account::findOrFail($transaction->destination_account_id);
                    $destAccount->decrement('balance', $transaction->amount);
                }
            }

            $transaction->delete();
        });

        return back()->with('success', 'Transaction deleted successfully.');
    }
}