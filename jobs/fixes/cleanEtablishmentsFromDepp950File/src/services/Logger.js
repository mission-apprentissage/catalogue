// #region Imports

const { createLogger, format, transports } = require("winston");
const { combine, timestamp } = format;

// #endregion

// Custom format
const loggerFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} - [${level}]: ${message}`;
});

const mainLogger = createLogger({
  format: combine(timestamp(), loggerFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/Errors.log", level: "error" }),
    new transports.File({ filename: "logs/CleanEtablishmentsFromDepp950File.log" }),
  ],
});
module.exports.mainLogger = mainLogger;

const uniqueMatchingsLogger = createLogger({
  format: combine(timestamp(), loggerFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/Errors.log", level: "error" }),
    new transports.File({ filename: "logs/UniqueMatchings.log" }),
  ],
});
module.exports.uniqueMatchingsLogger = uniqueMatchingsLogger;

const multipleMatchingsLogger = createLogger({
  format: combine(timestamp(), loggerFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/Errors.log", level: "error" }),
    new transports.File({ filename: "logs/MultipleMatchings.log" }),
  ],
});
module.exports.multipleMatchingsLogger = multipleMatchingsLogger;

const noMatchingLogger = createLogger({
  format: combine(timestamp(), loggerFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/Errors.log", level: "error" }),
    new transports.File({ filename: "logs/NoMatching.log" }),
  ],
});
module.exports.noMatchingLogger = noMatchingLogger;

const returnMatchingsMultiplesLogger = createLogger({
  format: combine(timestamp(), loggerFormat),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "logs/Errors.log", level: "error" }),
    new transports.File({ filename: "logs/ReturnMatchingsMultiples.log" }),
  ],
});
module.exports.returnMatchingsMultiplesLogger = returnMatchingsMultiplesLogger;
