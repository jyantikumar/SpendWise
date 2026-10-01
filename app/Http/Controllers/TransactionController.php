<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type'                   => 'required|in:income,expense,transfer',
            'amount'                 => 'required|numeric|min:0.01',
            'category_id'            => 'nullable|required_if:type,income,expense|exists:categories,id',
            'source_account_id'      => 'required|exists:accounts,id',
            'destination_account_id' => 'nullable|required_if:type,transfer|different:source_account_id|exists:accounts,id',
            'transaction_date'       => 'required|date',
            'description'            => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($request, $validated) {
            $transaction = Transaction::create([
                'user_id'                => $request->user()->id,
                'type'                   => $validated['type'],
                'amount'                 => $validated['amount'],
                'category_id'            => $validated['category_id'] ?? null,
                'source_account_id'      => $validated['source_account_id'],
                'destination_account_id' => $validated['destination_account_id'] ?? null,
                'transaction_date'       => $validated['transaction_date'],
                'description'            => $validated['description'] ?? null,
            ]);

            // Adjust Account Balances atomically
            $sourceAccount = Account::findOrFail($validated['source_account_id']);

            if ($validated['type'] === 'income') {
                $sourceAccount->increment('balance', $validated['amount']);
            } elseif ($validated['type'] === 'expense') {
                $sourceAccount->decrement('balance', $validated['amount']);
            } elseif ($validated['type'] === 'transfer') {
                $sourceAccount->decrement('balance', $validated['amount']);
                $destinationAccount = Account::findOrFail($validated['destination_account_id']);
                $destinationAccount->increment('balance', $validated['amount']);
            }
        });

        return redirect()->back()->with('success', 'Transaction logged successfully.');
    }
}