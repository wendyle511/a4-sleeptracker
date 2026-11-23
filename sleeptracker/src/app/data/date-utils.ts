/* Small date helpers shared by the data classes, service and pages. */

const pad = (n: number) => String(n).padStart(2, '0');

/** Local-time ISO string without a timezone suffix (what ion-datetime expects). */
export function toLocalISO(d: Date): string {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

/** A yyyy-mm-dd key for the local calendar day. */
export function dayKey(d: Date): string {
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatDuration(ms: number): string {
	const totalMinutes = Math.max(0, Math.round(ms / 60000));
	return `${Math.floor(totalMinutes / 60)}h ${pad(totalMinutes % 60)}m`;
}

export function formatTime(d: Date): string {
	return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/** h:mm:ss clock string, for live timers. */
export function formatClock(ms: number): string {
	const total = Math.max(0, Math.floor(ms / 1000));
	return `${Math.floor(total / 3600)}:${pad(Math.floor(total / 60) % 60)}:${pad(total % 60)}`;
}

/** Value format used by <input type="datetime-local"> (no seconds). */
export function toInputValue(d: Date): string {
	return toLocalISO(d).slice(0, 16);
}
