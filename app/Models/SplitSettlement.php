<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SplitSettlement extends Model
{
    use HasFactory;

    protected $fillable = ['split_event_id', 'payer_name', 'payee_name', 'amount', 'paid_at'];
    protected $casts = ['amount' => 'decimal:2', 'paid_at' => 'date'];

    public function event(): BelongsTo
    {
        return $this->belongsTo(SplitEvent::class, 'split_event_id');
    }
}