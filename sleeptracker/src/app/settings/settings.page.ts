import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonToggle, IonButton,
  IonNote, AlertController } from '@ionic/angular/standalone';
import { ReminderService, ReminderSlot } from '../services/reminder.service';
import { SleepService } from '../services/sleep.service';
import { FeedbackService } from '../services/feedback.service';

/** Reminders (native notifications) and data management. */
@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonListHeader, IonItem, IonLabel, IonToggle, IonButton, IonNote],
})
export class SettingsPage implements OnInit {
  constructor(public reminders: ReminderService, private sleepService: SleepService, private feedback: FeedbackService,
    private alertCtrl: AlertController) {}

  ngOnInit() { this.reminders.load(); }

  async toggle(slot: ReminderSlot, e: CustomEvent) {
    const wanted = !!e.detail.checked;
    const ok = await this.reminders.setEnabled(slot, wanted);
    if (!ok && wanted) {
      (e.target as HTMLIonToggleElement).checked = false; // revert if we couldn't enable it
    } else {
      await this.feedback.tap();
    }
  }

  async test() {
    if (await this.reminders.sendTest(5)) await this.feedback.toast('Test reminder arrives in 5 seconds');
  }

  async loadSample() {
    await this.sleepService.loadSampleData();
    await this.feedback.toast('Sample week loaded');
  }

  /** Error prevention: confirm before destroying data. */
  async eraseAll() {
    const alert = await this.alertCtrl.create({
      header: 'Erase all data?',
      message: 'This permanently deletes every sleep and sleepiness log.',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        { text: 'Erase', role: 'destructive', handler: () => { this.sleepService.clearAll(); } },
      ],
    });
    await alert.present();
  }
}
