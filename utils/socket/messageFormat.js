const moment = require('moment');

function messageFormat(text) {
  return {
    text,
    time: moment().format('h:mm a'),
  };
}

module.exports = messageFormat;
