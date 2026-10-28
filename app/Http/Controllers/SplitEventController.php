<?php

namespace App\Http\Controllers;

use App\Models\SplitEvent;
use App\Models\SplitExpense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SplitEventController extends Controller
{
    public function index()
    {
        $events = SplitEvent::with(['expenses.shares', 'settlements'])
            ->latest('event_date')
            ->get();

        return Inertia::render('Splits/Index', [
            'events' => $events,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
        ]);

        SplitEvent::create($validated);

        return redirect()->back()->with('success', 'Split event created successfully.');
    }

    public function show(SplitEvent $splitEvent)
    {
        $splitEvent->load(['expenses.shares', 'settlements']);

        $balances = [];
        $totalSpent = 0;
        
        $totalPaidByPerson = [];
        $totalShareByPerson = [];
        $totalSettledPaid = [];
        $totalSettledReceived = [];
        $participantItemizedShares = [];

        $addBalance = function (&$arr, $name, $amount) {
            $arr[$name] = ($arr[$name] ?? 0) + $amount;
        };

        foreach ($splitEvent->expenses as $expense) {
            $totalSpent += $expense->amount;
            $addBalance($balances, $expense->paid_by, $expense->amount);
            
            $totalPaidByPerson[$expense->paid_by] = ($totalPaidByPerson[$expense->paid_by] ?? 0) + $expense->amount;

            $participantCount = $expense->shares->count();

            foreach ($expense->shares as $share) {
                $addBalance($balances, $share->participant_name, -$share->share_amount);
                
                $totalShareByPerson[$share->participant_name] = ($totalShareByPerson[$share->participant_name] ?? 0) + $share->share_amount;

                // Build itemized math record for the breakdown view
                $participantItemizedShares[$share->participant_name][] = [
                    'description' => $expense->description,
                    'total_amount' => $expense->amount,
                    'split_count' => $participantCount,
                    'share_amount' => $share->share_amount,
                ];
            }
        }

        foreach ($splitEvent->settlements as $settlement) {
            $addBalance($balances, $settlement->payer_name, $settlement->amount);
            $addBalance($balances, $settlement->payee_name, -$settlement->amount);

            $totalSettledPaid[$settlement->payer_name] = ($totalSettledPaid[$settlement->payer_name] ?? 0) + $settlement->amount;
            $totalSettledReceived[$settlement->payee_name] = ($totalSettledReceived[$settlement->payee_name] ?? 0) + $settlement->amount;
        }

        // Pairwise Debt Calculation
        $debtors = [];
        $creditors = [];
        foreach ($balances as $name => $bal) {
            $rounded = round($bal, 2);
            if ($rounded < 0) {
                $debtors[$name] = abs($rounded);
            } elseif ($rounded > 0) {
                $creditors[$name] = $rounded;
            }
        }

        $debtBreakdown = [];
        foreach ($debtors as $debtor => $debtAmount) {
            foreach ($creditors as $creditor => $creditAmount) {
                if ($debtAmount <= 0) break;
                if ($creditAmount <= 0) continue;

                $settleAmount = min($debtAmount, $creditAmount);
                if ($settleAmount > 0) {
                    $debtBreakdown[] = [
                        'from' => $debtor,
                        'to' => $creditor,
                        'amount' => $settleAmount,
                    ];
                    $debtors[$debtor] -= $settleAmount;
                    $debtAmount -= $settleAmount;
                    $creditors[$creditor] -= $settleAmount;
                }
            }
        }

        return Inertia::render('Splits/Show', [
            'splitEvent' => $splitEvent,
            'totalSpent' => $totalSpent,
            'balances' => $balances,
            'debtBreakdown' => $debtBreakdown,
            'itemizedShares' => $participantItemizedShares,
        ]);
    }

    public function storeExpense(Request $request, SplitEvent $splitEvent)
    {
        if ($request->has('participants') && is_string($request->participants)) {
            $participantsArray = array_filter(array_map('trim', explode(',', $request->participants)));
            $request->merge(['participants' => $participantsArray]);
        }

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'paid_by' => 'required|string',
            'participants' => 'required|array|min:1',
            'participants.*' => 'required|string',
        ]);

        $expense = $splitEvent->expenses()->create([
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'paid_by' => $validated['paid_by'],
        ]);

        $participantCount = count($validated['participants']);
        $shareAmount = round($validated['amount'] / $participantCount, 2);

        foreach ($validated['participants'] as $participant) {
            $expense->shares()->create([
                'participant_name' => $participant,
                'share_amount' => $shareAmount,
            ]);
        }

        return redirect()->back()->with('success', 'Expense logged successfully.');
    }

    public function storeSettlement(Request $request, SplitEvent $splitEvent)
    {
        $validated = $request->validate([
            'payer_name' => 'required|string',
            'payee_name' => 'required|string|different:payer_name',
            'amount' => 'required|numeric|min:0.01',
            'paid_at' => 'required|date',
        ]);

        $splitEvent->settlements()->create($validated);

        return redirect()->back()->with('success', 'Settlement recorded successfully.');
    }

    public function updateStatus(Request $request, SplitEvent $splitEvent)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,settled',
        ]);

        $splitEvent->update($validated);

        return redirect()->back()->with('success', 'Event status updated.');
    }

    /**
     * Update an existing shared expense.
     */
    public function updateExpense(Request $request, SplitEvent $splitEvent, SplitExpense $expense)
    {
        if ($request->has('participants') && is_string($request->participants)) {
            $participantsArray = array_filter(array_map('trim', explode(',', $request->participants)));
            $request->merge(['participants' => $participantsArray]);
        }

        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0.01',
            'paid_by' => 'required|string',
            'participants' => 'required|array|min:1',
            'participants.*' => 'required|string',
        ]);

        $expense->update([
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'paid_by' => $validated['paid_by'],
        ]);

        // Re-sync shares: Delete old shares and regenerate new ones
        $expense->shares()->delete();

        $participantCount = count($validated['participants']);
        $shareAmount = round($validated['amount'] / $participantCount, 2);

        foreach ($validated['participants'] as $participant) {
            $expense->shares()->create([
                'participant_name' => $participant,
                'share_amount' => $shareAmount,
            ]);
        }

        return redirect()->back()->with('success', 'Expense updated successfully.');
    }

    /**
     * Delete an existing shared expense.
     */
    public function destroyExpense(SplitEvent $splitEvent, SplitExpense $expense)
    {
        $expense->shares()->delete();
        $expense->delete();

        return redirect()->back()->with('success', 'Expense deleted successfully.');
    }
}