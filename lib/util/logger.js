'use strict';

const debug = process.env.DEBUGGER === 'true';

module.exports.write = (message = '') => {
  if (debug) return console.log(message);
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(message);
};

module.exports.writeLn = (message = '') => {
  if (debug) return console.log(message);
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(`${message}\n`);
};
