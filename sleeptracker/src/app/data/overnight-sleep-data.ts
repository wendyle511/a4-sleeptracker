import { SleepData } from './sleep-data';
import { dayKey, formatDuration } from './date-utils';

export class OvernightSleepData extends SleepData {
	sleepStart: Date;
	sleepEnd: Date;

	constructor(sleepStart: Date, sleepEnd: Date) {
		super();
		this.sleepStart = sleepStart;
		this.sleepEnd = sleepEnd;
	}

	get durationMs(): number {
		return this.sleepEnd.getTime() - this.sleepStart.getTime();
	}

	/** The calendar day the person woke up; used to enforce one log per day. */
	get wakeKey(): string {
		return dayKey(this.sleepEnd);
	}

	override summaryString(): string {
		return formatDuration(this.durationMs);
	}

	override dateString(): string {
		return 'Night of ' + this.sleepStart.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
	}

	/** Rebuilds an instance from the JSON saved in storage. */
	static fromJSON(j: any): OvernightSleepData {
		const d = new OvernightSleepData(new Date(j.sleepStart), new Date(j.sleepEnd));
		d.id = j.id;
		d.loggedAt = new Date(j.loggedAt);
		return d;
	}
}
