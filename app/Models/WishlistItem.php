<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WishlistItem extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'target_price', 'priority', 'status'];
    protected $casts = ['target_price' => 'decimal:2'];

    public function prices(): HasMany
    {
        return $this->hasMany(WishlistPrice::class);
    }
}