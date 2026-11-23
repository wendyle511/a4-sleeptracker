import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonButton,
  IonIcon, IonNote, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, moonOutline } from 'ionicons/icons';
import { SleepService } from '../services/sleep.service';
import { FeedbackService } from '../services/feedback.service';
import { SleepData } from '../data/sleep-data';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { formatTime } from '../data/date-utils';
import { LogSleepModal } from '../log-sleep-modal/log-sleep-modal.component';
import { LogSleepinessModal } from '../log-sleepiness-modal/log-sleepiness-modal.component';

/** Lists both kinds of logged data; tap an entry to edit, trash icon to delete (with Undo). */
@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
  styleUrls: ['history.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem,
    IonButton, IonIcon, IonNote, DatePipe],
})
export class HistoryPage {
  view: 'sleep' | 'sleepiness' = 'sleep';
  formatTime = formatTime;

  constructor(public sleepService: SleepService, private modalCtrl: ModalController, private feedback: FeedbackService) {
    addIcons({ trashOutline, moonOutline });
  }

  get averageSleep(): string {
    const all = this.sleepService.overnight;
    return all.length ? (all.reduce((s, o) => s + o.durationMs, 0) / all.length / 3600000).toFixed(1) + ' h' : '';
  }

  get averageSleepiness(): string {
    const all = this.sleepService.sleepiness;
    return all.length ? (all.reduce((s, o) => s + o.loggedValue, 0) / all.length).toFixed(1) : '';
  }

  async edit(entry: OvernightSleepData | StanfordSleepinessData) {
    const component = entry instanceof OvernightSleepData ? LogSleepModal : LogSleepinessModal;
    const modal = await this.modalCtrl.create({ component, componentProps: { entry } });
    await modal.present();
  }

  async remove(entry: SleepData) {
    await this.sleepService.deleteEntry(entry);
    await this.feedback.toastUndo('Entry deleted', () => this.sleepService.restore(entry));
  }
}
