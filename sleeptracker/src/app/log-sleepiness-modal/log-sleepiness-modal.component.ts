import { Component, Input, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonInput,
  IonRange, IonTextarea, ModalController } from '@ionic/angular/standalone';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { toInputValue } from '../data/date-utils';
import { SleepService } from '../services/sleep.service';
import { FeedbackService } from '../services/feedback.service';

/** Modal for a detailed sleepiness log: choose scale value, time, and an optional note. */
@Component({
  selector: 'app-log-sleepiness-modal',
  templateUrl: './log-sleepiness-modal.component.html',
  styleUrls: ['./log-sleepiness-modal.component.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonList, IonItem, IonInput, IonRange, IonTextarea],
})
export class LogSleepinessModal implements OnInit {
  @Input() entry?: StanfordSleepinessData; // set when editing

  level = 3;
  when = '';
  note = '';
  maxIso = toInputValue(new Date());

  constructor(private modalCtrl: ModalController, private sleepService: SleepService, private feedback: FeedbackService) {}

  ngOnInit() {
    if (this.entry) {
      this.level = this.entry.loggedValue;
      this.when = toInputValue(this.entry.loggedAt);
      this.note = this.entry.note;
    } else {
      this.when = toInputValue(new Date());
    }
  }

  get color() { return StanfordSleepinessData.Colors[this.level]; }
  get shortLabel() { return StanfordSleepinessData.ShortLabels[this.level]; }
  get description() { return StanfordSleepinessData.ScaleValues[this.level]; }

  onLevel(e: CustomEvent) { this.level = Number(e.detail.value); this.feedback.tap(); }
  onWhen(e: CustomEvent) { this.when = String(e.detail.value ?? ''); }
  onNote(e: CustomEvent) { this.note = String(e.detail.value ?? ''); }

  async save() {
    if (isNaN(new Date(this.when).getTime())) return; // need a valid time
    if (this.entry) await this.sleepService.deleteEntry(this.entry);
    await this.sleepService.logSleepinessData(new StanfordSleepinessData(this.level, new Date(this.when), this.note.trim()));
    await this.feedback.success();
    await this.modalCtrl.dismiss(null, 'saved');
  }

  cancel() { return this.modalCtrl.dismiss(null, 'cancel'); }
}
