import pino from "pino";

const logger = pino({
  enabled: !process.env.LOG_DISABLED,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
});

export { logger };
