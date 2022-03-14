import server from "./server.js";
import config from "./config/index.js";
import { logger } from "./utils/index.js";

server
  .listen(config.port)
  .on("listening", () => logger.info(`Server started on port ${config.port}!`));
