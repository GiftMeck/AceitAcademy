/** Time helpers. All times are stored as millisecond timestamps. */
export const MIN = 60e3;
export const HOUR = 60 * MIN;
export const DAY = 24 * HOUR;
export const now = () => Date.now();

/** "5 min ago", "yesterday", "12 Sep" */
export function ago(t) {
  const d = now() - t;
  if (d < MIN) return 'just now';
  if (d < HOUR) return `${Math.floor(d / MIN)} min ago`;
  if (d < DAY) return `${Math.floor(d / HOUR)} h ago`;
  if (d < 2 * DAY) return 'yesterday';
  return new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

/** "Today, 19:00", "Tomorrow, 16:00", "Sat 3 Oct, 10:00" */
export function when(t) {
  const date = new Date(t);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((new Date(t).setHours(0, 0, 0, 0) - today) / DAY);
  const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (days === 0) return `Today, ${time}`;
  if (days === 1) return `Tomorrow, ${time}`;
  if (days === -1) return `Yesterday, ${time}`;
  return `${date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}, ${time}`;
}

/** Timestamp for a clock time a number of days from today. */
export function at(daysFromToday, hour, minute = 0) {
  const d = new Date(); d.setHours(hour, minute, 0, 0);
  return d.getTime() + daysFromToday * DAY;
}
