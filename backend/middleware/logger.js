import winston from "winston";
import 'winston-daily-rotate-file';

const combinedTransport = new winston.transports.DailyRotateFile({
  // level: "debug",
  filename: '%DATE%.log',
  frequency: '1m',
  datePattern: 'YYYY-MM-DD_HH-mm',
  dirname: 'logs/combined',
  maxFiles: '7d',
})

const errorTransport = new winston.transports.DailyRotateFile({
  level: "error",
  filename: '%DATE%.log',
  frequency: '1m',
  datePattern: 'YYYY-MM-DD_HH-mm',
  dirname: 'logs/error',
  maxFiles: '7d',
})

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "debug",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple())
    }),
    errorTransport,
    //
    // - Write all logs with importance level of `info` or higher to `combined.log`
    //   (i.e., fatal, error, warn, and info, but not trace)
    //
    combinedTransport
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ]
});