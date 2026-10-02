<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $search    = $request->input('search');
        $type      = $request->input('type');
        $accountId = $request->input('account_id');
        $startDate = $request->input('start_date');
        $endDate   = $request->input('end_date');

        $transactions = Transaction::where('user_id', $user->id)
           ->with(['account', 'destinationAccount', 'category'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                      ->orWhere('reference_number', 'like', "%{$search}%");
                });
            })
            ->when($type, function ($query, $type) {
                $query->where('type', $type);
            })
            ->when($accountId, function ($query, $accountId) {
                $query->where(function ($q) use ($accountId) {
                    $q->where('account_id', $accountId)
                      ->orWhere('destination_account_id', $accountId);
                });
            })
            ->when($startDate, function ($query, $startDate) {
                $query->whereDate('transaction_date', '>=', $startDate);
            })
            ->when($endDate, function ($query, $endDate) {
                $query->whereDate('transaction_date', '<=', $endDate);
            })
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        $accounts = $user->accounts()->orderBy('name')->get();
        $categories = $user->categories()->orderBy('name')->get();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'accounts'     => $accounts,
            'categories'   => $categories,
            'filters'      => [
                'search'     => $search ?? '',
                'type'       => $type ?? 'all',
                'account_id' => $accountId ?? 'all',
                'start_date' => $startDate ?? '',
                'end_date'   => $endDate ?? '',
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
                // Deduct from source account
                $account->decrement('balance', $validated['amount']);

                // Add to destination account
                if (!empty($validated['destination_account_id'])) {
                    $destAccount = Account::findOrFail($validated['destination_account_id']);
                    $destAccount->increment('balance', $validated['amount']);
                }
            }
        });

        return back()->with('success', 'Transaction logged successfully.');
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
            // 1. Revert previous transaction impacts
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

            // 2. Update transaction
            $transaction->update($validated);

            // 3. Apply new transaction impacts
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