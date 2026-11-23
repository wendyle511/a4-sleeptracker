/* from the Stanford Sleepiness Scale */
/* https://web.stanford.edu/~dement/sss.html */

import { SleepData } from './sleep-data';

export class StanfordSleepinessData extends SleepData {
	public static ScaleValues = [undefined,//Sleepiness scale starts at 1
	'Feeling active, vital, alert, or wide awake', //1
	'Functioning at high levels, but not at peak; able to concentrate', //2
	'Awake, but relaxed; responsive but not fully alert', //3
	'Somewhat foggy, let down', //4
	'Foggy; losing interest in remaining awake; slowed down', //5
	'Sleepy, woozy, fighting sleep; prefer to lie down', //6
	'No longer fighting sleep, sleep onset soon; having dream-like thoughts']; //7

	/** Short names for compact UI (index 0 unused). */
	public static ShortLabels = ['', 'Wide awake', 'Alert', 'Relaxed', 'Foggy', 'Slowing down', 'Sleepy', 'Almost asleep'];
	/** Green (alert) to purple (asleep) so the scale reads at a glance. */
	public static Colors = ['', '#2fb67c', '#7bc96f', '#c4cc4f', '#f0b43c', '#ee8a3a', '#e0563f', '#9b3fb5'];

	loggedValue: number;
	note: string;

	constructor(loggedValue: number, loggedAt: Date = new Date(), note: string = '') {
		super();
		this.loggedValue = loggedValue;
		this.loggedAt = loggedAt;
		this.note = note;
	}

	get shortLabel(): string { return StanfordSleepinessData.ShortLabels[this.loggedValue]; }
	get color(): string { return StanfordSleepinessData.Colors[this.loggedValue]; }

	override summaryString(): string {
		return this.loggedValue + ": " + StanfordSleepinessData.ScaleValues[this.loggedValue];
	}

	/** Rebuilds an instance from the JSON saved in storage. */
	static fromJSON(j: any): StanfordSleepinessData {
		const d = new StanfordSleepinessData(j.loggedValue, new Date(j.loggedAt), j.note ?? '');
		d.id = j.id;
		return d;
	}
}
