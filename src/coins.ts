import * as ko from 'knockout';
import { Observable, Computed } from 'knockout';
import Big from 'big.js';

import penny from './img/penny.png';
import nickel from './img/nickel.png';
import dime from './img/dime.png';
import quarter from './img/quarter.png';

export class Coin {
  name: string;
  style: string;
  value: Big;
  imgSrc: any;
  max: Observable<number>;
  count: Observable<number>;
  addCoinEnabled?: Computed<boolean>;
  removeCoinEnabled?: Computed<boolean>;
  canTakeAway: Computed<boolean>;
  canAddMore: Computed<boolean>;

  constructor(name: string, imgSrc: any, value: Big, max: number = 10) {
    this.name = name;
    this.style = name.toLowerCase();
    this.value = value;
    this.imgSrc = imgSrc;
    this.max = ko.observable(max);
    this.count = ko.observable(0);
    this.canTakeAway = ko.computed(() => this.count() > 0);
    this.canAddMore = ko.computed(() => this.count() < this.max());
  }
}

/**
 * All the available coins:
 *
 * Penny, Nickel, Dime, Quarter
 */
export const coins = [
  new Coin('Penny', penny, Big('0.01')),
  new Coin('Nickel', nickel, Big('0.05')),
  new Coin('Dime', dime, Big('0.10')),
  new Coin('Quarter', quarter, Big('0.25'), 4),
];
