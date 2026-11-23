import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonProgressBar,
  ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moon, add, timeOutline, sunny, shareOutline } from 'ionicons/icons';
import { Share } from '@capacitor/share';
import { SleepService } from '../services/sleep.service';
import { FeedbackService } from '../services/feedback.service';
import { OvernightSleepData } from '../data/overnight-sleep-data';
import { StanfordSleepinessData } from '../data/stanford-sleepiness-data';
import { dayKey, formatClock, formatDuration, formatTime } from '../data/date-utils';
import { LogSleepModal } from '../log-sleep-modal/log-sleep-modal.component';
import { LogSleepinessModal } from '../log-sleepiness-modal/log-sleepiness-modal.component';

const GOAL_HOURS = 8;

/** "Today" tab: the most useful info plus one-tap logging, so no navigation is needed for common tasks. */
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardContent, IonButton, IonIcon, IonProgressBar],
})
export class HomePage implements OnInit, OnDestroy {
  now = new Date(); // ticks every second while the page is open (drives the sleep timer)
  private timer?: any;
  scale = [1, 2, 3, 4, 5, 6, 7];
  colors = StanfordSleepinessData.Colors;
  labels = StanfordSleepinessData.ShortLabels;
  formatTime = formatTime;

  constructor(public sleepService: SleepService, private modalCtrl: ModalController, private feedback: FeedbackService) {
    addIcons({ moon, add, timeOutline, sunny, shareOutline });
  }

  ngOnInit() { this.timer = setInterval(() => this.now = new Date(), 1000); }
  ngOnDestroy() { clearInterval(this.timer); }

  /** Live "Going to bed" session helpers. */
  get sleepStartedAt(): Date | null { return this.sleepService.sleepStartedAt; }
  get elapsed(): string {
    return this.sleepStartedAt ? formatClock(this.now.getTime() - this.sleepStartedAt.getTime()) : '';
  }

  async goToBed() {
    await this.sleepService.startSleep();
    await this.feedback.success();
  }

  async wakeUp() {
    const entry = await this.sleepService.finishSleep();
    if (entry) await this.feedback.toastUndo(`Logged ${entry.summaryString()} of sleep`, () => this.sleepService.deleteEntry(entry));
  }

  async cancelSession() {
    await this.sleepService.cancelSleep();
    await this.feedback.toast('Sleep session cancelled');
  }

  /** Native share sheet (falls back to a toast if sharing isn't available). */
  async share() {
    const night = this.lastNight ?? this.latestEarlier;
    if (!night) return;
    try {
      await Share.share({ title: 'My sleep', text: `I slept ${night.summaryString()} (${formatTime(night.sleepStart)} to ${formatTime(night.sleepEnd)}). ${night.dateString()}.` });
    } catch {
      await this.feedback.toast('Sharing is not available on this device');
    }
  }

  /** Insight tiles: average bedtime and alertness over the logged data. */
  get avgBedtime(): string {
    const nights = this.sleepService.overnight;
    if (!nights.length) return '—';
    // Minutes after 6pm so 11:30pm and 1:00am average sensibly.
    const mins = nights.map(o => {
      const m = o.sleepStart.getHours() * 60 + o.sleepStart.getMinutes();
      return (m - 18 * 60 + 1440) % 1440;
    });
    const avg = Math.round(mins.reduce((a, b) => a + b, 0) / mins.length);
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setMinutes((avg + 18 * 60) % 1440);
    return formatTime(d);
  }

  get avgAlertness(): string {
    const all = this.sleepService.sleepiness;
    return all.length ? (all.reduce((s, e) => s + e.loggedValue, 0) / all.length).toFixed(1) + ' / 7' : '—';
  }

  get bestNight(): string {
    const nights = this.sleepService.overnight;
    return nights.length ? formatDuration(Math.max(...nights.map(o => o.durationMs))) : '—';
  }

  get greeting(): string {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  }

  /** Last night's log if there is one for today, otherwise null. */
  get lastNight(): OvernightSleepData | null {
    const key = dayKey(new Date());
    return this.sleepService.overnight.find(o => o.wakeKey === key) ?? null;
  }

  get latestEarlier(): OvernightSleepData | null {
    return this.sleepService.overnight[0] ?? null;
  }

  get goalPercent(): number {
    return this.lastNight ? Math.min(1, this.lastNight.durationMs / 3600000 / GOAL_HOURS) : 0;
  }

  get todaysCheckIns(): StanfordSleepinessData[] {
    const key = dayKey(new Date());
    return this.sleepService.sleepiness.filter(s => dayKey(s.loggedAt) === key);
  }

  /** Last 7 days of sleep for the bar chart. */
  get week() {
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const entry = this.sleepService.overnight.find(o => o.wakeKey === dayKey(d));
      const hours = entry ? entry.durationMs / 3600000 : 0;
      out.push({
        label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
        hours,
        text: hours ? hours.toFixed(1) : '',
        pct: Math.min(100, (hours / 10) * 100),
        low: hours > 0 && hours < 7,
        today: i === 0,
      });
    }
    return out;
  }

  get average(): string {
    const recent = this.sleepService.overnight.slice(0, 7);
    if (!recent.length) return '';
    const avg = recent.reduce((sum, o) => sum + o.durationMs, 0) / recent.length / 3600000;
    return avg.toFixed(1) + ' h avg';
  }

  async logSleep() {
    const modal = await this.modalCtrl.create({ component: LogSleepModal });
    await modal.present();
  }

  async logSleepinessDetailed() {
    const modal = await this.modalCtrl.create({ component: LogSleepinessModal });
    await modal.present();
  }

  /** One-tap logging at the current time, with Undo in case of a mis-tap. */
  async quickLog(value: number) {
    const entry = new StanfordSleepinessData(value);
    await this.sleepService.logSleepinessData(entry);
    await this.feedback.toastUndo(`Logged ${value} · ${this.labels[value]}`, () => this.sleepService.deleteEntry(entry));
  }
}
