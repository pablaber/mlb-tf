'use strict';

module.exports.write = (message = '') => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(message);
};

module.exports.writeLn = (message = '') => {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${message}\n`);
};
