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
     * API Endpoint for Account Transactions Modal filtering (Paginated)
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
            ->when(!empty($search), function ($q) use ($search) {
                $q->where(function ($sub) use ($search) {
                    $sub->where('description', 'like', "%{$search}%")
                        ->orWhere('reference_number', 'like', "%{$search}%");
                });
            })
            ->when(!empty($type) && $type !== 'all', function ($q) use ($type) {
                $q->where('type', $type);
            })
            ->when(!empty($categoryId) && $categoryId !== 'all', function ($q) use ($categoryId) {
                $q->where('category_id', (int) $categoryId);
            })
            ->when(!empty($startDate), function ($q) use ($startDate) {
                $q->whereDate('transaction_date', '>=', $startDate);
            })
            ->when(!empty($endDate), function ($q) use ($endDate) {
                $q->whereDate('transaction_date', '<=', $endDate);
            });

        // Compute summary amount over filtered set
        $allFiltered = (clone $query)->get(['id', 'type', 'amount', 'destination_account_id']);
        if ($type === 'expense') {
            $summaryAmount = $allFiltered->where('type', 'expense')->sum('amount');
        } elseif ($type === 'income') {
            $summaryAmount = $allFiltered->where('type', 'income')->sum('amount');
        } else {
            $summaryAmount = $allFiltered->reduce(function ($sum, $tx) use ($account) {
                $amt = (float) $tx->amount;
                if ($tx->type === 'income') return $sum + $amt;
                if ($tx->type === 'expense') return $sum - $amt;
                if ($tx->type === 'transfer') {
                    return $tx->destination_account_id === $account->id ? $sum + $amt : $sum - $amt;
                }
                return $sum;
            }, 0);
        }

        // Paginate 8 items per page
        $paginatedTransactions = $query
            ->select('id', 'user_id', 'account_id', 'destination_account_id', 'category_id', 'type', 'amount', 'description', 'transaction_date')
            ->with(['category:id,name', 'account:id,name', 'destinationAccount:id,name'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(8);

        return response()->json([
            'transactions'  => $paginatedTransactions->items(),
            'summaryAmount' => $summaryAmount,
            'pagination'    => [
                'current_page' => $paginatedTransactions->currentPage(),
                'last_page'    => $paginatedTransactions->lastPage(),
                'from'         => $paginatedTransactions->firstItem(),
                'to'           => $paginatedTransactions->lastItem(),
                'total'        => $paginatedTransactions->total(),
            ],
        ]);
    }

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

    public function destroy(Request $request, Account $account)
    {
        if ($account->user_id !== $request->user()->id) {
            abort(403);
        }

        $account->delete();

        return back()->with('success', 'Account deleted successfully.');
    }
}