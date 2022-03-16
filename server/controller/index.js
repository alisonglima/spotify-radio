import { Service } from "../service/index.js";
import { logger } from "../utils/index.js";

class Controller {
  constructor() {
    this.service = new Service();
  }

  async getFileStream(filename) {
    return this.service.getFileStream(filename);
  }

  async handleCommand({ command }) {
    logger.info(`Received command: ${command}`);
    const result = {
      result: "ok",
    };
    const cmd = command.toLowerCase();

    if (cmd.includes("start")) {
      this.service.startStreaming();
      return result;
    }

    if (cmd.includes("stop")) {
      this.service.stopStreaming();
      return result;
    }

    return this.service.startStreaming();
  }

  createClientStream() {
    const { id, clientStream } = this.service.createClientStream();

    const onClose = () => {
      logger.info(`Client stream ${id} closed`);
      this.service.removeClientStream(id);
    };

    return {
      stream: clientStream,
      onClose,
    };
  }
}

export { Controller };
