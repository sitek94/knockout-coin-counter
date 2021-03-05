import * as ko from 'knockout';
import * as $ from 'jquery';
import Big from 'big.js';

import { GameClock } from './GameClock';
import { HighScoreList } from './HighScoreList';
import { app } from './app';
import { coins, Coin } from './coins';
import { spacesToUnderscore } from './utils';

export class CoinCounterViewModel {
  highScoreList = new HighScoreList();
  gameClock = new GameClock(
    app.gameLengthInSeconds,
    this.handleGameClockElapsed.bind(this),
  );

  handleGameClockElapsed() {
    const highScoreIndex = this.highScoreList.tryPushHighScore({
      name: this.playerName(),
      score: this.score(),
    });

    let message = `Your score was ${this.score()}.`;

    if (highScoreIndex === 0) {
      message += `<br />That's the high score!`;
    } else if (highScoreIndex !== -1) {
      message += `<br />That's good for #${
        highScoreIndex + 1
      } on the high score list!`;
    }

    this.endOfGameMessage(message);

    $('#gameOverModal').modal('show');
  }

  statusMessage = ko.observable('');
  statusMessageVisible = ko.observable(false);

  isPaused = ko.computed(
    () =>
      !this.gameClock.isRunning() &&
      !this.statusMessageVisible() &&
      this.gameClock.secondsRemaining() > 0,
  );
  canBePaused = ko.computed(() => {
    return (
      this.gameClock.isRunning() &&
      this.gameClock.secondsRemaining() > 0 &&
      !this.statusMessageVisible()
    );
  });
  playerName = ko.observable('');
  playerNameQuestion = ko.observable('');
  app = app;
  goalAmount = ko.observable(null);
  score = ko.observable(0);
  scoreText = ko.computed(() => {
    return this.playerName() === ''
      ? `Score:  ${this.score()}`
      : `${this.playerName()}'s score: ${this.score()}`;
  });

  coins = coins;
  buttonsEnabled = ko.computed(() => {
    return !this.isPaused() && this.gameClock.isRunning();
  });

  imageElementName(coinName: string, zeroBasedIndex: number) {
    return 'img' + spacesToUnderscore(coinName) + String(zeroBasedIndex);
  }
  destinationDivIDForCoin(coin: Coin) {
    return 'draw' + spacesToUnderscore(coin.name);
  }
  addCoin = (coin: Coin) => {
    if (coin.count() === coin.max()) {
      return;
    }
    const oldCoinCount = coin.count();
    coin.count(coin.count() + 1);
    const newCoin = document.createElement('img');
    newCoin.src = coin.imgSrc;
    newCoin.id = this.imageElementName(coin.name, oldCoinCount);
    newCoin.classList.add(coin.style);
    const destinationDiv = document.getElementById(
      this.destinationDivIDForCoin(coin),
    );
    destinationDiv?.appendChild(newCoin);
  }
  removeCoin(coin: Coin) {
    if (coin.count() === 0) {
      return;
    }
    coin.count(coin.count() - 1);
    const coinToRemove = document.getElementById(
      this.imageElementName(coin.name, coin.count()),
    );
    coinToRemove?.parentNode?.removeChild(coinToRemove);
  }

  clearCoins() {
    for (let coinIndex = 0; coinIndex < coins.length; coinIndex += 1) {
      const coin = coins[coinIndex];
      coin.count(0);
      const div = document.getElementById(
        'draw' + spacesToUnderscore(coin.name),
      );
      while (div && div.lastChild) {
        div.removeChild(div.lastChild);
      }
    }
  }

  calculateTotal() {
    let total = Big(0);
    this.coins.forEach((coin: Coin) => {
      total = total.plus(coin.value.times(coin.count()));
    });
    return total;
  }

  addCoinEnabled(coin: Coin) {
    return this.buttonsEnabled() && coin.canAddMore();
  }

  removeCoinEnabled(coin: Coin) {
    return this.buttonsEnabled() && coin.canTakeAway();
  }

