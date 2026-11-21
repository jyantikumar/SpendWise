<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\RecurringTransaction;
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
        $user =$request->user();

        $search    =$request->input('search');
        $type      =$request->input('type');
        $accountId =$request->input('account_id');
        $range     =$request->input('range', 'this_month');

        $customStartDate =$request->input('start_date');
        $customEndDate   =$request->input('end_date');

        // Resolve date boundaries based on selected range
        if ($range === 'custom' && $customStartDate &&$customEndDate) {
            $startDate = Carbon::parse($customStartDate)->startOfDay();
            $endDate   = Carbon::parse($customEndDate)->endOfDay();
        } elseif ($range === 'all') {$startDate = null;
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

        // 1. Build filtered query for logged transactions
        $query = Transaction::where('user_id',$user->id)
            ->when($search, function ($q, $search) {$q->where(function ($sub) use ($search) {
                    $sub->where('description', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%");
                });
            })
            ->when($type, function ($q,$type) {
                $q->where('type',$type);
            })
            ->when($accountId, function ($q, $accountId) {$q->where(function ($sub) use ($accountId) {
                    $sub->where('account_id',$accountId)
                        ->orWhere('destination_account_id', $accountId);
                });
            })
            ->when($startDate, function ($q) use ($startDate) {
                $q->whereDate('transaction_date', '>=',$startDate->format('Y-m-d'));
            })
            ->when($endDate, function ($q) use ($endDate) {
                $q->whereDate('transaction_date', '<=',$endDate->format('Y-m-d'));
            });

        // 2. Core KPI Calculations
        $totalIncome  = (clone $query)->where('type', 'income')->sum('amount');$totalExpense = (clone $query)->where('type', 'expense')->sum('amount');$netCashFlow  = $totalIncome -$totalExpense;

        if ($accountId &&$accountId !== 'all') {
            $totalBalance = Account::where('user_id',$user->id)
                ->where('id', $accountId)
                ->value('balance') ?? 0;
        } else {
            $totalBalance = Account::where('user_id',$user->id)
                ->where('is_active', true)
                ->sum('balance');
        }

        // 3. Calculate Recurring Instances for Projected Month
        $todayStr = Carbon::today()->format('Y-m-d');$endOfMonthStr = Carbon::now()->endOfMonth()->format('Y-m-d');

        $recurringRules = RecurringTransaction::where('user_id',$user->id)
            ->where('is_active', true)
            ->get();

        $paidTransactions = Transaction::where('user_id',$user->id)
            ->whereNotNull('recurring_transaction_id')
            ->get(['recurring_transaction_id', 'transaction_date'])
            ->groupBy('recurring_transaction_id');

        $pendingInstances = [];$projectedRecurringNet = 0;

        foreach ($recurringRules as$rule) {
            $startDateStr = optional($rule->start_date)->format('Y-m-d');
            $endDateStr   = optional($rule->end_date)->format('Y-m-d');
            if (!$startDateStr) continue;

            $skippedDates =$rule->skipped_dates ?? [];
            $weekdays     = is_array($rule->weekdays) ?$rule->weekdays : [];

            $currentDueDate = Carbon::parse($startDateStr)->startOfDay();

            $rulePaidDates = $paidTransactions->get($rule->id, collect())
                ->pluck('transaction_date')
                ->map(fn ($d) => Carbon::parse($d)->format('Y-m-d'))
                ->toArray();

            while (
                $currentDueDate->format('Y-m-d') <=$endOfMonthStr
                && (!$endDateStr || $currentDueDate->format('Y-m-d') <=$endDateStr)
            ) {
                $formattedDate =$currentDueDate->format('Y-m-d');

                if ($formattedDate >=$todayStr) {
                    $isPaid    = in_array($formattedDate, $rulePaidDates, true);$isSkipped = in_array($formattedDate,$skippedDates, true);

                    if (!$isPaid && !$isSkipped) {
                        $amt = (float)$rule->amount;
                        if ($rule->type === 'income') {
                            $projectedRecurringNet +=$amt;
                        } else {
                            $projectedRecurringNet -=$amt;
                        }

                        $pendingInstances[] = [
                            'rule_id'      => $rule->id,
                            'title'        => $rule->title,
                            'amount'       => $amt,
                            'type'         => $rule->type,
                            'date'         => $formattedDate,
                            'is_recurring' => true,
                        ];
                    }
                }

                $currentDueDate = RecurringTransaction::advanceDate($currentDueDate,
                    $rule->frequency,$weekdays
                );
            }
        }

        usort($pendingInstances, fn ($a,$b) => strcmp($a['date'],$b['date']));

        // 4. Format Recorded Transactions for Sheet Display
        $periodTransactions = (clone$query)
            ->get(['id', 'description', 'amount', 'type', 'transaction_date'])
            ->map(function ($tx) {
                $dateStr = is_string($tx->transaction_date) 
                    ? explode('T', $tx->transaction_date)[0] : Carbon::parse($tx->transaction_date)->format('Y-m-d');

                return [
                    'id'           => $tx->id,
                    'title'        => $tx->description ?: ($tx->type === 'income' ? 'Income' : 'Expense'),
                    'amount'       => (float) $tx->amount,
                    'type'         => $tx->type,
                    'date'         => $dateStr,
                    'is_recurring' => false,
                ];
            })
            ->toArray();

        $kpis = [
            'totalBalance'          => $totalBalance,
            'netCashFlow'           => $netCashFlow,
            'totalIncome'           => $totalIncome,
            'totalExpense'          => $totalExpense,
            'projectedRecurringNet' => $projectedRecurringNet,
            'projectedAmount'       => $netCashFlow +$projectedRecurringNet,
        ];

        // 5. Build Daily Trends for Net Cash Flow Sparkline/Drawer
        $dailyTrendsRaw = (clone$query)
            ->select(
                DB::raw('DATE(transaction_date) as date'),
                DB::raw("SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income"),
                DB::raw("SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense")
            )
            ->groupBy(DB::raw('DATE(transaction_date)'))
            ->orderBy(DB::raw('DATE(transaction_date)'), 'asc')
            ->get();

        $dailyTrends = $dailyTrendsRaw->map(function ($row) {
            $parsedDate = Carbon::parse($row->date);
            return [
                'rawDate'          => $row->date,
                'transaction_date' => $parsedDate->format('M d'),
                'income'           => (float) $row->income,
                'expense'          => (float) $row->expense,
                'net'              => (float) $row->income - (float)$row->expense,
            ];
        });

        // 6. Paginated transactions list
        $transactions = (clone$query)
            ->with(['account', 'destinationAccount', 'category', 'savingsGoal'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(10)
            ->withQueryString();

        $accounts   =$user->accounts()->orderBy('name')->get();
        $categories =$user->categories()->orderBy('name')->get();
        $savingsGoals =$user->savingsGoals()
            ->where('status', 'active')
            ->orderBy('title')
            ->get(['id', 'title', 'status', 'target_amount', 'current_amount']);

        return Inertia::render('Transactions/Index', [
            'transactions'       => $transactions,
            'accounts'           => $accounts,
            'categories'         => $categories,
            'savingsGoals'       => $savingsGoals,
            'kpis'               => $kpis,
            'dailyTrends'        => $dailyTrends,
            'recurringInstances' => $pendingInstances,
            'periodTransactions' => $periodTransactions,
            'filters'            => [
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
        $user =$request->user();

        $validated =$request->validate([
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
            'notes'            => ['nullable', 'string', 'max:2000'],
            'transaction_date' => ['required', 'date'],
        ]);

        if ($validated['type'] === 'savings' && empty($validated['savings_goal_id'])) {
            throw ValidationException::withMessages([
                'savings_goal_id' => 'A savings goal must be selected for savings deposits.',
            ]);
        }

        if ($validated['type'] !== 'savings') {$validated['savings_goal_id'] = null;
        }

        if ($validated['type'] !== 'transfer') {$validated['destination_account_id'] = null;
        }

        DB::transaction(function () use ($user, $validated) {$tx = $user->transactions()->create($validated);
            $this->applyEffects($tx);
        });

        return back();
    }

    public function update(Request $request, Transaction$transaction)
    {
        $user =$request->user();

        if ($transaction->user_id !==$user->id) {
            abort(403);
        }

        $validated =$request->validate([
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
            'notes'            => ['nullable', 'string', 'max:2000'],
            'transaction_date' => ['required', 'date'],
        ]);

        if ($validated['type'] === 'savings' && empty($validated['savings_goal_id'])) {
            throw ValidationException::withMessages([
                'savings_goal_id' => 'A savings goal must be selected for savings deposits.',
            ]);
        }

        if ($validated['type'] !== 'savings') {$validated['savings_goal_id'] = null;
        }

        if ($validated['type'] !== 'transfer') {$validated['destination_account_id'] = null;
        }

        DB::transaction(function () use ($transaction,$validated) {
            $this->applyEffects($transaction, reverse: true);
            $transaction->update($validated);
            $this->applyEffects($transaction->refresh());
        });

        return back();
    }

    public function destroy(Request $request, Transaction$transaction)
    {
        if ($transaction->user_id !==$request->user()->id) {
            abort(403);
        }

        DB::transaction(function () use ($transaction) {$this->applyEffects($transaction, reverse: true);$transaction->delete();
        });

        return back();
    }

    private function applyEffects(Transaction $tx, bool$reverse = false): void
    {
        $sign   =$reverse ? -1 : 1;
        $amount = (float)$tx->amount;

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
                $account->decrement('balance', $sign * $amount);

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
                        $goal->increment('current_amount',$amount);
                    } else {
                        $goal->decrement('current_amount',$amount);
                    }

                    $goal->refresh()->syncStatus();
                }
                break;
        }
    }
}