import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';

const STORAGE_KEY = 'sleeptracker.logs.v1';
const SESSION_KEY = 'sleeptracker.session.v1';

/**
 * Holds all logged data and backs it up with Capacitor Preferences
 * (localStorage in the browser, native key-value storage on a device).
 */
@Injectable({
  providedIn: 'root'
})
export class SleepService {
	public static AllSleepData: SleepData[] = [];
	public static AllOvernightData: OvernightSleepData[] = [];
	public static AllSleepinessData: StanfordSleepinessData[] = [];

	/** When the person pressed "Going to bed" (null if no sleep is in progress). */
	public sleepStartedAt: Date | null = null;

	/** Resolves once saved data has been loaded from storage. */
	public ready: Promise<void>;

	constructor() {
		this.ready = this.load();
	}

	/* Newest first, for display. Getters because Ionic templates can't bind static members. */
	get overnight(): OvernightSleepData[] {
		return [...SleepService.AllOvernightData].sort((a, b) => b.sleepEnd.getTime() - a.sleepEnd.getTime());
	}

	get sleepiness(): StanfordSleepinessData[] {
		return [...SleepService.AllSleepinessData].sort((a, b) => b.loggedAt.getTime() - a.loggedAt.getTime());
	}

	/** Logs a night. Only one night per wake-up day is kept, so a newer log replaces an older one. */
	public async logOvernightData(sleepData: OvernightSleepData) {
		const clash = SleepService.AllOvernightData.filter(o => o.wakeKey === sleepData.wakeKey && o.id !== sleepData.id);
		clash.forEach(c => this.remove(c));
		SleepService.AllSleepData.push(sleepData);
		SleepService.AllOvernightData.push(sleepData);
		await this.save();
	}

	public async logSleepinessData(sleepData: StanfordSleepinessData) {
		SleepService.AllSleepData.push(sleepData);
		SleepService.AllSleepinessData.push(sleepData);
		await this.save();
	}

	/** Re-adds an entry of either type (used by "Undo"). */
	public async restore(entry: SleepData) {
		if (entry instanceof OvernightSleepData) await this.logOvernightData(entry);
		else if (entry instanceof StanfordSleepinessData) await this.logSleepinessData(entry);
	}

	public async deleteEntry(entry: SleepData) {
		this.remove(entry);
		await this.save();
	}

	public async clearAll() {
		SleepService.AllSleepData.length = 0;
		SleepService.AllOvernightData.length = 0;
		SleepService.AllSleepinessData.length = 0;
		await this.save();
	}

	/** Starts a live sleep session; survives app restarts. */
	public async startSleep() {
		this.sleepStartedAt = new Date();
		await Preferences.set({ key: SESSION_KEY, value: this.sleepStartedAt.toISOString() });
	}

	public async cancelSleep() {
		this.sleepStartedAt = null;
		await Preferences.remove({ key: SESSION_KEY });
	}

	/** Ends the session and logs the night. Returns the new entry (or null if none was in progress). */
	public async finishSleep(): Promise<OvernightSleepData | null> {
		if (!this.sleepStartedAt) return null;
		const entry = new OvernightSleepData(this.sleepStartedAt, new Date());
		await this.cancelSleep();
		await this.logOvernightData(entry);
		return entry;
	}

	/** Fills the app with a week of realistic fake data (handy for demos). */
	public async loadSampleData() {
		const sleepHours = [7.5, 6.2, 8.1, 5.8, 7.0, 8.4, 7.3];
		const bedHours = [23.5, 0.5, 23, 1, 23.75, 22.75, 23.25];
		for (let i = 0; i < 7; i++) {
			const wake = new Date();
			wake.setDate(wake.getDate() - (6 - i));
			const bed = new Date(wake);
			bed.setHours(Math.floor(bedHours[i]), (bedHours[i] % 1) * 60, 0, 0);
			if (bedHours[i] > 12) bed.setDate(bed.getDate() - 1);
			wake.setTime(bed.getTime() + sleepHours[i] * 3600000);
			if (wake.getTime() < Date.now()) await this.logOvernightData(new OvernightSleepData(bed, wake));
			const check = new Date(wake);
			check.setHours(14, 20, 0, 0);
			if (check.getTime() < Date.now()) {
				await this.logSleepinessData(new StanfordSleepinessData(sleepHours[i] < 6.5 ? 5 : 3, check));
			}
		}
	}

	private remove(entry: SleepData) {
		const drop = (arr: SleepData[]) => {
			const i = arr.findIndex(e => e.id === entry.id);
			if (i >= 0) arr.splice(i, 1);
		};
		drop(SleepService.AllSleepData);
		drop(SleepService.AllOvernightData);
		drop(SleepService.AllSleepinessData);
	}

	private async save() {
		try {
			await Preferences.set({
				key: STORAGE_KEY,
				value: JSON.stringify({ overnight: SleepService.AllOvernightData, sleepiness: SleepService.AllSleepinessData })
			});
		} catch (e) {
			console.error('Could not save sleep data', e);
		}
	}

	private async load() {
		try {
			const session = await Preferences.get({ key: SESSION_KEY });
			if (session.value) this.sleepStartedAt = new Date(session.value);
			const { value } = await Preferences.get({ key: STORAGE_KEY });
			if (!value) return;
			const saved = JSON.parse(value);
			SleepService.AllSleepData.length = 0;
			SleepService.AllOvernightData.length = 0;
			SleepService.AllSleepinessData.length = 0;
			for (const o of saved.overnight ?? []) {
				const entry = OvernightSleepData.fromJSON(o);
				SleepService.AllOvernightData.push(entry);
				SleepService.AllSleepData.push(entry);
			}
			for (const s of saved.sleepiness ?? []) {
				const entry = StanfordSleepinessData.fromJSON(s);
				SleepService.AllSleepinessData.push(entry);
				SleepService.AllSleepData.push(entry);
			}
		} catch (e) {
			console.error('Could not load sleep data', e);
		}
	}
}
