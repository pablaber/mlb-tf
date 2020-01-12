'use strict';

const moment = require('moment');
require('dotenv').config();

const configFactory = require('./lib/config/config-factory');
const MySportsFeedsMlbClient = require('./lib/client/my-sports-feeds-mlb-client');
const GameInfo = require('./lib/app/GameInfo');
const EloMap = require('./lib/app/EloMap');
const log = require('./lib/util/logger');

const { DATE_FORMATS, ERROR_MESSAGES } = require('./lib/config/constants');

const FROM_DATE = '20190301';
const TO_DATE = '20191001';

/**
 * The main function of the app
 */
async function main() {
  const postponedIds = [];
  const config = configFactory.generate();
  const client = new MySportsFeedsMlbClient({
    apiKey: config.mySportsFeeds.apiKey,
    password: config.mySportsFeeds.password,
  });
  const eloMap = new EloMap();

  const currentParsingDate = moment(FROM_DATE, DATE_FORMATS.MSF);
  const endingDate = moment(TO_DATE, DATE_FORMATS.MSF);
  const totalDays = endingDate.diff(currentParsingDate, 'days');

  log.writeLn(`Processing ELO from ${currentParsingDate.format(DATE_FORMATS.LONG)} to ${endingDate.format(DATE_FORMATS.LONG)} (${totalDays} days)`);

  let i = 0;
  for (let date = currentParsingDate.format(DATE_FORMATS.MSF);
    currentParsingDate.isBefore(endingDate);
    date = currentParsingDate.add(1, 'day').format(DATE_FORMATS.MSF)) {
    const pct = Math.floor(100 * ++i / totalDays);
    log.write(`Current Date: ${currentParsingDate.format(DATE_FORMATS.SHORT)} (${pct}%)`);
    const { games } = await client.getDailyTeamGameLogs({
      date,
    });
    for (const gameObject of games) {
      try {
        const gameInfo = await GameInfo.loadFromGameObject(client, gameObject, currentParsingDate.dayOfYear());
        eloMap.update(gameInfo);
      } catch (err) {
        if (err.message === ERROR_MESSAGES.POSTPONED) {
          continue;
        }
        throw err;
      };
    }
  }
  log.writeLn('Finished processing.');

  log.writeLn(JSON.stringify(eloMap.asRankedArray()));
};

(async () => {
  main();
})();

