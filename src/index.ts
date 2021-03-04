import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import * as ko from 'knockout';
import { CoinCounter } from './CoinCounter';


ko.applyBindings(new CoinCounter(), document.querySelector('#app'));
