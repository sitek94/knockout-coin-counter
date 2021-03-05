import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

import * as ko from 'knockout';
import * as $ from 'jquery';

import { CoinCounterViewModel } from './CoinCounterViewModel';

$(() => {
  const viewModel = new CoinCounterViewModel();

  viewModel.initialize();

  ko.applyBindings(viewModel, document.querySelector('#app'));
});
