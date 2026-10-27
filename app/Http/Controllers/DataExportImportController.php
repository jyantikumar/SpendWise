<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\AccountType;
use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use App\Models\RecurringTransaction;
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

        // Base payload
        $data = [
            'version' => '1.0',
            'scope' => $scope,
            'exported_at' => now()->toIso8601String(),
        ];

        // Export relational dependencies first if scope is full/all
        if ($scope === 'full' || $scope === 'all') {
            $data['account_types'] = AccountType::where('user_id', $userId)->get();
            $data['categories'] = Category::where('user_id', $userId)->get();
            $data['accounts'] = Account::where('user_id', $userId)->get();
            $data['recurring_transactions'] = RecurringTransaction::where('user_id', $userId)->get();
        }

        // Export transactions last (dependent on accounts and categories)
        $data['transactions'] = Transaction::where('user_id', $userId)->get();

        $filename = 'spendwise-' . $scope . '-backup-' . now()->format('Y-m-d-His') . '.json';

        return response()->streamDownload(function () use ($data) {
            echo json_encode($data, JSON_PRETTY_PRINT);
        }, $filename, ['Content-Type' => 'application/json']);
    }

    public function importJson(Request $request)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:json', 'max:5120'],
        ]);

        $userId = $request->user()->id;
        $content = file_get_contents($request->file('file')->getRealPath());
        $data = json_decode($content, true);

        if (!$data || !isset($data['transactions'])) {
            return back()->withErrors(['file' => 'The uploaded JSON file is invalid or missing transactions.']);
        }

        DB::beginTransaction();
        try {
            // 1. Map and Import Account Types (Handling Soft Deletes to bypass Unique Constraints)
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
                    $new = AccountType::create(array_merge(['user_id' => $userId, 'name' => $item['name']], $item));
                }

                if ($oldId) $accountTypeMap[$oldId] = $new->id;
            }

            // 2. Map and Import Categories
            $categoryMap = [];
            foreach ($data['categories'] ?? [] as $item) {
                $oldId = $item['id'] ?? null;
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['deleted_at']);
                $new = Category::updateOrCreate(['user_id' => $userId, 'name' => $item['name'], 'type' => $item['type']], $item);
                if ($oldId) $categoryMap[$oldId] = $new->id;
            }

            // 3. Map and Import Accounts
            $accountMap = [];
            foreach ($data['accounts'] ?? [] as $item) {
                $oldId = $item['id'] ?? null;
                if (isset($item['account_type_id']) && isset($accountTypeMap[$item['account_type_id']])) {
                    $item['account_type_id'] = $accountTypeMap[$item['account_type_id']];
                }
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['deleted_at']);
                $new = Account::updateOrCreate(['user_id' => $userId, 'name' => $item['name']], $item);
                if ($oldId) $accountMap[$oldId] = $new->id;
            }

            // 4. Map and Import Recurring Transactions
            foreach ($data['recurring_transactions'] ?? [] as $item) {
                if (isset($item['account_id']) && isset($accountMap[$item['account_id']])) {
                    $item['account_id'] = $accountMap[$item['account_id']];
                }
                if (isset($item['category_id']) && isset($categoryMap[$item['category_id']])) {
                    $item['category_id'] = $categoryMap[$item['category_id']];
                }
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['deleted_at']);
                $item['user_id'] = $userId;
                
                RecurringTransaction::updateOrCreate(
                    [
                        'user_id' => $userId, 
                        'title' => $item['title'] ?? 'Imported Recurring Item', 
                        'amount' => $item['amount'] ?? 0
                    ], 
                    $item
                );
            }

            // 5. Map and Import Transactions
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
                unset($item['id'], $item['user_id'], $item['created_at'], $item['updated_at'], $item['deleted_at']);
                $item['user_id'] = $userId;
                
                Transaction::create($item);
            }

            DB::commit();
            return back()->with('success', 'JSON data successfully imported!');
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
            // Delete dependent records first to respect foreign keys
            Transaction::where('user_id', $userId)->delete();
            RecurringTransaction::where('user_id', $userId)->delete();
            Account::where('user_id', $userId)->delete();
            Category::where('user_id', $userId)->delete();
            AccountType::where('user_id', $userId)->delete();

            DB::commit();
            return back()->with('success', 'All account data has been successfully cleared.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['clear' => 'Failed to clear data: ' . $e->getMessage()]);
        }
    }

    // --- CSV EXPORT & IMPORT ---

    public function exportCsv(Request $request)
    {
        $userId = $request->user()->id;
        // Note: CSV handles transactions ledger primarily
        
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
            fputcsv($file, ['Date', 'Type', 'Amount', 'Account', 'Destination Account', 'Category', 'Description', 'Reference Number']);

            foreach ($transactions as $t) {
                fputcsv($file, [
                    $t->transaction_date,
                    $t->type,
                    $t->amount,
                    $t->account?->name,
                    $t->destinationAccount?->name,
                    $t->category?->name,
                    $t->description,
                    $t->reference_number
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
        
        fgetcsv($file); // Skip header

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

                $account = Account::firstOrCreate(
                    ['user_id' => $userId, 'name' => $accountName],
                    ['type' => 'General', 'balance' => 0]
                );

                $destAccountId = null;
                if ($destAccountName) {
                    $destAccount = Account::firstOrCreate(
                        ['user_id' => $userId, 'name' => $destAccountName],
                        ['type' => 'General', 'balance' => 0]
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
                fputcsv($file, ['Date', 'Type', 'Amount', 'Account', 'Destination Account', 'Category', 'Description', 'Reference Number']);
                fputcsv($file, ['2026-10-27 12:00:00', 'expense', '500.00', 'Cash Wallet', '', 'Food & Dining', 'Grocery shopping', 'REF12345']);
                fclose($file);
            };
            return response()->stream($callback, 200, $headers);
        } else {
            $template = [
                'version' => '1.0',
                'scope' => 'full',
                'exported_at' => now()->toIso8601String(),
                'account_types' => [['id' => 1, 'name' => 'Bank', 'color' => '#3b82f6', 'icon' => 'wallet']],
                'accounts' => [['id' => 1, 'account_type_id' => 1, 'name' => 'BDO Savings', 'balance' => 15000.00]],
                'categories' => [['id' => 1, 'name' => 'Salary', 'type' => 'income', 'color' => '#10b981']],
                'recurring_transactions' => [],
                'transactions' => [
                    [
                        'type' => 'income',
                        'amount' => 25000.00,
                        'description' => 'Monthly Salary',
                        'transaction_date' => '2026-10-01 08:00:00',
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