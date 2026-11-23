--Readme document for Wendy Le, wle7@uci.edu, 61014392
Assignment Group Number: [FILL IN, or replace with: Completed individually]

1. How many assignment points do you believe you completed (replace the *'s with your numbers)?

10/10 (+1 bonus: both a native resource AND data backup)
- 1/1 The ability to log overnight sleep
- 1/1 The ability to log sleepiness during the day
- 1/1 The ability to view these two categories of logged data
- 2/2 Either using a native device resource or backing up logged data
- 2/2 Following good principles of mobile design
- 2/2 Creating a compelling app
- 1/1 A readme and demo video which explains how these features were implemented and their design rationale

2. How long, in hours, did it take you to complete this assignment?

18 hours

3. What online resources did you consult when completing this assignment? (list specific URLs)

https://ionicframework.com/docs/ (components: input, range, tabs, toast, modal, alert)
https://capacitorjs.com/docs/apis/preferences
https://capacitorjs.com/docs/apis/local-notifications
https://capacitorjs.com/docs/apis/haptics
https://capacitorjs.com/docs/apis/share
https://www.med.upenn.edu/cbti/assets/user-content/documents/Stanford%20Sleepiness%20Scale.pdf

4. What classmates or other individuals did you consult as part of this assignment? What did you discuss?

None. I worked on this assignment by myself.

5. Is there anything special we need to know in order to run your code?

Run `npm install` in the sleeptracker folder (three new dependencies were added: @capacitor/preferences,
@capacitor/local-notifications and @capacitor/share), then `ionic serve`. Tested with Node 24 in Chrome; requires the Ionic CLI (`npm install -g @ionic/cli`) or use `npx ionic serve`.
Opens at localhost:8100 (use Chrome device mode for the phone view). Allow notifications when prompted.
Settings tab -> "Load a week of sample data" fills the app for a quick tour. "Send a test reminder" shows a
notification 5 seconds later in the browser. Repeating daily reminders only fire in the installed iOS/Android app.

--Aim for no more than two sentences for each of the following questions.--


6. Did you design your app with a particular type of user in mind? If so, whom?

College students, who have irregular schedules, are often sleep-deprived, and want a very low-effort way to notice patterns.

7. Did you design your app specifically for iOS or Android, or both?

Primarily iOS conventions (bottom tab bar, large collapsing titles, segmented control, inset lists, native date-time inputs), 
but all components are Ionic and adapt to Material on Android.

8. How can a person log overnight sleep in your app? Why did you choose to support logging overnight sleep in this way?

Two ways from the Today tab. At bedtime, tap "Going to bed" and tap "I'm awake" in the morning (a live timer; the session survives closing the app) so nothing has to be remembered. 
Or, to log after the fact, one button opens a modal with two native date-time fields for bedtime and wake-up time, pre-filled with a typical night (7am wake-up, 8 hours earlier bedtime) 
so most people only tweak a value. The live total, a future-time limit, and plain-language errors prevent mistakes, and logging again for the same day replaces the old log after a visible warning.

9. How can a person log sleepiness during the day in your app? Why did you choose to support logging sleepiness in this way?

Seven colored buttons (the Stanford scale, 1-7) on the Today tab log a check-in at the current time with a single tap, because experience sampling only works if each log takes seconds. 
"Add details" opens a modal with a slider, a date-time field for logging earlier moments, and an optional note (coffee, bad night, etc.).

10. How can a person view the data they logged in your app? Why did you choose to support viewing logged data in this way?

The Today tab shows last night against an 8-hour goal and a 7-day bar chart and insight tiles (average bedtime, best night, average alertness) for the at-a-glance view; 
the History tab has a Sleep/Sleepiness segmented control with full lists and averages. Entries can be tapped to edit or deleted.

11. Which feature choose--using a native device resource, backing up logged data, or both?

Both

12. If you used a native device resource, what feature did you add? How does this feature change the app's experience for a user?

Local notifications (@capacitor/local-notifications) send up to four daily reminders (morning sleep log plus three sleepiness check-ins) so the person doesn't have to remember to log. 
Haptics (@capacitor/haptics) give tactile confirmation when logging and on slider changes, and the native share sheet (@capacitor/share) lets a person send last night's sleep to a friend.

13. If you backed up logged data, where does it back up to?

Capacitor Preferences (@capacitor/preferences): browser localStorage on web and native key-value storage on device. Every log, edit, delete, and undo is saved, and data is reloaded on startup.

14. How does your app implement or follow principles of good mobile design?

- Useful initial view: Today tab shows last night, a one-tap check-in, and the week chart.
- "Uh-oh" button: every log and delete shows an Undo toast; Erase All requires confirmation.
- Error prevention: sensible defaults, no future times, wake-after-bed and 16-hour checks with explanations, duplicate-night warning.
- Platform conventions: bottom tabs, large titles, segmented control, clear explicit controls (visible delete buttons), native date-time inputs, haptics, dark mode support, and a restrained blue palette defined in theme/variables.scss.