import * as ko from 'knockout';
import { Observable } from 'knockout';

export class CoinCounter {
  title: Observable<string>;

  constructor() {
    this.title = ko.observable('Coin Counter');
  }
}
