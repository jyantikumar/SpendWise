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
        return $this->belongsTo(Category::class);
    }

    // ------------------------------------------------------------------
    // Schedule helpers
    // ------------------------------------------------------------------

    /**
     * Advance a date by one step of the given frequency.
     *
     * For weekly frequency with one or more weekdays, this walks forward
     * to the NEXT allowed weekday (never returns the input date itself).
     * For daily/monthly/yearly, it's a simple addDay/addMonth/addYear.
     *
     * @param  Carbon|string  $date
     * @param  string         $frequency   daily|weekly|monthly|yearly
     * @param  array|string|null  $weekdays  Array of ints 0..6 (or JSON string)
     * @return Carbon
     */
    public static function advanceDate($date, string $frequency, $weekdays = null): Carbon
    {
        $cursor = $date instanceof Carbon ? $date->copy() : Carbon::parse($date);
        $cursor->startOfDay();

        switch ($frequency) {
            case 'daily':
                return $cursor->addDay();

            case 'monthly':
                return $cursor->addMonthNoOverflow();

            case 'yearly':
                return $cursor->addYearNoOverflow();

            case 'weekly':
                $allowed = self::normalizeWeekdaysArray($weekdays);

                // No specific weekdays → just advance 7 days
                if (empty($allowed)) {
                    return $cursor->addWeek();
                }

                // Walk forward up to 7 days to find the next allowed weekday.
                // We start at +1 day so we never return the input date itself.
                for ($i = 1; $i <= 7; $i++) {
                    $candidate = $cursor->copy()->addDays($i);
                    if (in_array($candidate->dayOfWeek, $allowed, true)) {
                        return $candidate;
                    }
                }

                // Fallback (shouldn't happen if $allowed is non-empty)
                return $cursor->addWeek();

            default:
                return $cursor->addMonthNoOverflow();
        }
    }

    /**
     * Normalize a weekdays value (array, JSON string, or null) into a sorted,
     * unique array of integers 0..6.
     */
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