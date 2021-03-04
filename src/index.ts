import * as ko from 'knockout';
import { Observable } from 'knockout';

class App {
  title: Observable<string>;

  constructor() {
    this.title = ko.observable('Coin Counter');
  }
}

ko.applyBindings(new App(), document.querySelector('#app'));
