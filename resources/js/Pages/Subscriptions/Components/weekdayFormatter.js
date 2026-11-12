// resources/js/Pages/Subscriptions/Components/weekdayFormatter.js
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Format a weekdays array (0..6) into a short label like "Mon, Wed, Fri".
 * Returns null if weekdays is empty or not an array.
 */
export function formatWeekdays(weekdays) {
    if (!Array.isArray(weekdays) || weekdays.length === 0) return null;
    return weekdays.map((d) => WEEKDAY_SHORT[d]).join(', ');
}

/**
 * Full label for the frequency column, e.g. "weekly · Mon, Wed, Fri"
 * or just "monthly" for non-weekly rules.
 */
export function formatFrequency(frequency, weekdays) {
    if (frequency === 'weekly') {
        const label = formatWeekdays(weekdays);
        return label ? `weekly · ${label}` : 'weekly';
    }
    return frequency;
}