'use strict';

const EloRating = require('elo-rating');

const STARTING_SCORE = 1000;

module.exports = class EloMap {
  /**
   * @constructor
   */
  constructor() {
    this.eloMap = {};
  }

  /**
   * Updates from a GameInfo instance
   * @param {GameInfo} gameInfo - the game to update the elo rankings
   */
  update(gameInfo) {
    const winningTeam = gameInfo.getWinningTeam();
    const losingTeam = gameInfo.getLosingTeam();
    const winningTeamId = winningTeam.id;
    const losingTeamId = losingTeam.id;
    this._addIdsToMapIfMissing([winningTeam, losingTeam]);
    const winningTeamOldScore = this.eloMap[winningTeamId].score;
    const losingTeamOldScore = this.eloMap[losingTeamId].score;

    const {
      playerRating: winningTeamNewScore,
      opponentRating: losingTeamNewScore,
    } = EloRating.calculate(winningTeamOldScore, losingTeamOldScore);

    this.eloMap[winningTeamId].score = winningTeamNewScore;
    this.eloMap[losingTeamId].score = losingTeamNewScore;
  }

  /**
   * Populates the map with default values for any ids that are missing
   * @param {Array<Object>} teams - an array of teams to check ids and add
   */
  _addIdsToMapIfMissing(teams) {
    teams.forEach((team) => {
      debugger;
      const { id } = team;
      if (!this.eloMap[id]) {
        this.eloMap[id] = {
          name: team.abbreviation,
          score: STARTING_SCORE,
        };
      }
    });
  }
};

