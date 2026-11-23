import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/** Haptic feedback and "Undo" toasts (the app's "uh-oh" safety net). */
@Injectable({ providedIn: 'root' })
export class FeedbackService {
	constructor(private toastCtrl: ToastController) {}

	async tap() {
		try { await Haptics.impact({ style: ImpactStyle.Light }); } catch { /* not supported here */ }
	}

	async success() {
		try { await Haptics.notification({ type: NotificationType.Success }); } catch { /* not supported here */ }
	}

	async toast(message: string) {
		const t = await this.toastCtrl.create({ message, duration: 2000, position: 'bottom', positionAnchor: 'tab-bar' });
		await t.present();
	}

	/** Shows a toast with an Undo button that runs onUndo. */
	async toastUndo(message: string, onUndo: () => Promise<void> | void) {
		await this.success();
		const t = await this.toastCtrl.create({
			message,
			duration: 5000,
			position: 'bottom',
			positionAnchor: 'tab-bar',
			buttons: [{ text: 'Undo', role: 'cancel', handler: () => { onUndo(); } }]
		});
		await t.present();
	}
}
