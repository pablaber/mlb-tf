'use strict';

module.exports.generate = () => {
  const config = {
    mySportsFeeds: {
      apiKey: process.env.MY_SPORTS_FEEDS_API_KEY,
      password: process.env.MY_SPORTS_FEEDS_PASSWORD,
    },
  };

  return config;
};
