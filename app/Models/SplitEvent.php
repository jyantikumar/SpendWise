<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SplitEvent extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'event_date', 'status'];
    protected $casts = ['event_date' => 'date'];

    public function expenses(): HasMany
    {
        return $this->hasMany(SplitExpense::class);
    }

    public function settlements(): HasMany
    {
        return $this->hasMany(SplitSettlement::class);
    }
}