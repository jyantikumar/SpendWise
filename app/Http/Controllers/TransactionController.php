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

        $transactions = Transaction::where('user_id', $user->id)
            ->with(['account', 'category'])
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
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'account_id'       => ['required', 'exists:accounts,id'],
            'category_id'      => ['nullable', 'exists:categories,id'],
            'type'             => ['required', 'in:income,expense,transfer'],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'description'      => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
        ]);

        DB::transaction(function () use ($request, $validated) {
            // 1. Create the transaction record
            $request->user()->transactions()->create($validated);

            // 2. Adjust account balance
            $account = Account::findOrFail($validated['account_id']);

            if ($validated['type'] === 'income') {
                $account->increment('balance', $validated['amount']);
            } elseif ($validated['type'] === 'expense' || $validated['type'] === 'transfer') {
                $account->decrement('balance', $validated['amount']);
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
            'account_id'       => ['required', 'exists:accounts,id'],
            'category_id'      => ['nullable', 'exists:categories,id'],
            'type'             => ['required', 'in:income,expense,transfer'],
            'amount'           => ['required', 'numeric', 'min:0.01'],
            'description'      => ['nullable', 'string', 'max:255'],
            'transaction_date' => ['required', 'date'],
        ]);

        DB::transaction(function () use ($transaction, $validated) {
            // 1. Revert previous transaction impact on the original account
            $oldAccount = Account::findOrFail($transaction->account_id);
            if ($transaction->type === 'income') {
                $oldAccount->decrement('balance', $transaction->amount);
            } elseif ($transaction->type === 'expense' || $transaction->type === 'transfer') {
                $oldAccount->increment('balance', $transaction->amount);
            }

            // 2. Update transaction
            $transaction->update($validated);

            // 3. Apply new transaction impact on the target account
            $newAccount = Account::findOrFail($validated['account_id']);
            if ($validated['type'] === 'income') {
                $newAccount->increment('balance', $validated['amount']);
            } elseif ($validated['type'] === 'expense' || $validated['type'] === 'transfer') {
                $newAccount->decrement('balance', $validated['amount']);
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

            // Revert transaction impact before deleting
            if ($transaction->type === 'income') {
                $account->decrement('balance', $transaction->amount);
            } elseif ($transaction->type === 'expense' || $transaction->type === 'transfer') {
                $account->increment('balance', $transaction->amount);
            }

            $transaction->delete();
        });

        return back()->with('success', 'Transaction deleted successfully.');
    }
}