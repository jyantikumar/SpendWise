<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Budget extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'category_id',
        'name',
        'amount',
        'period',
        'start_date',
        'end_date',
        'rollover',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
        'amount'     => 'decimal:2',
        'rollover'   => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function alerts()
    {
        return $this->hasMany(BudgetAlert::class);
    }

    public function resolveDateRange(): array
    {
        $start = $this->start_date
            ? $this->start_date->copy()
            : now()->startOfMonth();

        if ($this->period === 'custom' && $this->end_date) {
            return [$start->copy()->startOfDay(), $this->end_date->copy()->endOfDay()];
        }

        if ($this->period === 'weekly') {
            return [$start->copy()->startOfDay(), $start->copy()->addDays(6)->endOfDay()];
        }

        return [
            $start->copy()->startOfMonth()->startOfDay(),
            $start->copy()->endOfMonth()->endOfDay(),
        ];
    }

    public function spentAmount(): float
    {
        [$from, $to] = $this->resolveDateRange();

        return (float) Transaction::where('user_id', $this->user_id)
            ->where('type', 'expense')
            ->when($this->category_id, fn ($q) => $q->where('category_id', $this->category_id))
            ->whereBetween('transaction_date', [$from, $to])
            ->sum('amount');
    }

    public function remainingAmount(): float
    {
        $spent = $this->spentAmount();
        $carry = $this->rollover ? $this->carryoverBalance() : 0;

        return round((float) $this->amount + $carry - $spent, 2);
    }

    public function utilizationPercentage(): int
    {
        $spent = $this->spentAmount();

        if ((float) $this->amount <= 0) {
            return 0;
        }

        return (int) round(($spent / (float) $this->amount) * 100);
    }

    public function carryoverBalance(): float
    {
        return 0.0;
    }
}