<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecurringTransaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'account_id',
        'category_id',
        'title',
        'notes',
        'amount',
        'type',
        'frequency',
        'weekdays',
        'start_date',
        'end_date',
        'next_due_date',
        'last_generated_at',
        'is_active',
        'auto_create',
        'skipped_dates',
    ];

    protected $casts = [
        'weekdays'          => 'array',
        'skipped_dates'     => 'array',
        'start_date'        => 'date',
        'end_date'          => 'date',
        'next_due_date'     => 'date',
        'last_generated_at' => 'date',
        'is_active'         => 'boolean',
        'auto_create'       => 'boolean',
        'amount'            => 'decimal:2',
    ];

    protected $appends = ['is_expired'];

    // ------------------------------------------------------------------
    // Relations
    // ------------------------------------------------------------------

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class)->withTrashed();
    }

    // ------------------------------------------------------------------
    // Accessors
    // ------------------------------------------------------------------

    /**
     * A rule is "expired" when it has an end_date that is strictly before
     * today. Expired rules can no longer generate future instances, but they
     * are kept in the database so the user can review/edit/delete them.
     */
    public function getIsExpiredAttribute(): bool
    {
        return $this->end_date && $this->end_date->lt(Carbon::today());
    }

    // ------------------------------------------------------------------
    // Schedule helpers
    // ------------------------------------------------------------------

    public static function advanceDate($date, string $frequency, $weekdays = null): Carbon
    {
        $cursor = $date instanceof Carbon ? $date->copy() : Carbon::parse($date);
        $cursor->startOfDay();

        switch ($frequency) {
            case 'daily':
                return $cursor->addDay();

            case 'weekly':
                return $cursor->addWeek();

            case 'monthly':
                return $cursor->addMonthNoOverflow();

            case 'yearly':
                return $cursor->addYearNoOverflow();

            case 'custom':
                $allowed = self::normalizeWeekdaysArray($weekdays);

                if (empty($allowed)) {
                    return $cursor->addDay();
                }

                for ($i = 1; $i <= 7; $i++) {
                    $candidate = $cursor->copy()->addDays($i);
                    if (in_array($candidate->dayOfWeek, $allowed, true)) {
                        return $candidate;
                    }
                }

                return $cursor->addDay();

            default:
                return $cursor->addMonthNoOverflow();
        }
    }

    public static function normalizeWeekdaysArray($value): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        if (is_string($value)) {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : [];
        }

        if (!is_array($value)) {
            return [];
        }

        $cleaned = [];
        foreach ($value as $v) {
            if (!is_numeric($v)) {
                continue;
            }
            $day = (int) $v;
            if ($day >= 0 && $day <= 6) {
                $cleaned[$day] = $day;
            }
        }

        ksort($cleaned);
        return array_values($cleaned);
    }
}