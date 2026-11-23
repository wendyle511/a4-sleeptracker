import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface ReminderSlot {
	id: number;
	label: string;
	body: string;
	hour: number;
	minute: number;
	enabled: boolean;
}

const KEY = 'sleeptracker.reminders.v1';

/** Daily local notifications that prompt experience-sampling check-ins. */
@Injectable({ providedIn: 'root' })
export class ReminderService {
	slots: ReminderSlot[] = [
		{ id: 1, label: 'Morning sleep log', body: "How did you sleep? Log last night's sleep.", hour: 9, minute: 0, enabled: false },
		{ id: 2, label: 'Late-morning check-in', body: 'How alert do you feel right now?', hour: 11, minute: 0, enabled: false },
		{ id: 3, label: 'Afternoon check-in', body: 'Afternoon slump? Log your sleepiness.', hour: 14, minute: 0, enabled: false },
		{ id: 4, label: 'Evening check-in', body: 'How sleepy do you feel this evening?', hour: 17, minute: 0, enabled: false },
	];
	status = '';

	async load() {
		try {
			const { value } = await Preferences.get({ key: KEY });
			if (value) {
				const enabled: number[] = JSON.parse(value);
				this.slots.forEach(s => s.enabled = enabled.includes(s.id));
			}
		} catch (e) { console.error(e); }
	}

	timeString(s: ReminderSlot): string {
		const d = new Date();
		d.setHours(s.hour, s.minute, 0, 0);
		return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
	}

	private async ensurePermission(): Promise<boolean> {
		try {
			let perm = await LocalNotifications.checkPermissions();
			if (perm.display !== 'granted') perm = await LocalNotifications.requestPermissions();
			if (perm.display === 'granted') return true;
		} catch (e) { console.error(e); }
		this.status = 'Notifications are blocked. Allow them in your browser or device settings to get reminders.';
		return false;
	}

	/** Turns one reminder on or off. Returns false if it could not be enabled. */
	async setEnabled(slot: ReminderSlot, enabled: boolean): Promise<boolean> {
		this.status = '';
		try {
			if (enabled) {
				if (!(await this.ensurePermission())) return false;
				await LocalNotifications.schedule({
					notifications: [{
						id: slot.id,
						title: slot.id === 1 ? 'Log your sleep' : 'Sleepiness check-in',
						body: slot.body,
						schedule: { on: { hour: slot.hour, minute: slot.minute }, allowWhileIdle: true }
					}]
				});
			} else {
				await LocalNotifications.cancel({ notifications: [{ id: slot.id }] });
			}
		} catch (e) {
			console.error(e);
			this.status = 'Repeating reminders need the installed iOS/Android app. Use "Send a test" to try notifications in the browser.';
			if (enabled) return false;
		}
		slot.enabled = enabled;
		await Preferences.set({ key: KEY, value: JSON.stringify(this.slots.filter(s => s.enabled).map(s => s.id)) });
		return true;
	}

	/** Fires a sample check-in a few seconds from now. */
	async sendTest(seconds = 5): Promise<boolean> {
		if (!(await this.ensurePermission())) return false;
		try {
			await LocalNotifications.schedule({
				notifications: [{
					id: 99,
					title: 'Sleepiness check-in',
					body: 'How alert do you feel right now? Tap to log it.',
					schedule: { at: new Date(Date.now() + seconds * 1000) }
				}]
			});
			return true;
		} catch (e) {
			console.error(e);
			this.status = 'Could not schedule the test notification.';
			return false;
		}
	}
}
