<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\AccountTypeController; 
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Redirect root URL directly to the login page
Route::get('/', function () {
    return redirect()->route('login');
});

// Protected Application Routes
Route::middleware(['auth', 'verified'])->group(function () {
    // Main Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Transactions
Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index'); // 👈 Add this GET route
    Route::post('/transactions', [TransactionController::class, 'store'])->name('transactions.store');
    Route::put('/transactions/{transaction}', [TransactionController::class, 'update'])->name('transactions.update');
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy'])->name('transactions.destroy');
    // User Profile Routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Category Management Routes
    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');
    // Category Transactions Modal API Endpoint
Route::get('/categories/{category}/transactions', [CategoryController::class, 'categoryTransactions'])->name('categories.transactions');

    // Account Routes
    Route::get('/accounts', [AccountController::class, 'index'])->name('accounts.index');
    Route::post('/accounts', [AccountController::class, 'store'])->name('accounts.store');
    Route::put('/accounts/{account}', [AccountController::class, 'update'])->name('accounts.update');
    Route::delete('/accounts/{account}', [AccountController::class, 'destroy'])->name('accounts.destroy');

    // Account Type Routes
    Route::get('/account-types', [AccountTypeController::class, 'index'])->name('account-types.index');
    Route::post('/account-types', [AccountTypeController::class, 'store'])->name('account-types.store');
    Route::put('/account-types/{accountType}', [AccountTypeController::class, 'update'])->name('account-types.update');
    Route::delete('/account-types/{accountType}', [AccountTypeController::class, 'destroy'])->name('account-types.destroy');
});

require __DIR__.'/auth.php';