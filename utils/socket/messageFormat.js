const moment = require('moment');

function formatMessage(text) {
  return {
    text,
    time: moment().format('h:mm a'),
  };
}

module.exports = formatMessage;
