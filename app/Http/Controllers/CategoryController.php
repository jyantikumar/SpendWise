<?php

namespace App\Http\Controllers;

use App\Models\Account;
use App\Models\Category;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Include soft-deleted categories so they can be viewed and reactivated
        $categories = Category::where('user_id', $user->id)
            ->withTrashed()
            ->withCount('transactions')
            ->orderBy('type')
            ->orderBy('name')
            ->get()
            ->map(function ($category) {
                // Append virtual is_active flag based on soft delete status
                $category->is_active = is_null($category->deleted_at);
                return $category;
            });

        $accounts = Account::where('user_id', $user->id)
            ->orderBy('name')
            ->get();

        return Inertia::render('Categories/Index', [
            'categories' => $categories,
            'accounts'   => $accounts,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'type'  => ['required', 'in:income,expense,transfer'],
            'color' => ['nullable', 'string', 'max:20'],
            'icon'  => ['nullable', 'string', 'max:50'],
        ]);

        $request->user()->categories()->create($validated);

        return back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:255'],
            'type'  => ['required', 'in:income,expense,transfer'],
            'color' => ['nullable', 'string', 'max:20'],
            'icon'  => ['nullable', 'string', 'max:50'],
        ]);

        $category->update($validated);

        return back()->with('success', 'Category updated successfully.');
    }

    public function toggleActive(Request $request, $id)
    {
        $category = Category::where('user_id', $request->user()->id)
            ->withTrashed()
            ->findOrFail($id);

        if ($category->trashed()) {
            $category->restore();
            $status = 'activated';
        } else {
            $category->delete(); // Soft delete acts as deactivation
            $status = 'deactivated';
        }

        return back()->with('success', "Category '{$category->name}' {$status} successfully.");
    }

    public function destroy(Request $request, Category $category)
    {
        if ($category->user_id !== $request->user()->id) {
            abort(403);
        }

        // Force delete if user permanently removes it
        $category->forceDelete();

        return back()->with('success', 'Category permanently deleted.');
    }

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
            $category = Category::where('user_id', $userId)
                ->withTrashed()
                ->select('id', 'name', 'color')
                ->findOrFail($categoryId);
            $query = Transaction::where('user_id', $userId)->where('category_id', $category->id);
        }

        $search    = $request->input('search');
        $accountId = $request->input('account_id');
        $startDate = $request->input('start_date');
        $endDate   = $request->input('end_date');

        $filteredQuery = (clone $query)
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
            });

        $totalAmount = (clone $filteredQuery)->sum('amount');

        $paginatedTransactions = $filteredQuery
            ->select('id', 'user_id', 'account_id', 'destination_account_id', 'category_id', 'type', 'amount', 'description', 'transaction_date')
            ->with([
                'account:id,name', 
                'destinationAccount:id,name', 
                'category:id,name'
            ])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(8);

        return response()->json([
            'category'     => $category,
            'transactions' => $paginatedTransactions->items(),
            'totalAmount'  => $totalAmount,
            'pagination'   => [
                'current_page' => $paginatedTransactions->currentPage(),
                'last_page'    => $paginatedTransactions->lastPage(),
                'from'         => $paginatedTransactions->firstItem(),
                'to'           => $paginatedTransactions->lastItem(),
                'total'        => $paginatedTransactions->total(),
            ],
        ]);
    }
}