const winston = require('winston');
const fs = require('fs');
const path = require('path');
const { createLogger, aiClient, format } = require('winston');

const {
  combine, timestamp, printf, colorize,
} = format;

fs.mkdir(path.resolve(`${__dirname}/../logs`), () => {});

const addAppNameFormat = winston.format((info) => {
  info.appName = 'Boanuncio back server';
  return info;
});

// define the custom settings for each transport (file, console)
const options = {
  fileDebug: {
    level: 'debug',
    filename: path.resolve(`${__dirname}/../logs/app.log`),
    handleExceptions: true,
    json: false,
    maxsize: 10000000, // 5MB
    maxFiles: 20,
  },
  fileError: {
    level: 'error',
    filename: path.resolve(`${__dirname}/../logs/error.log`),
    handleExceptions: true,
    json: false,
    maxsize: 10000000, // 5MB
    maxFiles: 20,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    format: combine(
      addAppNameFormat(),
      colorize(),
      timestamp(),
      printf(info => `${info.timestamp} [${info.level}] : ${JSON.stringify(info.message)}`),
    ),
  },
};

// instantiate a new Winston Logger with the settings defined above
const logger = createLogger({
  format: combine(
    addAppNameFormat(),
    timestamp(),
    printf(info => `${info.timestamp} [${info.level}] : ${JSON.stringify(info.message)}`),
  ),
  transports: [
    new winston.transports.File(options.fileDebug),
    new winston.transports.File(options.fileError),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write(message, encoding) {
    logger.info(message);
  },
};
/**
 * EventTelemetry
 */
logger.trackEvent = function (telemetry) {
  aiClient.trackEvent(telemetry);
};

module.exports = logger;
