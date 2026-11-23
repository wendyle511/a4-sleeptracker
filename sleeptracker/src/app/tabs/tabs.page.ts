import { Component } from '@angular/core';
import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moon, list, settings } from 'ionicons/icons';

/** Bottom tab bar: Today / History / Settings (thumb-reachable on phones). */
@Component({
  selector: 'app-tabs',
  template: `
    <ion-tabs>
      <ion-tab-bar slot="bottom" id="tab-bar">
        <ion-tab-button tab="home" href="/tabs/home"><ion-icon name="moon"></ion-icon><ion-label>Today</ion-label></ion-tab-button>
        <ion-tab-button tab="history" href="/tabs/history"><ion-icon name="list"></ion-icon><ion-label>History</ion-label></ion-tab-button>
        <ion-tab-button tab="settings" href="/tabs/settings"><ion-icon name="settings"></ion-icon><ion-label>Settings</ion-label></ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>`,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  constructor() { addIcons({ moon, list, settings }); }
}