  checkForVictory() {
    let message;
    if (this.calculateTotal().eq(this.goalAmount())) {
      this.gameClock.stop();
      this.score(this.score() + app.pointsForCorrect);
      let coinsUsed = 0,
        bonusSeconds = 0;
      for (let i = 0; i < coins.length; i += 1) {
        if (coins[i].count() > 0) {
          coinsUsed += 1;
        }
      }
      bonusSeconds = coinsUsed * app.bonusSecondsForCorrectPerCoin;
      this.gameClock.addSeconds(bonusSeconds);
      message =
        'Correct!<br />+' +
        app.pointsForCorrect +
        ' points, +' +
        bonusSeconds +
        ' sec for coins used.';
      this.showStatusMessage(message, app.msTimeoutAfterCorrect, () => {
        $('#splash').removeClass('correct');
        this.startNewGame();
      });
      $('#splash').addClass('correct');
    } else {
      this.score(this.score() - app.pointsForIncorrect);
      message = 'Incorrect.<br />-' + app.pointsForIncorrect + ' points.';
      this.showStatusMessage(message, app.msTimeoutAfterIncorrect, () => {
        $('#splash').removeClass('flyIn');
      });
      $('#splash').addClass('flyIn');
    }
  }

  showStatusMessage(
    message: string,
    timeout: number,
    callback: (viewModel: CoinCounterViewModel) => void,
  ) {
    this.statusMessage(message);
    this.statusMessageVisible(true);

    setTimeout(() => {
      this.clearStatusMessage();
      if (callback) {
        callback(this);
      }
    }, timeout);
  }

  clearStatusMessage() {
    this.statusMessage('');
    this.statusMessageVisible(false);
  }

  startNewGame() {
    this.clearStatusMessage();
    this.clearCoins();
    var goalAmount = Math.floor(Math.random() * 100 + 1) / 100;
    this.goalAmount(Big(goalAmount.toFixed(2)));
    this.gameClock.start();
  }

  startBrandNewGame() {
    this.visiblePage('game');
    this.playerNameQuestion('Enter player name:');
    $('#gameOverModal').modal('hide');
    $('#nameModal').modal('show');
  }

  pauseGame() {
    this.gameClock.stop();
  }
  resumeGame() {
    this.gameClock.start();
  }

  whatTheUserShouldBeDoing() {
    if (this.goalAmount) {
      const ga = this.goalAmount();
      if (ga !== null && ga.toFixed) {
        return (
          'Try to make ' +
          ga.times(100).toString() +
          ' cent' +
          (ga.eq(Big('0.01')) ? '' : 's') +
          '.'
        );
      }
    }
    return '';
  }

  endOfGameVisible = ko.observable(false);
  endOfGameMessage = ko.observable('');
  visiblePage = ko.observable('game');
  gameVisible = ko.computed(() => {
    return this.visiblePage() === 'game';
  });
  highScoreVisible = ko.computed(() => {
    return this.visiblePage() === 'highscore';
  });
  aboutVisible = ko.computed(() => {
    return this.visiblePage() === 'about';
  });

  setGameVisible() {
    if (this.visiblePage() === 'game') {
      this.startBrandNewGame();
    }
    this.visiblePage('game');
  }
  setAboutPageVisible() {
    this.pauseGame();
    this.visiblePage('about');
  }
  setHighScoreVisible() {
    this.pauseGame();
    this.visiblePage('highscore');
  }
  unitTestsButtonClick() {
    if (!this.isPaused()) {
      this.pauseGame();
    }
    const response = confirm(
      `Do you want to run the unit tests?
      This will cancel any current game and forget your high scores.`,
    );
    if (response) {
      window.location.href = 'tests/tests.html';
    }
  }

  newGameButtonText = ko.computed(() => {
    return this.visiblePage() === 'game' ? 'New Game' : 'Game';
  });
  newGameButtonClass = ko.computed(() => {
    return this.gameVisible() ? 'active' : '';
  });
  highScoresButtonClass = ko.computed(() => {
    return this.highScoreVisible() ? 'active' : '';
  });
  aboutButtonClass = ko.computed(() => {
    return this.aboutVisible() ? 'active' : '';
  });

  initialize() {
    $('#nameModal')
      .on('shown.bs.modal', () => {
        setTimeout(() => {
          $('#playerNameInput').focus();
        }, 100);
      })
      .on('hidden.bs.modal', () => {
        this.startNewGame();
        this.score(0);
        this.gameClock.reset();
        this.gameClock.start();
      });
    $('#playerNameInput').bind('keypress', event => {
      if (event.keyCode === 13) {
        event.preventDefault();
        $('#playerNameOK').trigger('click');
      }
    });
    this.startBrandNewGame();
  }
}
