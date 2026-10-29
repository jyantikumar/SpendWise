<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WishlistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'target_price',
        'priority',
        'status',
    ];

    protected $casts = [
        'target_price' => 'decimal:2',
    ];

    public function prices()
    {
        return $this->hasMany(WishlistPrice::class);
    }
}