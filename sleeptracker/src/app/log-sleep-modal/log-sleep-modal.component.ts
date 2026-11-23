import { Component, Input, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonInput,
  ModalController } from '@ionic/angular/standalone';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { dayKey, formatDuration, toInputValue } from '../data/date-utils';
import { SleepService } from '../services/sleep.service';
import { FeedbackService } from '../services/feedback.service';

/** Modal for logging (or editing) one night of sleep. */
@Component({
  selector: 'app-log-sleep-modal',
  templateUrl: './log-sleep-modal.component.html',
  styleUrls: ['./log-sleep-modal.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonInput],
})
export class LogSleepModal implements OnInit {
  @Input() entry?: OvernightSleepData; // set when editing an existing log

  bed = '';
  wake = '';
  maxIso = toInputValue(new Date()); // can't log a wake-up time in the future

  constructor(private modalCtrl: ModalController, private sleepService: SleepService, private feedback: FeedbackService) {}

  ngOnInit() {
    if (this.entry) {
      this.bed = toInputValue(this.entry.sleepStart);
      this.wake = toInputValue(this.entry.sleepEnd);
      return;
    }
    // Sensible default: woke at 7am today (or now, if earlier) after 8 hours in bed.
    const wake = new Date();
    const seven = new Date(); seven.setHours(7, 0, 0, 0);
    if (wake.getTime() > seven.getTime()) wake.setTime(seven.getTime());
    this.wake = toInputValue(wake);
    this.bed = toInputValue(new Date(wake.getTime() - 8 * 3600000));
  }

  onBed(e: CustomEvent) { this.bed = String(e.detail.value ?? ''); }
  onWake(e: CustomEvent) { this.wake = String(e.detail.value ?? ''); }

  private get durationMs() { return new Date(this.wake).getTime() - new Date(this.bed).getTime(); }
  get duration() { return this.durationMs > 0 && !isNaN(this.durationMs) ? formatDuration(this.durationMs) : '—'; }

  /** Error prevention: explain why Save is disabled. */
  get error(): string {
    if (isNaN(this.durationMs)) return 'Choose both a bedtime and a wake-up time.';
    if (this.durationMs <= 0) return 'Wake-up time must be after bedtime.';
    if (this.durationMs > 16 * 3600000) return "That's over 16 hours. Check the AM/PM and dates.";
    if (new Date(this.wake).getTime() > Date.now()) return "Wake-up time can't be in the future.";
    return '';
  }

  /** One log per day: warn that saving replaces an existing night. */
  get replacing(): boolean {
    const key = dayKey(new Date(this.wake));
    return this.sleepService.overnight.some(o => o.id !== this.entry?.id && o.wakeKey === key);
  }

  async save() {
    if (this.error) return;
    if (this.entry) await this.sleepService.deleteEntry(this.entry);
    await this.sleepService.logOvernightData(new OvernightSleepData(new Date(this.bed), new Date(this.wake)));
    await this.feedback.success();
    await this.modalCtrl.dismiss(null, 'saved');
  }

  cancel() { return this.modalCtrl.dismiss(null, 'cancel'); }
}
