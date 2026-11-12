// resources/js/Pages/Subscriptions/Components/dateHelpers.js

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_SHORT   = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Parse a "YYYY-MM-DD" string into a JS Date at local midnight.
 * Avoids the `new Date("YYYY-MM-DD")` UTC-vs-local off-by-one issue.
 */
function parseISODate(iso) {
    if (!iso) return null;
    const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

/** "2026-11-14" → "Fri" */
export function weekdayShort(iso) {
    const date = parseISODate(iso);
    return date ? WEEKDAY_SHORT[date.getDay()] : null;
}

/** "2026-11-14" → "Nov 14" */
export function monthDayShort(iso) {
    const date = parseISODate(iso);
    return date ? `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}` : null;
}

/** "2026-11-14" → "Nov 14, Fri" */
export function dateWithWeekday(iso) {
    const date = parseISODate(iso);
    if (!date) return null;
    return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}, ${WEEKDAY_SHORT[date.getDay()]}`;
}

/** "2026-11-14" → "Today, Wed" | "Nov 14, Fri" | "—" */
export function dueDateLabel(iso) {
    if (!iso) return '—';
    const today = new Date();
    const date = parseISODate(iso);
    if (!date) return '—';
    const isToday = date.getFullYear() === today.getFullYear()
        && date.getMonth() === today.getMonth()
        && date.getDate() === today.getDate();
    const weekday = WEEKDAY_SHORT[date.getDay()];
    if (isToday) return `Today, ${weekday}`;
    return `${MONTH_SHORT[date.getMonth()]} ${date.getDate()}, ${weekday}`;
}