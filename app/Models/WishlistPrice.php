<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WishlistPrice extends Model
{
    use HasFactory;

    protected $fillable = ['wishlist_item_id', 'site_name', 'price', 'product_url'];
    protected $casts = ['price' => 'decimal:2'];

    public function item(): BelongsTo
    {
        return $this->belongsTo(WishlistItem::class, 'wishlist_item_id');
    }
}