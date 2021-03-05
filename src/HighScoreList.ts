import * as ko from 'knockout';

import { app } from './app';

export interface HighScoreItem {
  score: number;
  name: string;
}

export class HighScoreList {
  #starterList: HighScoreItem[] = app.starterHighScoreList;

  List = ko.observableArray(this.#starterList);

  tryPushHighScore(newScoreItem: HighScoreItem) {
    const highScoreList = this.List();

    // The score was zero
    if (newScoreItem.score === 0) {
      return -1;
    }

    // There was no player name entered
    if (!newScoreItem.name) {
      newScoreItem.name = 'No name';
    }

    // High score list is empty
    if (highScoreList.length === 0) {
      this.List.push(newScoreItem);

      return 0;
    }

    for (let i = 0; highScoreList.length; i++) {
      const { score } = highScoreList[i];

      if (score < newScoreItem.score) {
        highScoreList.splice(i, 0, newScoreItem);
      }

      if (highScoreList.length > app.maxHighScoreItems) {
        highScoreList.length = app.maxHighScoreItems;
      }

      this.List(highScoreList);

      return i;
    }

    return -1;
  }
}
