<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SplitExpenseShare extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'split_expense_id', 'participant_name', 'share_amount', 'is_paid'];

    protected $casts = ['share_amount' => 'decimal:2', 'is_paid' => 'boolean'];

    public function expense(): BelongsTo
    {
        return $this->belongsTo(SplitExpense::class, 'split_expense_id');
    }
    public function user()
{
    return $this->belongsTo(User::class);
}
}