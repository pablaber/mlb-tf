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
    this.eloMap[winningTeamId].gp++;
    this.eloMap[winningTeamId].w++;

    this.eloMap[losingTeamId].score = losingTeamNewScore;
    this.eloMap[losingTeamId].gp++;
    this.eloMap[losingTeamId].l++;
  }

  /**
   * Returns the ELO map as a ranked array.
   * @return {Array<Object>}
   */
  asRankedArray() {
    return Object.entries(this.eloMap)
      .map(([key, value]) => {
        return {
          id: parseInt(key, 10),
          ...value,
        };
      })
      .sort((a, b) => {
        return b.score - a.score;
      });
  }

  /**
   * Populates the map with default values for any ids that are missing
   * @param {Array<Object>} teams - an array of teams to check ids and add
   */
  _addIdsToMapIfMissing(teams) {
    teams.forEach((team) => {
      const { id } = team;
      if (!this.eloMap[id]) {
        this.eloMap[id] = {
          name: team.abbreviation,
          score: STARTING_SCORE,
          gp: 0,
          w: 0,
          l: 0,
        };
      }
    });
  }
};

