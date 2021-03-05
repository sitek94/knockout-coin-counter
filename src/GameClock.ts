import * as ko from 'knockout';
import { Observable, Computed } from 'knockout';

export class GameClock {
  _initialTimeInSeconds: number;
  _intervalHandle?: number;
  _callbackOnClockElapsed: () => void;

  isRunning: Observable<boolean>;
  secondsRemaining: Observable<number>;
  timeRemainingFormatted: Computed<string>;

  constructor(initialTimeInSeconds = 30, callbackOnClockElapsed: () => void) {
    this._initialTimeInSeconds = initialTimeInSeconds;
    this._callbackOnClockElapsed = callbackOnClockElapsed;

    this.isRunning = ko.observable(false);
    this.secondsRemaining = ko.observable(this._initialTimeInSeconds);
    this.timeRemainingFormatted = ko.computed(() => {
      const date = new Date();
      date.setSeconds(this.secondsRemaining());
      const result = date.toISOString().substr(14, 5);
      return result.replace(/^0+/, '');
    });
  }

  start() {
    if (this.isRunning()) return;

    this.isRunning(true);
    this._intervalHandle = window.setInterval(this._tick, 1000);
  }
  stop() {
    this.isRunning(false);
    clearInterval(this._intervalHandle);
  }
  reset() {
    this.stop();
    this.secondsRemaining(this._initialTimeInSeconds);
  }
  addSeconds(numberOfSeconds: number) {
    this.secondsRemaining(this.secondsRemaining() + numberOfSeconds);
  }

  _tick() {
    if (!this.isRunning()) {
      return;
    }

    this.secondsRemaining(this.secondsRemaining() - 1);

    if (this.secondsRemaining() <= 0) {
      this.stop();
      this.secondsRemaining(0);
      if (
        this._callbackOnClockElapsed &&
        typeof this._callbackOnClockElapsed === 'function'
      ) {
        this._callbackOnClockElapsed();
      }
    }
  }
}
