'use strict';

module.exports = {
  POSITIONS: {
    PITCHER: 'P',
    CATCHER: 'C',
    FIRST_BASE: '1B',
    SECOND_BASE: '2B',
    THIRD_BASE: '3B',
    SHORT_STOP: 'SS',
    LEFT_FIELD: 'LF',
    CENTER_FIELD: 'CF',
    RIGHT_FIELD: 'RF',
    BATTING: (n) => {
      return `BO${n}`;
    },
  },

  LINEUP_TYPES: {
    EXPECTED: 'expected',
    ACTUAL: 'actual',
  },

  SEASON_TYPES: {
    PLAYOFF: 'playoff',
    REGULAR: 'regular',
  },

  DATE_FORMATS: {
    LONG: 'dddd, MMMM Do YYYY',
    SHORT: 'YYYY-MM-DD',
    MSF: 'YYYYMMDD',
  },
};
