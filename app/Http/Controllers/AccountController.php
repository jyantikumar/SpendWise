<?php

namespace App\Http\Controllers;

use App\Models\Account;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    /**
     * Display a listing of user financial accounts.
     */
    public function index(Request $request)
    {
        $accounts = Account::where('user_id', $request->user()->id)
            ->withCount('transactions')
            ->orderBy('is_active', 'desc')
            ->orderBy('name')
            ->get();

        return Inertia::render('Accounts/Index', [
            'accounts' => $accounts,
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