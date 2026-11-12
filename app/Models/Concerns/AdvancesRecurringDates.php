<?php

namespace App\Models\Concerns;

use Carbon\Carbon;

trait AdvancesRecurringDates
{
    /**
     * Advance a date by one cycle.
     * For weekly rules, $weekdays is an array of 0..6 (Sun..Sat).
     * If empty/null, falls back to +1 week.
     */
    public static function advanceDate(Carbon $date, string $frequency, array $weekdays = []): Carbon
    {
        $next = $date->copy();

        switch ($frequency) {
            case 'daily':
                return $next->addDay();

            case 'weekly':
                $weekdays = array_values(array_unique(array_map('intval', $weekdays)));

                if (empty($weekdays)) {
                    return $next->addWeek();
                }

                // Walk forward day by day until we hit the next allowed weekday.
                // Cap at 8 iterations to guarantee termination.
                for ($i = 0; $i < 8; $i++) {
                    $next->addDay();
                    if (in_array($next->dayOfWeek, $weekdays, true)) {
                        return $next;
                    }
                }

                return $next; // unreachable, but safety net

            case 'monthly':
                return $next->addMonth();

            case 'yearly':
                return $next->addYear();
        }

        return $next;
    }
}