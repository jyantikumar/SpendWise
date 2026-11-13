<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SplitExpense extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'split_event_id', 'paid_by', 'amount', 'description'];


    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(SplitEvent::class, 'split_event_id');
    }

    public function shares(): HasMany
    {
        return $this->hasMany(SplitExpenseShare::class);
    }
    public function user()
{
    return $this->belongsTo(User::class);
}
}