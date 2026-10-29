<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class BudgetAlert extends Model
{
    use HasFactory;

    protected $fillable = [
        'budget_id',
        'threshold_percentage',
        'triggered_at',
    ];

    protected $casts = [
        'triggered_at' => 'datetime',
    ];

    public function budget()
    {
        return $this->belongsTo(Budget::class);
    }
}