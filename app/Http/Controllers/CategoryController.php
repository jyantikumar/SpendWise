<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of user categories.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $categories = Category::where('user_id', $user->id)
            ->withCount('transactions')
            ->orderBy('type')
            ->orderBy('name')
            ->get();

        $accounts = Account::where('user_id', $user->id)
            ->orderBy('name')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'accounts'   => $accounts,
        ]);
    }

    /**
     * Store a newly created category.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'type'  => ['required', 'in:income,expense'],
            'color' => ['nullable', 'string', 'max:20'],
            'icon'  => ['nullable', 'string', 'max:50'],
        ]);

        $request->user()->categories()->create($validated);

        return back()->with('success', 'Category created successfully.');
    }

    /**
     * Update the specified category.
     */
    public function update(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'type'  => ['required', 'in:income,expense'],
            'color' => ['nullable', 'string', 'max:20'],
            'icon'  => ['nullable', 'string', 'max:50'],
        ]);

        $category->update($validated);

        return back()->with('success', 'Category updated successfully.');
    }

    /**
     * Remove the specified category.
     */
    public function destroy(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        $category->delete();

        return back()->with('success', 'Category deleted successfully.');
    }

    /**
     * Fetch filtered transactions for a specific category (returns JSON for modal).
     */
  public function categoryTransactions(Request $request, $categoryId)
{
    $userId = $request->user()->id;

    if ((int) $categoryId === 0) {
        $category = (object) [
            'id'    => 0,
            'name'  => 'Uncategorized',
            'color' => '#94a3b8',
        ];
        $query = Transaction::where('user_id', $userId)->whereNull('category_id');
    } else {
        $category = Category::where('user_id', $userId)->select('id', 'name', 'color')->findOrFail($categoryId);
        $query = Transaction::where('user_id', $userId)->where('category_id', $category->id);
    }

    $search    = $request->input('search');
    $accountId = $request->input('account_id');
    $startDate = $request->input('start_date');
    $endDate   = $request->input('end_date');

    $transactions = $query
        ->select('id', 'user_id', 'account_id', 'destination_account_id', 'category_id', 'type', 'amount', 'description', 'transaction_date')
        ->with([
            'account:id,name', 
            'destinationAccount:id,name', 
            'category:id,name'
        ])
        ->when($search, function ($q, $search) {
            $q->where('description', 'like', "%{$search}%");
        })
        ->when(!empty($accountId) && $accountId !== 'all', function ($q) use ($accountId) {
            $id = (int) $accountId;
            $q->where(function ($sub) use ($id) {
                $sub->where('account_id', $id)
                    ->orWhere('destination_account_id', $id);
            });
        })
        ->when($startDate, function ($q, $startDate) {
            $q->whereDate('transaction_date', '>=', $startDate);
        })
        ->when($endDate, function ($q, $endDate) {
            $q->whereDate('transaction_date', '<=', $endDate);
        })
        ->orderBy('transaction_date', 'desc')
        ->orderBy('id', 'desc')
        ->get();

    return response()->json([
        'category'     => $category,
        'transactions' => $transactions,
        'totalAmount'  => $transactions->sum('amount'),
    ]);
}
}