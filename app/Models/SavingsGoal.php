<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SavingsGoal extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'target_amount',
        'current_amount',
        'target_date',
        'status',
    ];

    protected $casts = [
        'target_amount'  => 'decimal:2',
        'current_amount' => 'decimal:2',
        'target_date'    => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    /* ---------- Computed helpers (used by the UI) ---------- */

    public function getProgressPercentageAttribute(): float
    {
        if ((float) $this->target_amount <= 0) {
            return 0;
        }
        return min(100, round(((float) $this->current_amount / (float) $this->target_amount) * 100, 2));
    }

    public function getRemainingAmountAttribute(): float
    {
        return max(0, (float) $this->target_amount - (float) $this->current_amount);
    }

    /** Refresh status based on current_amount vs target_amount. */
    public function syncStatus(): void
    {
        $status = (float) $this->current_amount >= (float) $this->target_amount
            ? 'completed'
            : 'active';

        if ($this->status !== $status) {
            $this->status = $status;
            $this->save();
        }
    }
}