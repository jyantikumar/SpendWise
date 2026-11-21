<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\AccountType;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\RecurringTransaction;
use App\Models\Budget;
use App\Models\SavingsGoal;
use App\Models\WishlistItem;
use App\Models\WishlistPrice;
use App\Models\SplitEvent;
use App\Models\SplitExpense;
use App\Models\SplitExpenseShare;
use App\Models\SplitSettlement;
use Inertia\Inertia;

class DataExportImportController extends Controller
{
    public function index()
    {
        return Inertia::render('Settings/DataExportImport');
    }

    // --- JSON EXPORT & IMPORT ---

    public function exportJson(Request $request)
    {
        $userId = $request->user()->id;
        $scope = $request->query('scope', 'full'); // 'full', 'all', or 'transactions'

        $data = [
            'version' => '1.1',
            'scope' => $scope,
            'exported_at' => now()->toIso8601String(),
        ];

        if ($scope === 'full' || $scope === 'all') {
            $data['account_types'] = AccountType::where('user_id', $userId)->get();
            $data['categories'] = Category::where('user_id', $userId)->get();
            $data['accounts'] = Account::where('user_id', $userId)->get();
            $data['budgets'] = Budget::where('user_id', $userId)->get();
            $data['savings_goals'] = SavingsGoal::where('user_id', $userId)->get();
            
            $data['wishlist_items'] = WishlistItem::where('user_id', $userId)->with('prices')->get();
            
            $data['split_events'] = SplitEvent::where('user_id', $userId)
                ->with(['expenses.shares', 'settlements'])
                ->get();

            $data['recurring_transactions'] = RecurringTransaction::where('user_id', $userId)->get();
        }

        $data['transactions'] = Transaction::where('user_id', $userId)->get();

        $filename = 'spendwise-' . $scope . '-backup-' . now()->format('Y-m-d-His') . '.json';

        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT);
        }, $filename, ['Content-Type' => 'application/json']);
    }

    public function importJson(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:json', 'max:10240'],
        ]);

        $userId = $request->user()->id;
        $content = file_get_contents($request->file('file')->getRealPath());
        $data = json_decode($content, true);

        if (!$data || !isset($data['transactions'])) {
            return back()->withErrors(['file' => 'The uploaded JSON file is invalid or missing transactions.']);
        }

        DB::beginTransaction();
        try {
            // 1. Account Types
            $accountTypeMap = [];
            foreach ($data['account_types'] ?? [] as $item) {
                $oldId = $item['id'] ?? null;
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['deleted_at']);
                
                $existing = AccountType::withTrashed()
                    ->where('user_id', $userId)
                    ->where('name', $item['name'])
                    ->first();

                if ($existing) {
                    if ($existing->trashed()) {
                        $existing->restore();
                    }
                    $existing->update($item);
                    $new = $existing;
                } else {
                    $new = AccountType::create(array_merge(['user_id' => $userId], $item));
                }

                if ($oldId) $accountTypeMap[$oldId] = $new->id;
            }

            // 2. Categories
            $categoryMap = [];
            foreach ($data['categories'] ?? [] as $item) {
                $oldId = $item['id'] ?? null;
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['deleted_at']);

                $existing = Category::withTrashed()
                    ->where('user_id', $userId)
                    ->where('name', $item['name'])
                    ->where('type', $item['type'])
                    ->first();

                if ($existing) {
                    if ($existing->trashed()) {
                        $existing->restore();
                    }
                    $existing->update($item);
                    $new = $existing;
                } else {
                    $new = Category::create(array_merge(['user_id' => $userId], $item));
                }

                if ($oldId) $categoryMap[$oldId] = $new->id;
            }

            // 3. Accounts
            $accountMap = [];
            foreach ($data['accounts'] ?? [] as $item) {
                $oldId = $item['id'] ?? null;
                if (isset($item['account_type_id']) && isset($accountTypeMap[$item['account_type_id']])) {
                    $item['account_type_id'] = $accountTypeMap[$item['account_type_id']];
                }
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['deleted_at']);

                $existing = Account::withTrashed()
                    ->where('user_id', $userId)
                    ->where('name', $item['name'])
                    ->first();

                if ($existing) {
                    if ($existing->trashed()) {
                        $existing->restore();
                    }
                    $existing->update($item);
                    $new = $existing;
                } else {
                    $new = Account::create(array_merge(['user_id' => $userId], $item));
                }

                if ($oldId) $accountMap[$oldId] = $new->id;
            }

            // 4. Budgets
            foreach ($data['budgets'] ?? [] as $item) {
                if (isset($item['category_id']) && isset($categoryMap[$item['category_id']])) {
                    $item['category_id'] = $categoryMap[$item['category_id']];
                }
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['deleted_at']);
                $item['user_id'] = $userId;
                
                Budget::create($item);
            }

            // 5. Savings Goals
            $savingsGoalMap = [];
            foreach ($data['savings_goals'] ?? [] as $item) {
                $oldId = $item['id'] ?? null;
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['deleted_at']);
                $item['user_id'] = $userId;
                
                $newGoal = SavingsGoal::create($item);
                if ($oldId) $savingsGoalMap[$oldId] = $newGoal->id;
            }

            // 6. Wishlist Items & Prices
            foreach ($data['wishlist_items'] ?? [] as $item) {
                $prices = $item['prices'] ?? [];
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['prices']);
                $item['user_id'] = $userId;

                $newItem = WishlistItem::create($item);

                foreach ($prices as $price) {
                    unset($price['id'], $price['created_at'], $price['updated_at']);
                    $newItem->prices()->create($price);
                }
            }

            // 7. Split Events, Expenses, Shares & Settlements
            foreach ($data['split_events'] ?? [] as $item) {
                $expenses = $item['expenses'] ?? [];
                $settlements = $item['settlements'] ?? [];
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['expenses'], $item['settlements']);
                $item['user_id'] = $userId;

                $newEvent = SplitEvent::create($item);

                foreach ($expenses as $expense) {
                    $shares = $expense['shares'] ?? [];
                    unset($expense['id'], $expense['split_event_id'], $expense['created_at'], $expense['updated_at'], $expense['shares']);
                    $expense['user_id'] = $userId;
                    
                    $newExpense = $newEvent->expenses()->create($expense);

                    foreach ($shares as $share) {
                        unset($share['id'], $share['split_expense_id'], $share['created_at'], $share['updated_at']);
                        $share['user_id'] = $userId;
                        $newExpense->shares()->create($share);
                    }
                }

                foreach ($settlements as $settlement) {
                    unset($settlement['id'], $settlement['split_event_id'], $settlement['created_at'], $settlement['updated_at']);
                    $settlement['user_id'] = $userId;
                    $newEvent->settlements()->create($settlement);
                }
            }

            // 8. Recurring Transactions
            $recurringMap = [];
            foreach ($data['recurring_transactions'] ?? [] as $item) {
                $oldId = $item['id'] ?? null;
                if (isset($item['account_id']) && isset($accountMap[$item['account_id']])) {
                    $item['account_id'] = $accountMap[$item['account_id']];
                }
                if (isset($item['category_id']) && isset($categoryMap[$item['category_id']])) {
                    $item['category_id'] = $categoryMap[$item['category_id']];
                }
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at']);
                $item['user_id'] = $userId;
                
                $newRecurring = RecurringTransaction::create($item);
                if ($oldId) $recurringMap[$oldId] = $newRecurring->id;
            }

            // 9. Transactions
            foreach ($data['transactions'] ?? [] as $item) {
                if (isset($item['account_id']) && isset($accountMap[$item['account_id']])) {
                    $item['account_id'] = $accountMap[$item['account_id']];
                }
                if (isset($item['destination_account_id']) && isset($accountMap[$item['destination_account_id']])) {
                    $item['destination_account_id'] = $accountMap[$item['destination_account_id']];
                }
                if (isset($item['category_id']) && isset($categoryMap[$item['category_id']])) {
                    $item['category_id'] = $categoryMap[$item['category_id']];
                }
                if (isset($item['savings_goal_id']) && isset($savingsGoalMap[$item['savings_goal_id']])) {
                    $item['savings_goal_id'] = $savingsGoalMap[$item['savings_goal_id']];
                }
                if (isset($item['recurring_transaction_id']) && isset($recurringMap[$item['recurring_transaction_id']])) {
                    $item['recurring_transaction_id'] = $recurringMap[$item['recurring_transaction_id']];
                }
                
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['deleted_at']);
                $item['user_id'] = $userId;
                
                Transaction::create($item);
            }

            DB::commit();
            return back()->with('success', 'Workspace data successfully imported!');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['file' => 'JSON Import failed: ' . $e->getMessage()]);
        }
    }

    // --- CLEAR WORKSPACE DATA ---

    public function clearData(Request $request)
    {
        $userId = $request->user()->id;

        DB::beginTransaction();
        try {
            // Delete dependent records first to respect FK constraints
            Transaction::where('user_id', $userId)->forceDelete();
            RecurringTransaction::where('user_id', $userId)->delete();
            
            SplitExpenseShare::where('user_id', $userId)->delete();
            SplitExpense::where('user_id', $userId)->delete();
            SplitSettlement::where('user_id', $userId)->delete();
            SplitEvent::where('user_id', $userId)->delete();

            WishlistPrice::whereHas('item', fn ($q) => $q->where('user_id', $userId))->delete();
            WishlistItem::where('user_id', $userId)->delete();

            SavingsGoal::where('user_id', $userId)->forceDelete();
            Budget::where('user_id', $userId)->forceDelete();
            
            Account::where('user_id', $userId)->forceDelete();
            Category::where('user_id', $userId)->forceDelete();
            AccountType::where('user_id', $userId)->forceDelete();

            DB::commit();
            return back()->with('success', 'All account data has been successfully cleared.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['clear' => 'Failed to clear workspace data: ' . $e->getMessage()]);
        }
    }

    // --- CSV EXPORT & IMPORT ---

    public function exportCsv(Request $request)
    {
        $userId = $request->user()->id;
        
        $query = Transaction::where('user_id', $userId)->with(['account', 'category', 'destinationAccount']);
        
        $transactions = $query->get();
        $filename = 'spendwise-transactions-export-' . now()->format('Y-m-d-His') . '.csv';

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function() use ($transactions) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Date', 'Type', 'Amount', 'Account', 'Destination Account', 'Category', 'Description', 'Reference Number', 'Notes']);

            foreach ($transactions as $t) {
                fputcsv($file, [
                    $t->transaction_date,
                    $t->type,
                    $t->amount,
                    $t->account?->name,
                    $t->destinationAccount?->name,
                    $t->category?->name,
                    $t->description,
                    $t->reference_number,
                    $t->notes
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function importCsv(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $userId = $request->user()->id;
        $path = $request->file('file')->getRealPath();
        $file = fopen($path, 'r');
        
        fgetcsv($file); // Skip header row

        DB::beginTransaction();
        try {
            while (($row = fgetcsv($file)) !== false) {
                if (count($row) < 3) continue;

                $date = $row[0];
                $type = strtolower($row[1]);
                $amount = $row[2];
                $accountName = $row[3] ?? 'Default Account';
                $destAccountName = $row[4] ?? null;
                $categoryName = $row[5] ?? null;
                $description = $row[6] ?? null;
                $refNumber = $row[7] ?? null;
                $notes = $row[8] ?? null;

                $account = Account::firstOrCreate(
                    ['user_id' => $userId, 'name' => $accountName],
                    ['balance' => 0, 'is_active' => true]
                );

                $destAccountId = null;
                if ($destAccountName) {
                    $destAccount = Account::firstOrCreate(
                        ['user_id' => $userId, 'name' => $destAccountName],
                        ['balance' => 0, 'is_active' => true]
                    );
                    $destAccountId = $destAccount->id;
                }

                $categoryId = null;
                if ($categoryName) {
                    $category = Category::firstOrCreate(
                        ['user_id' => $userId, 'name' => $categoryName, 'type' => in_array($type, ['income', 'expense']) ? $type : 'expense'],
                        ['color' => '#3b82f6']
                    );
                    $categoryId = $category->id;
                }

                Transaction::create([
                    'user_id' => $userId,
                    'account_id' => $account->id,
                    'destination_account_id' => $destAccountId,
                    'category_id' => $categoryId,
                    'type' => in_array($type, ['income', 'expense', 'transfer']) ? $type : 'expense',
                    'amount' => $amount,
                    'description' => $description,
                    'notes' => $notes,
                    'transaction_date' => $date,
                    'reference_number' => $refNumber,
                ]);
            }
            fclose($file);
            DB::commit();
            return back()->with('success', 'Transactions successfully imported from CSV!');
        } catch (\Exception $e) {
            DB::rollBack();
            fclose($file);
            return back()->withErrors(['file' => 'CSV Import failed: ' . $e->getMessage()]);
        }
    }

    // --- TEMPLATE DOWNLOADS ---

    public function downloadTemplate(Request $request, $format)
    {
        if ($format === 'csv') {
            $filename = 'spendwise-import-template.csv';
            $headers = [
                "Content-type" => "text/csv",
                "Content-Disposition" => "attachment; filename=$filename",
            ];
            $callback = function() {
                $file = fopen('php://output', 'w');
                fputcsv($file, ['Date', 'Type', 'Amount', 'Account', 'Destination Account', 'Category', 'Description', 'Reference Number', 'Notes']);
                fputcsv($file, ['2026-10-27', 'expense', '500.00', 'Cash Wallet', '', 'Food & Dining', 'Grocery shopping', 'REF12345', 'Monthly supplies']);
                fclose($file);
            };
            return response()->stream($callback, 200, $headers);
        } else {
            $template = [
                'version' => '1.1',
                'scope' => 'full',
                'exported_at' => now()->toIso8601String(),
                'account_types' => [['id' => 1, 'name' => 'Bank', 'color' => '#3b82f6', 'icon' => 'wallet']],
                'accounts' => [['id' => 1, 'account_type_id' => 1, 'name' => 'Savings Account', 'balance' => 15000.00, 'is_active' => true]],
                'categories' => [['id' => 1, 'name' => 'Salary', 'type' => 'income', 'color' => '#10b981']],
                'budgets' => [],
                'savings_goals' => [],
                'wishlist_items' => [],
                'split_events' => [],
                'recurring_transactions' => [],
                'transactions' => [
                    [
                        'type' => 'income',
                        'amount' => 25000.00,
                        'description' => 'Monthly Salary',
                        'transaction_date' => '2026-10-01',
                        'account_id' => 1,
                        'category_id' => 1
                    ]
                ]
            ];
            return response()->streamDownload(function () use ($template) {
                echo json_encode($template, JSON_PRETTY_PRINT);
            }, 'spendwise-template.json', ['Content-Type' => 'application/json']);
        }
    }
}