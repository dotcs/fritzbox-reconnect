const path = require("path");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const root = path.resolve(__dirname, "..");

const myFormat = printf(info => {
  return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    label({ label: "Fritz!Box Reconnect" }),
    timestamp(),
    myFormat
  ),
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log`
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({
      filename: path.join(root, "log", "error.log"),
      level: "error"
    }),
    new transports.File({ filename: path.join(root, "log", "all.log") })
  ]
});

module.exports = logger;