<?php

namespace App\Models\Concerns;

use Carbon\Carbon;

trait AdvancesRecurringDates
{
    /**
     * Advance a date by one cycle.
     * For weekly or custom rules, $weekdays is an array of 0..6 (Sun..Sat).
     * If empty/null, falls back to +1 week for weekly, or +1 day for custom.
     */
    public static function advanceDate(Carbon $date, string $frequency, array $weekdays = []): Carbon
    {
        $next = $date->copy();
        $original = $date->copy();

        switch ($frequency) {
            case 'daily':
                $next->addDay();
                break;

            case 'weekly':
                $weekdays = array_values(array_unique(array_map('intval', $weekdays)));

                if (empty($weekdays)) {
                    $next->addWeek();
                    break;
                }

                for ($i = 0; $i < 8; $i++) {
                    $next->addDay();
                    if (in_array($next->dayOfWeek, $weekdays, true)) {
                        break;
                    }
                }
                break;

            case 'custom':
                $weekdays = array_values(array_unique(array_map('intval', $weekdays)));

                if (empty($weekdays)) {
                    $next->addDay();
                    break;
                }

                for ($i = 0; $i < 8; $i++) {
                    $next->addDay();
                    if (in_array($next->dayOfWeek, $weekdays, true)) {
                        break;
                    }
                }
                break;

            case 'monthly':
                $next->addMonthNoOverflow();
                break;

            case 'yearly':
                $next->addYearNoOverflow();
                break;

            default:
                $next->addMonthNoOverflow();
                break;
        }

        // ABSOLUTE SAFETY GUARD: Guaranteed to move forward at least 1 day
        if ($next->lte($original)) {
            return $original->addDay();
        }

        return $next;
    }
}