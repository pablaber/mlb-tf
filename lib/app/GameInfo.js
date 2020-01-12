'use strict';

const moment = require('moment');
const precond = require('precond');

const { POSITIONS, DATE_FORMATS } = require('../config/constants');

const AWAY_TEAM = 'awayTeam';
const HOME_TEAM = 'homeTeam';

module.exports = class GameInfo {
  /**
   * @constructor
   */
  constructor() {
    this.gameInfo = {};
  };

  /**
   * Create a gameInfo from a gameLog
   * @param {Object} client - the MSF API client
   * @param {Object} gameObject - raw game object
   * @param {Boolean} [loadLineup] - if the lineup should be loaded into game info
   *
   * @return {GameInfo}
   */
  static async loadFromGameObject(client, gameObject, loadLineup = false) {
    const gameInfo = new GameInfo();
    const { schedule, score } = gameObject;
    precond.checkState(schedule.playedStatus === 'COMPLETED', 'Can only load game info for a completed game.');
    const gameDate = moment(schedule.startTime).format(DATE_FORMATS.MSF);
    const gameId = schedule.id;

    gameInfo.loadSchedule(schedule);
    gameInfo.loadScore(score);

    if (loadLineup) {
      const rawGameLineup = await client.getGameLineup({
        date: gameDate,
        gameId,
      });
      gameInfo.loadLineup(rawGameLineup);
    }

    return gameInfo;
  }

  /**
   * Loads the information in the game.schedule object
   * @param {Object} gameSchedule - the game.schedule object
   */
  loadSchedule(gameSchedule) {
    if (!this.gameInfo[AWAY_TEAM]) {
      this.gameInfo[AWAY_TEAM] = gameSchedule.awayTeam;
    }
    if (!this.gameInfo[HOME_TEAM]) {
      this.gameInfo[HOME_TEAM] = gameSchedule.homeTeam;
    }
  }

  /**
   * Loads the information in the game.score object
   * @param {Object} gameScore - the game.score object
   */
  loadScore(gameScore) {
    this.gameInfo[AWAY_TEAM].scoring = {
      runs: gameScore.awayScoreTotal,
      hits: gameScore.awayHitsTotal,
      errors: gameScore.awayErrorsTotal,
    };
    this.gameInfo[HOME_TEAM].scoring = {
      runs: gameScore.homeScoreTotal,
      hits: gameScore.homeHitsTotal,
      errors: gameScore.homeErrorsTotal,
    };

    const { winner, loser } = _getOutcome(gameScore);
    this.gameInfo.winner = winner;
    this.gameInfo.loser = loser;
  }

  /**
   * Adds a boxscore response from a game to the gameInfo
   * @param {Object} rawBoxscore - the raw boxscore response from My Sports Feeds
   */
  loadBoxscore(rawBoxscore) {
    const { game, scoring, stats } = rawBoxscore;

    if (!this.gameInfo[AWAY_TEAM]) {
      this.gameInfo[AWAY_TEAM] = game.awayTeam;
    }
    this.gameInfo[AWAY_TEAM].scoring = {
      runs: scoring.awayScoreTotal,
      hits: scoring.awayHitsTotal,
      errors: scoring.awayErrorsTotal,
    };
    this.gameInfo[AWAY_TEAM].stats = stats.away;

    if (!this.gameInfo[HOME_TEAM]) {
      this.gameInfo[HOME_TEAM] = game.homeTeam;
    }
    this.gameInfo[HOME_TEAM].scoring = {
      runs: scoring.homeScoreTotal,
      hits: scoring.homeHitsTotal,
      errors: scoring.homeErrorsTotal,
    };
    this.gameInfo[HOME_TEAM].stats = stats.home;

    const { winner, loser } = _getOutcome(scoring);
    this.gameInfo.winner = winner;
    this.gameInfo.loser = loser;
  }

  /**
   * Adds lineup information to the game info object
   * @param {Object} rawGameLineup - raw lineup response from MSF
   */
  loadLineup(rawGameLineup) {
    if (!this.gameInfo[AWAY_TEAM]) {
      this.gameInfo[AWAY_TEAM] = rawGameLineup.game.awayTeam;
    }
    this.gameInfo[AWAY_TEAM].lineups = rawGameLineup.teamLineups.find((lu) => lu.team.id === this.getAwayTeam().id);

    if (!this.gameInfo[HOME_TEAM]) {
      this.gameInfo[HOME_TEAM] = rawGameLineup.game.homeTeam;
    }
    this.gameInfo[HOME_TEAM].lineups = rawGameLineup.teamLineups.find((lu) => lu.team.id === this.getHomeTeam().id);
  }

  /**
   * Gets the home team object
   * @return {Object}
   */
  getHomeTeam() {
    return this.gameInfo[HOME_TEAM];
  }

  /**
   * Gets the away team object
   * @return {Object}
   */
  getAwayTeam() {
    return this.gameInfo[AWAY_TEAM];
  }

  /**
   * Gets the home team's scoring object
   * @return {Object}
   */
  getHomeTeamScoring() {
    return this.gameInfo[HOME_TEAM].scoring;
  }

  /**
   * Gets the away team's scoring object
   * @return {Object}
   */
  getAwayTeamScoring() {
    return this.gameInfo[AWAY_TEAM].scoring;
  }

  /**
   * Gets the home team's stats object
   * @return {Object}
   */
  getHomeTeamStats() {
    return this.gameInfo[HOME_TEAM].stats.teamStats[0];
  }

  /**
   * Gets the away team's stats object
   * @return {Object}
   */
  getAwayTeamStats() {
    return this.gameInfo[AWAY_TEAM].stats.teamStats[0];
  }

  /**
   * Gets the home team's player stats array
   * @return {Array<Object>}
   */
  getHomeTeamPlayerStats() {
    return this.gameInfo[HOME_TEAM].stats.players;
  }

  /**
   * Gets the away team's player stats array
   * @return {Array<Object>}
   */
  getAwayTeamPlayerStats() {
    return this.gameInfo[AWAY_TEAM].stats.players;
  }

  /**
   * Gets the home team player stats by position
   * @param {String} position - player position to fetch stats for
   * @return {Object}
   */
  getHomeTeamPlayerStatsByPos(position) {
    precond.checkState(Object.values(POSITIONS).includes(position));
    return this.gameInfo[HOME_TEAM].stats.players.find((p) => p.player.position === position);
  }

  /**
   * Gets the away team player stats by position
   * @param {String} position - player position to fetch stats for
   * @return {Object}
   */
  getAwayTeamPlayerStatsByPos(position) {
    precond.checkState(Object.values(POSITIONS).includes(position));
    return this.gameInfo[AWAY_TEAM].stats.players.find((p) => p.player.position === position);
  }


  /**
   * Gets the home team's actual lineup
   * @return {Object}
   */
  getHomeTeamActualLineup() {
    return this.gameInfo[HOME_TEAM].lineups.actual.lineupPositions;
  }

  /**
   * Gets the away team's actual lineup
   * @return {Object}
   */
  getAwayTeamActualLineup() {
    return this.gameInfo[AWAY_TEAM].lineups.actual.lineupPositions;
  }

  /**
   * Gets the home team's expected lineup
   * @return {Object}
   */
  getHomeTeamExpectedLineup() {
    return this.gameInfo[HOME_TEAM].lineups.expected.lineupPositions;
  }

  /**
   * Gets the away team's expected lineup
   * @return {Object}
   */
  getAwayTeamExpectedLineup() {
    debugger;
    return this.gameInfo[AWAY_TEAM].lineups.expected.lineupPositions;
  }

  /**
   * Gets the home team's actual lineup player at position
   * @param {String} position - the position
   * @return {Object}
   */
  getHomeTeamActualPlayerAtPos(position) {
    precond.checkState(Object.values(POSITIONS).includes(position));
    const actualLineup = this.getHomeTeamActualLineup();
    const playerObj = actualLineup.find((p) => p.position === position);
    return playerObj ? playerObj.player : undefined;
  }

  /**
   * Gets the away team's actual lineup player at position
   * @param {String} position - the position
   * @return {Object}
   */
  getAwayTeamActualPlayerAtPos(position) {
    precond.checkState(Object.values(POSITIONS).includes(position));
    const actualLineup = this.getAwayTeamActualLineup();
    const playerObj = actualLineup.find((p) => p.position === position);
    return playerObj ? playerObj.player : undefined;
  }

  /**
   * Gets the home team's expected lineup player at position
   * @param {String} position - the position
   * @return {Object}
   */
  getHomeTeamExpectedPlayerAtPos(position) {
    precond.checkState(Object.values(POSITIONS).includes(position));
    const expectedLineup = this.getHomeTeamExpectedLineup();
    const playerObj = expectedLineup.find((p) => p.position === position);
    return playerObj ? playerObj.player : undefined;
  }

  /**
   * Gets the away team's expected lineup player at position
   * @param {String} position - the position
   * @return {Object}
   */
  getAwayTeamExpectedPlayerAtPos(position) {
    precond.checkState(Object.values(POSITIONS).includes(position));
    const expectedLineup = this.getAwayTeamExpectedLineup();
    const playerObj = expectedLineup.find((p) => p.position === position);
    return playerObj ? playerObj.player : undefined;
  }

  /**
   * Gets the winning team object
   * @return {Object}
   */
  getWinningTeam() {
    return this.gameInfo[this.gameInfo.winner];
  }

  /**
   * Gets the losing team object
   * @return {Object}
   */
  getLosingTeam() {
    return this.gameInfo[this.gameInfo.loser];
  }
};

/**
 * Gets the winner and loser of the scoring object submitted
 * @param {Object} rawBoxscoreScoring - the rawBoxscore.scoring object from MSF
 * @return {Object} an object containign the winner and loser
 */
function _getOutcome(rawBoxscoreScoring) {
  const homeScore = rawBoxscoreScoring.homeScoreTotal;
  const awayScore = rawBoxscoreScoring.awayScoreTotal;
  const winner = homeScore > awayScore ? HOME_TEAM : AWAY_TEAM;
  const loser = homeScore < awayScore ? HOME_TEAM : AWAY_TEAM;
  return { winner, loser };
};
