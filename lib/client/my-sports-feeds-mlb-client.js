'use strict';

const querystring = require('querystring');
const precond = require('precond');
const request = require('superagent');
const moment = require('moment');

const { getSeasonFromInputs } = require('./client-utils');

const MY_SPORTS_FEEDS_MLB_BASE_URL = 'https://api.mysportsfeeds.com/v2.1/pull/mlb';

module.exports = class MySportsFeedsMlbClient {
  /**
   * @constructor
   * @param {Object} options - constructor options
   * @prop  {String} apiKey - My Sports Feeds API Key
   * @prop  {String} password - My Sports Feeds account password
   * @prop  {String} [baseUrl] - My Sports Feeds base API URL
   */
  constructor(options) {
    const apiKey = precond.checkIsString(options.apiKey);
    const apiPassword = precond.checkIsString(options.password);
    this._baseUrl = options.baseUrl || MY_SPORTS_FEEDS_MLB_BASE_URL;
    this._format = options.format || 'json';

    const rawKey = `${apiKey}:${apiPassword}`;
    const base64Key = Buffer.from(rawKey).toString('base64');
    this._authHeader = `Basic ${base64Key}`;
  }

  /**
   * Gets daily team log response from MSF API
   * @prop  {String} [season] - the season string
   * @prop  {String} date - the date in the format YYYYMMDD
   */
  async getDailyTeamGameLogs({ season, date }) {
    precond.checkIsString(date);
    const seasonString = getSeasonFromInputs(season, date);
    const requestUrl = `${this._baseUrl}/${seasonString}/date/${date}/games.${this._format}`;
    const res = await this._makeAuthorizedRequest(requestUrl);
    return res.body;
  }

  /**
   * Gets the lineup of the specified game
   * @prop {Number} gameId - the gameId number
   * @prop {String} [season] - the season string
   * @prop {String} [date] - the date string
   * @prop {Array<String>} [positions] - list of positions to filter
   * @prop {String} [lineupType] - expected or actual
   */
  async getGameLineup({ gameId, season, date, positions, lineupType }) {
    precond.checkIsNumber(gameId);
    const seasonString = getSeasonFromInputs(season, date);
    const query = {
      position: positions ? positions.join(',') : undefined,
      lineuptype: lineupType,
    };
    const requestUrl = `${this._baseUrl}/${seasonString}/games/${gameId}/lineup.${this._format}`;
    const res = await this._makeAuthorizedRequest(requestUrl, query);
    return res.body;
  }

  /**
   * Gets the boxscore of a specified game
   * @param {Number} gameId - the gameId number
   */
  async getGameBoxscore({ gameId, season, date }) {
    precond.checkIsNumber(gameId);
    const seasonString = getSeasonFromInputs(season, date);
    const requestUrl = `${this._baseUrl}/${seasonString}/games/${gameId}/boxscore.${this._format}`;
    const res = await this._makeAuthorizedRequest(requestUrl);
    return res.body;
  }

  /**
   * Makes an authorized request to the url specified
   * @param {String} url - The URL to make the request to
   * @param {Object} query - The query to add to the end of the URL
   * @return {Function} the supertest request method
   */
  async _makeAuthorizedRequest(url, query) {
    let fullUrl = url;
    if (query && Object.keys(query).length > 0) {
      fullUrl += `?${querystring.stringify(query)}`;
    }

    let res;
    try {
      res = await request.get(fullUrl).set('Authorization', this._authHeader);
    } catch (err) {
      res = { error: err };
    }
    return res;
  }


  _getSeasonFromDate(date, format = 'YYYYMMDD') {
    const OCTOBER_INDEX = 9;
    let dateAsMoment = date;
    if (!moment.isMoment(date)) {
      precond.checkIsString(date);
      dateAsMoment = moment(date, format);
    }
    const year = dateAsMoment.year();
    const season = dateAsMoment.month() >= OCTOBER_INDEX ? 'playoff' : 'regular';
    return `${year}-${season}`;
  };
};
