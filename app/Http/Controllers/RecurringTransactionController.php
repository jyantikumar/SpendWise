<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\RecurringTransaction;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RecurringTransactionController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $recurringTransactions = RecurringTransaction::where('user_id', $user->id)
            ->with(['account', 'category'])
            ->orderBy('next_due_date', 'asc')
            ->get();

        $accounts = $user->accounts()->orderBy('name')->get();
        $categories = $user->categories()->orderBy('name')->get();

        return Inertia::render('Subscriptions/SubscriptionsView', [
            'recurringTransactions' => $recurringTransactions,
            'accounts'              => $accounts,
            'categories'            => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'amount'      => 'required|numeric|min:0.01',
            'type'        => 'required|in:income,expense',
            'frequency'   => 'required|in:daily,weekly,monthly,yearly',
            'account_id'  => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'auto_create' => 'boolean',
        ]);

        $validated['user_id']       = $request->user()->id;
        $validated['next_due_date'] = $validated['start_date'];

        RecurringTransaction::create($validated);

        return redirect()->back()->with('success', 'Recurring transaction created successfully.');
    }

    // Update existing recurring transaction rule
    public function update(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'amount'      => 'required|numeric|min:0.01',
            'type'        => 'required|in:income,expense',
            'frequency'   => 'required|in:daily,weekly,monthly,yearly',
            'account_id'  => 'required|exists:accounts,id',
            'category_id' => 'nullable|exists:categories,id',
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'auto_create' => 'boolean',
        ]);

        // Keep next_due_date updated if start_date is modified and no transactions have been posted yet
        if ($recurringTransaction->start_date !== $validated['start_date'] && !$recurringTransaction->last_generated_at) {
            $validated['next_due_date'] = $validated['start_date'];
        }

        $recurringTransaction->update($validated);

        return redirect()->back()->with('success', 'Recurring transaction updated successfully.');
    }

    // Skip the current payment due date without logging a transaction
    public function skip(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $nextDate = Carbon::parse($recurringTransaction->next_due_date);

        switch ($recurringTransaction->frequency) {
            case 'daily':   $nextDate->addDay(); break;
            case 'weekly':  $nextDate->addWeek(); break;
            case 'monthly': $nextDate->addMonth(); break;
            case 'yearly':  $nextDate->addYear(); break;
        }

        // Auto-pause rule if skipping pushes the next due date beyond the end_date
        $isFinished = $recurringTransaction->end_date && $nextDate->greaterThan(Carbon::parse($recurringTransaction->end_date));

        $recurringTransaction->update([
            'next_due_date' => $nextDate,
            'is_active'     => $isFinished ? false : $recurringTransaction->is_active,
        ]);

        return redirect()->back()->with('success', 'Payment skipped for this period.');
    }

    // Delete recurring transaction rule
    public function destroy(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        $recurringTransaction->delete();

        return redirect()->back()->with('success', 'Recurring transaction deleted successfully.');
    }

    // Manual execution trigger ("Pay Now" button)
    public function process(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        DB::transaction(function () use ($recurringTransaction) {
            // 1. Create the Transaction record
            Transaction::create([
                'user_id'          => $recurringTransaction->user_id,
                'account_id'       => $recurringTransaction->account_id,
                'category_id'      => $recurringTransaction->category_id,
                'amount'           => $recurringTransaction->amount,
                'type'             => $recurringTransaction->type,
                'description'      => $recurringTransaction->title . ' (Rec.)',
                'transaction_date' => Carbon::now()->format('Y-m-d'),
            ]);

            // 2. Adjust account balance accordingly
            $account = Account::findOrFail($recurringTransaction->account_id);
            if ($recurringTransaction->type === 'income') {
                $account->increment('balance', $recurringTransaction->amount);
            } elseif ($recurringTransaction->type === 'expense') {
                $account->decrement('balance', $recurringTransaction->amount);
            }

            // 3. Advance next due date based on frequency
            $nextDate = Carbon::parse($recurringTransaction->next_due_date);
            switch ($recurringTransaction->frequency) {
                case 'daily':   $nextDate->addDay(); break;
                case 'weekly':  $nextDate->addWeek(); break;
                case 'monthly': $nextDate->addMonth(); break;
                case 'yearly':  $nextDate->addYear(); break;
            }

            // Auto-pause rule if advancing exceeds the required end_date
            $isFinished = $recurringTransaction->end_date && $nextDate->greaterThan(Carbon::parse($recurringTransaction->end_date));

            $recurringTransaction->update([
                'last_generated_at' => Carbon::now(),
                'next_due_date'     => $nextDate,
                'is_active'         => $isFinished ? false : $recurringTransaction->is_active,
            ]);
        });

        return redirect()->back()->with('success', 'Transaction processed successfully.');
    }

    // Toggle rule active status
 // Toggle rule active status
    public function toggle(Request $request, RecurringTransaction $recurringTransaction)
    {
        if ($recurringTransaction->user_id !== $request->user()->id) {
            abort(403);
        }

        // Prevent activation if the end date has already passed
        $isExpired = $recurringTransaction->end_date && Carbon::parse($recurringTransaction->end_date)->isPast();

        if (!$recurringTransaction->is_active && $isExpired) {
            return redirect()->back()->with('error', 'Cannot activate a recurring rule whose end date has passed.');
        }

        $recurringTransaction->update([
            'is_active' => !$recurringTransaction->is_active,
        ]);

        return redirect()->back()->with('success', 'Schedule status updated.');
    }
}