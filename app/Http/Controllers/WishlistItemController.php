<?php

namespace App\Http\Controllers;

use App\Models\WishlistItem;
use App\Models\WishlistPrice;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WishlistItemController extends Controller
{
    /**
     * List only the authenticated user's wishlist items.
     */
    public function index()
    {
        $items = auth()->user()
            ->wishlistItems()
            ->with('prices')
            ->latest()
            ->get();

        return Inertia::render('Wishlist/Index', [
            'items' => $items,
        ]);
    }

    /**
     * Create a wishlist item owned by the authenticated user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'target_price' => 'nullable|numeric|min:0',
            'priority' => 'required|in:low,medium,high',
        ]);

        auth()->user()->wishlistItems()->create($validated);

        return redirect()->back()->with('success', 'Wishlist item created successfully.');
    }

    /**
     * Show a single wishlist item.
     * Ownership enforced by WishlistItem::resolveRouteBinding().
     */
    public function show(WishlistItem $wishlist)
    {
        $wishlist->load('prices');

        $lowestPrice = $wishlist->prices->min('price');

        return Inertia::render('Wishlist/Show', [
            'wishlist' => $wishlist,
            'lowestPrice' => $lowestPrice,
        ]);
    }

    /**
     * Update a wishlist item.
     * Ownership enforced by WishlistItem::resolveRouteBinding().
     */
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

    /**
     * Delete a wishlist item and its price links.
     * Ownership enforced by WishlistItem::resolveRouteBinding().
     */
    public function destroy(WishlistItem $wishlist)
    {
        $wishlist->prices()->delete();
        $wishlist->delete();

        return redirect()->route('wishlist.index')->with('success', 'Wishlist item deleted.');
    }

    /**
     * Toggle active/purchased status.
     * Ownership enforced by WishlistItem::resolveRouteBinding().
     */
    public function toggleStatus(WishlistItem $wishlist)
    {
        $newStatus = $wishlist->status === 'purchased' ? 'active' : 'purchased';

        $wishlist->update([
            'status' => $newStatus,
        ]);

        return redirect()->back()->with('success', 'Wishlist item status updated.');
    }

    /**
     * Add a price comparison link to a wishlist item.
     * Ownership enforced by WishlistItem::resolveRouteBinding().
     */
    public function storePrice(Request $request, WishlistItem $wishlist)
    {
        $validated = $request->validate([
            'site_name'   => 'required|string|max:255',
            'price'       => 'required|numeric|min:0.01',
            'product_url' => 'required|url|max:2000',
        ]);

        $wishlist->prices()->create($validated);

        return redirect()->back()->with('success', 'Price comparison link added.');
    }

    /**
     * Update a price comparison link.
     * The {wishlist} binding is user-scoped; the child {price} is verified
     * against the parent to prevent ID-swapping.
     */
    public function updatePrice(Request $request, WishlistItem $wishlist, WishlistPrice $price)
    {
        if ($price->wishlist_item_id !== $wishlist->id) {
            abort(403);
        }

        $validated = $request->validate([
            'site_name'   => 'required|string|max:255',
            'price'       => 'required|numeric|min:0.01',
            'product_url' => 'required|url|max:2000',
        ]);

        $price->update($validated);

        return redirect()->back()->with('success', 'Price comparison link updated.');
    }

    /**
     * Delete a price comparison link.
     */
    public function destroyPrice(WishlistItem $wishlist, WishlistPrice $price)
    {
        if ($price->wishlist_item_id !== $wishlist->id) {
            abort(403);
        }

        $price->delete();

        return redirect()->back()->with('success', 'Price link removed.');
    }
}