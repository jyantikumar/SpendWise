<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\AccountType;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    /**
     * Display a listing of user financial accounts along with available account types and categories.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $accounts = Account::where('user_id', $user->id)
            ->withCount('transactions')
            ->orderBy('is_active', 'desc')
            ->orderBy('name')
            ->get();

        $accountTypes = AccountType::where('user_id', $user->id)
            ->orderBy('name')
            ->get();

        $categories = Category::where('user_id', $user->id)
            ->orderBy('name')
            ->get();

        return Inertia::render('Accounts/Index', [
            'accounts'     => $accounts,
            'accountTypes' => $accountTypes,
            'categories'   => $categories,
        ]);
    }

    /**
     * API Endpoint for Account Transactions Modal filtering
     */
    public function accountTransactions(Request $request, Account $account)
    {
        if ($account->user_id !== $request->user()->id) {
            abort(403);
        }

        $search     = $request->input('search');
        $type       = $request->input('type');
        $categoryId = $request->input('category_id');
        $startDate  = $request->input('start_date');
        $endDate    = $request->input('end_date');

        $query = Transaction::where('user_id', $request->user()->id)
            ->where(function ($q) use ($account) {
                $q->where('account_id', $account->id)
                  ->orWhere('destination_account_id', $account->id);
            })
            ->with(['category', 'account', 'destinationAccount'])
            ->when($request->filled('search'), function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('description', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('type') && $type !== 'all', function ($q) use ($type) {
                $q->where('type', $type);
            })
            ->when($request->filled('category_id') && $categoryId !== 'all', function ($q) use ($categoryId) {
                $q->where('category_id', $categoryId);
            })
            ->when($request->filled('start_date'), function ($q) use ($startDate) {
                $q->whereDate('transaction_date', '>=', $startDate);
            })
            ->when($request->filled('end_date'), function ($q) use ($endDate) {
                $q->whereDate('transaction_date', '<=', $endDate);
            });

        $transactions = $query->orderBy('transaction_date', 'desc')->get();

        return response()->json([
            'transactions' => $transactions,
        ]);
    }

    /**
     * Store a newly created account.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'type'      => ['required', 'string', 'max:50'],
            'balance'   => ['required', 'numeric', 'min:-999999999.99', 'max:999999999.99'],
            'currency'  => ['required', 'string', 'size:3'],
            'is_active' => ['required', 'boolean'],
        ]);

        $request->user()->accounts()->create($validated);

        return back()->with('success', 'Account created successfully.');
    }

    /**
     * Update the specified account.
     */
    public function update(Request $request, Account $account)
    {
        if ($account->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name'      => ['required', 'string', 'max:255'],
            'type'      => ['required', 'string', 'max:50'],
            'balance'   => ['required', 'numeric', 'min:-999999999.99', 'max:999999999.99'],
            'currency'  => ['required', 'string', 'size:3'],
            'is_active' => ['required', 'boolean'],
        ]);

        $account->update($validated);

        return back()->with('success', 'Account updated successfully.');
    }

    /**
     * Remove the specified account.
     */
    public function destroy(Request $request, Account $account)
    {
        if ($account->user_id !== $request->user()->id) {
            abort(403);
        }

        $account->delete();

        return back()->with('success', 'Account deleted successfully.');
    }
}