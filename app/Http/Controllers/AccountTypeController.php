<?php

namespace App\Http\Controllers;

use App\Models\AccountType;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AccountTypeController extends Controller
{
    public function index(Request $request)
    {
        $accountTypes = AccountType::where('user_id', $request->user()->id)
            ->with(['accounts' => function ($q) {
                $q->select('id', 'account_type_id', 'name', 'balance');
            }])
            ->withCount('accounts')
            ->orderBy('name')
            ->get()
            ->map(function ($type) {
                $type->total_balance = $type->accounts->sum('balance');
                return $type;
            });

        $categories = Category::where('user_id', $request->user()->id)
            ->select('id', 'name', 'type')
            ->orderBy('name')
            ->get();

        return Inertia::render('AccountTypes/Index', [
            'accountTypes' => $accountTypes,
            'categories'   => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'  => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('account_types')->where('user_id', $request->user()->id)->whereNull('deleted_at')
            ],
            'color' => ['nullable', 'string', 'max:7'],
            'icon'  => ['nullable', 'string', 'max:50'],
        ]);

        $request->user()->accountTypes()->create($validated);

        return back();
    }

    public function update(Request $request, AccountType $accountType)
    {
        if ($accountType->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name'  => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('account_types')
                    ->where('user_id', $request->user()->id)
                    ->ignore($accountType->id)
                    ->whereNull('deleted_at')
            ],
            'color' => ['nullable', 'string', 'max:7'],
            'icon'  => ['nullable', 'string', 'max:50'],
        ]);

        $accountType->update($validated);

        return back();
    }

    public function destroy(Request $request, AccountType $accountType)
    {
        if ($accountType->user_id !== $request->user()->id) {
            abort(403);
        }

        $accountType->delete();

        return back();
    }
}