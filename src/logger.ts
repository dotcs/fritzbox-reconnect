import path from "path";
import fs from "fs";
// TODO: Use import statement instead of require once types are updated.
// See: https://github.com/winstonjs/winston/issues/1096
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, label, printf } = format;

const rootDir = path.resolve(__dirname, "..");
const logDir = path.join(rootDir, "log");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const myFormat = printf((info: any) => {
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
      filename: path.join(logDir, "error.log"),
      level: "error"
    }),
    new transports.File({ filename: path.join(logDir, "all.log") })
  ]
});

export default logger;
