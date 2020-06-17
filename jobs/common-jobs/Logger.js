// #region Imports

const logform = require("logform");
const { createLogger, format, transports } = require("winston");
const { timestamp } = format;

// #endregion

const errorHunter = logform.format(info => {
  if (info instanceof Error) {
    info.error = true;
  }

  return info;
});

const errorPrinter = logform.format(info => {
  if (!info.error) return info;

  const errorMsg = info.stack;
  info.message += `\n${errorMsg}`;

  return info;
});

// Custom format
const loggerFormat = logform.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} - [${level}]: ${message}`;
});

const winstonConsoleFormat = logform.format.combine(errorHunter(), errorPrinter(), timestamp(), loggerFormat);

const logger = () => {
  let level = process.env.LOG_LEVEL || "info";
  return createLogger({
    format: winstonConsoleFormat,
    transports: [
      new transports.Console({
        level,
      }),
      //new transports.File({ filename: "logs/Errors.log", level: "error" }),
      //new transports.File({ filename: "logs/Logger.log", level }),
    ],
  });
};
const mainLogger = logger();
module.exports.mainLogger = mainLogger;
