'use strict';

require('dotenv').config();

const configFactory = require('./lib/config/config-factory');
const MySportsFeedsMlbClient = require('./lib/client/my-sports-feeds-mlb-client');
const GameInfo = require('./lib/app/GameInfo');

/**
 * The main function of the app
 */
async function main() {
  const config = configFactory.generate();
  const client = new MySportsFeedsMlbClient({
    apiKey: config.mySportsFeeds.apiKey,
    password: config.mySportsFeeds.password,
  });

  const DATE = '20190629';

  const games = await client.getDailyTeamGameLogs({
    date: DATE,
  });
  for (const gameLog of games.gamelogs) {
    const gameInfo = new GameInfo();

    const rawGameBoxscore = await client.getGameBoxscore({
      date: DATE,
      gameId: gameLog.game.id,
    });
    gameInfo.loadBoxscore(rawGameBoxscore);

    const rawGameLineup = await client.getGameLineup({
      date: DATE,
      gameId: gameLog.game.id,
    });
    gameInfo.loadLineup(rawGameLineup);
  }
};

(async () => {
  main();
})();

