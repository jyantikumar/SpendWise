<?php

namespace App\Http\Controllers;

use App\Models\WishlistItem;
use App\Models\WishlistPrice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistItemController extends Controller
{
    public function index()
    {
        $items = WishlistItem::with('prices')
            ->latest()
            ->get();

        return Inertia::render('Wishlist/Index', [
            'items' => $items,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_price' => 'nullable|numeric|min:0',
            'priority' => 'required|in:low,medium,high',
        ]);

        WishlistItem::create($validated);

        return redirect()->back()->with('success', 'Wishlist item created successfully.');
    }

    public function show(WishlistItem $wishlist)
    {
        $wishlist->load('prices');

        $lowestPrice = $wishlist->prices->min('price');

        return Inertia::render('Wishlist/Show', [
            'wishlist' => $wishlist,
            'lowestPrice' => $lowestPrice,
        ]);
    }

    public function update(Request $request, WishlistItem $wishlist)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_price' => 'nullable|numeric|min:0',
            'priority' => 'required|in:low,medium,high',
        ]);

        $wishlist->update($validated);

        return redirect()->back()->with('success', 'Wishlist item updated successfully.');
    }

    public function destroy(WishlistItem $wishlist)
    {
        $wishlist->prices()->delete();
        $wishlist->delete();

        return redirect()->route('wishlist.index')->with('success', 'Wishlist item deleted.');
    }

    public function toggleStatus(WishlistItem $wishlist)
    {
        $newStatus = $wishlist->status === 'purchased' ? 'active' : 'purchased';
        
        $wishlist->update([
            'status' => $newStatus,
        ]);

        return redirect()->back()->with('success', 'Wishlist item status updated.');
    }

    public function storePrice(Request $request, WishlistItem $wishlist)
    {
        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0.01',
            'product_url' => 'required|url|max:500',
        ]);

        $wishlist->prices()->create($validated);

        return redirect()->back()->with('success', 'Price comparison link added.');
    }

    public function updatePrice(Request $request, WishlistItem $wishlist, WishlistPrice $price)
    {
        $validated = $request->validate([
            'site_name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0.01',
            'product_url' => 'required|url|max:500',
        ]);

        $price->update($validated);

        return redirect()->back()->with('success', 'Price comparison link updated.');
    }

    public function destroyPrice(WishlistItem $wishlist, WishlistPrice $price)
    {
        $price->delete();

        return redirect()->back()->with('success', 'Price link removed.');
    }
}