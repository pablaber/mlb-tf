'use strict';

const moment = require('moment');
require('dotenv').config();

const configFactory = require('./lib/config/config-factory');
const MySportsFeedsMlbClient = require('./lib/client/my-sports-feeds-mlb-client');
const GameInfo = require('./lib/app/GameInfo');
const EloMap = require('./lib/app/EloMap');

const { MSF_DATE_FORMAT } = require('./lib/config/constants');

const FROM_DATE = '20190328';
const TO_DATE = '20190501';

/**
 * The main function of the app
 */
async function main() {
  const config = configFactory.generate();
  const client = new MySportsFeedsMlbClient({
    apiKey: config.mySportsFeeds.apiKey,
    password: config.mySportsFeeds.password,
  });
  const eloMap = new EloMap();

  const currentParsingDate = moment(FROM_DATE, MSF_DATE_FORMAT);
  const endingDate = moment(TO_DATE, MSF_DATE_FORMAT);

  for (let date = currentParsingDate.format(MSF_DATE_FORMAT);
    currentParsingDate.isBefore(endingDate);
    date = currentParsingDate.add(1, 'day').format(MSF_DATE_FORMAT)) {
    console.log(date);
    const { games } = await client.getDailyTeamGameLogs({
      date,
    });
    for (const gameObject of games) {
      const gameInfo = await GameInfo.loadFromGameObject(client, gameObject);
      eloMap.update(gameInfo);
    }
  }

  console.log(JSON.stringify(eloMap.eloMap));
};

(async () => {
  main();
})();

