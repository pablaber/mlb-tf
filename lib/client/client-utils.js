'use strict';

const precond = require('precond');
const moment = require('moment');

const { MSF_DATE_FORMAT, SEASON_TYPES } = require('../config/constants');

/**
 * Gets the My Sports Feeds season string from the given date
 * @param {String|Moment} date - the date string or moment object
 * @param {String} [format] - the format of the date (if string)
 * @return {String} the season string for the given date
 */
function getSeasonFromDate(date, format = MSF_DATE_FORMAT) {
  const OCTOBER_INDEX = 9;
  let dateAsMoment = date;
  if (!moment.isMoment(date)) {
    precond.checkIsString(date);
    dateAsMoment = moment(date, format);
  }
  const year = dateAsMoment.year();
  const season = dateAsMoment.month() >= OCTOBER_INDEX ? SEASON_TYPES.PLAYOFF : SEASON_TYPES.REGULAR;
  return `${year}-${season}`;
}

/**
 * Gets the season string given a season and date input
 * @param {String|undefined} seasonInput - season input value
 * @param {String|Moment|undefined} dateInput - date input value
 * @return {String} the season string for the given inputs
 */
function getSeasonFromInputs(seasonInput, dateInput) {
  precond.checkState(seasonInput || dateInput, 'Both date and season input are undefined.');
  if (seasonInput) {
    return seasonInput;
  }
  return getSeasonFromDate(dateInput);
}

module.exports = {
  getSeasonFromDate,
  getSeasonFromInputs,
};
