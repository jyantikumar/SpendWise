<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\SplitEventController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\AccountTypeController;
use App\Http\Controllers\AnalysisController;
use App\Http\Controllers\RecurringTransactionController;
use App\Http\Controllers\SavingsGoalController;
use App\Http\Controllers\WishlistItemController;
use App\Http\Controllers\DataExportImportController;
use Illuminate\Support\Facades\Route;

// Redirect root URL directly to the login page
Route::get('/', function () {
    return redirect()->route('login');
});

// Protected Application Routes
Route::middleware(['auth'])->group(function () {

    // Main Dashboard & Analysis
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/analysis', [AnalysisController::class, 'index'])->name('analysis.index');

    // User Profile
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // Transactions
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::post('/', [TransactionController::class, 'store'])->name('store');
        Route::put('/{transaction}', [TransactionController::class, 'update'])->name('update');
        Route::delete('/{transaction}', [TransactionController::class, 'destroy'])->name('destroy');
    });

    // Categories
    Route::prefix('categories')->name('categories.')->group(function () {
        Route::get('/', [CategoryController::class, 'index'])->name('index');
        Route::post('/', [CategoryController::class, 'store'])->name('store');
        Route::put('/{category}', [CategoryController::class, 'update'])->name('update');
        Route::delete('/{category}', [CategoryController::class, 'destroy'])->name('destroy');
        Route::patch('/{category}/toggle-active', [CategoryController::class, 'toggleActive'])->withTrashed()->name('toggle-active');
        Route::get('/{category}/transactions', [CategoryController::class, 'categoryTransactions'])->name('transactions');
    });

    // Accounts
    Route::prefix('accounts')->name('accounts.')->group(function () {
        Route::get('/', [AccountController::class, 'index'])->name('index');
        Route::post('/', [AccountController::class, 'store'])->name('store');
        Route::put('/{account}', [AccountController::class, 'update'])->name('update');
        Route::delete('/{account}', [AccountController::class, 'destroy'])->name('destroy');
        Route::patch('/{account}/toggle-active', [AccountController::class, 'toggleActive'])->name('toggle-active');
        Route::get('/{account}/transactions', [AccountController::class, 'accountTransactions'])->name('transactions');
    });

    // Account Types
    Route::prefix('account-types')->name('account-types.')->group(function () {
        Route::get('/', [AccountTypeController::class, 'index'])->name('index');
        Route::post('/', [AccountTypeController::class, 'store'])->name('store');
        Route::put('/{accountType}', [AccountTypeController::class, 'update'])->name('update');
        Route::delete('/{accountType}', [AccountTypeController::class, 'destroy'])->name('destroy');
    });

    // Subscriptions / Recurring Transactions
    Route::get('/subscriptions', [RecurringTransactionController::class, 'index'])->name('subscriptions.index');
    Route::prefix('recurring')->name('recurring.')->group(function () {
        Route::post('/', [RecurringTransactionController::class, 'store'])->name('store');
        Route::put('/{recurringTransaction}', [RecurringTransactionController::class, 'update'])->name('update');
        Route::delete('/{recurringTransaction}', [RecurringTransactionController::class, 'destroy'])->name('destroy');
        Route::post('/{recurringTransaction}/process', [RecurringTransactionController::class, 'process'])->name('process');
        Route::patch('/{recurringTransaction}/toggle', [RecurringTransactionController::class, 'toggle'])->name('toggle');
        Route::post('/{recurringTransaction}/skip', [RecurringTransactionController::class, 'skip'])->name('skip');
    });

    // Split Events, Expenses & Settlements
    Route::prefix('splits')->name('splits.')->group(function () {
        Route::get('/', [SplitEventController::class, 'index'])->name('index');
        Route::post('/', [SplitEventController::class, 'store'])->name('store');
        Route::get('/{splitEvent}', [SplitEventController::class, 'show'])->name('show');
        Route::put('/{splitEvent}', [SplitEventController::class, 'update'])->name('update');
        Route::delete('/{splitEvent}', [SplitEventController::class, 'destroy'])->name('destroy');
        Route::patch('/{splitEvent}/status', [SplitEventController::class, 'updateStatus'])->name('status.update');

        Route::post('/{splitEvent}/expenses', [SplitEventController::class, 'storeExpense'])->name('expenses.store');
        Route::put('/{splitEvent}/expenses/{expense}', [SplitEventController::class, 'updateExpense'])->name('expenses.update');
        Route::delete('/{splitEvent}/expenses/{expense}', [SplitEventController::class, 'destroyExpense'])->name('expenses.destroy');

        Route::post('/{splitEvent}/settlements', [SplitEventController::class, 'storeSettlement'])->name('settlements.store');
        Route::put('/{splitEvent}/settlements/{settlement}', [SplitEventController::class, 'updateSettlement'])->name('settlements.update');
        Route::delete('/{splitEvent}/settlements/{settlement}', [SplitEventController::class, 'destroySettlement'])->name('settlements.destroy');
    });

    // Wishlist Items & Prices
    Route::prefix('wishlist')->name('wishlist.')->group(function () {
        Route::get('/', [WishlistItemController::class, 'index'])->name('index');
        Route::post('/', [WishlistItemController::class, 'store'])->name('store');
        Route::get('/{wishlist}', [WishlistItemController::class, 'show'])->name('show');
        Route::put('/{wishlist}', [WishlistItemController::class, 'update'])->name('update');
        Route::delete('/{wishlist}', [WishlistItemController::class, 'destroy'])->name('destroy');
        Route::patch('/{wishlist}/status', [WishlistItemController::class, 'toggleStatus'])->name('status.toggle');

        Route::post('/{wishlist}/prices', [WishlistItemController::class, 'storePrice'])->name('prices.store');
        Route::put('/{wishlist}/prices/{price}', [WishlistItemController::class, 'updatePrice'])->name('prices.update');
        Route::delete('/{wishlist}/prices/{price}', [WishlistItemController::class, 'destroyPrice'])->name('prices.destroy');
    });

    // Savings Goals
    Route::prefix('savings')->name('savings.')->group(function () {
        Route::get('/', [SavingsGoalController::class, 'index'])->name('index');
        Route::post('/', [SavingsGoalController::class, 'store'])->name('store');
        Route::get('/{savingsGoal}', [SavingsGoalController::class, 'show'])->name('show');
        Route::put('/{savingsGoal}', [SavingsGoalController::class, 'update'])->name('update');
        Route::delete('/{savingsGoal}', [SavingsGoalController::class, 'destroy'])->name('destroy');
    });

    // Data Export, Import, Templates & Clear Data
    Route::prefix('settings/data')->name('settings.data.')->group(function () {
        Route::get('/', [DataExportImportController::class, 'index'])->name('index');
        Route::delete('/clear', [DataExportImportController::class, 'clearData'])->name('clear');
        Route::get('/template/{format}', [DataExportImportController::class, 'downloadTemplate'])->name('template');

        Route::get('/export/json', [DataExportImportController::class, 'exportJson'])->name('export.json');
        Route::post('/import/json', [DataExportImportController::class, 'importJson'])->name('import.json');

        Route::get('/export/csv', [DataExportImportController::class, 'exportCsv'])->name('export.csv');
        Route::post('/import/csv', [DataExportImportController::class, 'importCsv'])->name('import.csv');
    });

});

require __DIR__.'/auth.php';