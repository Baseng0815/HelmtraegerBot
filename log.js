const fs = require('fs');

let logStream = fs.createWriteStream('logfile', { flags: 'a' });

function logMessage(message) {
    const date = Date().toString();

    const logMessage = date + ': ' + message;
    console.log(logMessage);
    logStream.write(logMessage);
}

module.exports.logMessage = logMessage;
