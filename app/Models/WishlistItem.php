<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WishlistItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
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
    public function resolveRouteBinding($value, $field = null)
{
    return $this->where('user_id', auth()->id())
                ->where($field ?? $this->getRouteKeyName(), $value)
                ->firstOrFail();
}
}