import fs from "fs";
import fsPromises from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { PassThrough, Writable } from "stream";
import streamsPromises from "stream/promises";
import Throttle from "throttle";
import childProcess from "child_process";
import { once } from "events";

import { logger } from "../utils/index.js";
import config from "../config/index.js";

const {
  dir: { publicDirectory },
  constants: { fallbackBitRate, englishConversation, bitRateDivisor },
} = config;

class Service {
  constructor() {
    this.clientStreams = new Map();
    this.currentSong = englishConversation;
    this.currentBitRate = 0;
    this.throttleTransform = {};
    this.currentReadable = {};
  }

  createClientStream() {
    const id = randomUUID();

    const clientStream = new PassThrough();
    this.clientStreams.set(id, clientStream);

    return {
      id,
      clientStream,
    };
  }

  removeClientStream(id) {
    this.clientStreams.delete(id);
  }

  _executeSoxCommand(args) {
    return childProcess.spawn("sox", args);
  }

  async getBitRate(song) {
    try {
      const args = [
        "--i", // info
        "-B", // bitrate
        song, // filename
      ];

      const {
        stderr, // error
        stdout, // output
        stdin, // input
      } = this._executeSoxCommand(args);

      await Promise.all([once(stdout, "readable"), once(stderr, "readable")]);

      const [success, error] = [stdout, stderr].map((stream) => stream.read());

      if (error) return await Promise.reject(error);

      return success.toString().trim().replace(/k/, "000");
    } catch (error) {
      logger.error(`deu ruim no bitrate: ${error}`);
      return fallbackBitRate;
    }
  }

  broadCast() {
    return new Writable({
      write: (chunk, encoding, callback) => {
        for (const [id, stream] of this.clientStreams) {
          // se o cliente desconectou não devemos mais enviar dados para ele
          if (stream.writableEnded) {
            this.clientStreams.delete(id);
            continue;
          }
          stream.write(chunk);
        }
        callback();
      },
    });
  }

  async startStreaming() {
    logger.info(`starting-with ${this.currentSong}`);
    const bitRate =
      (this.currentBitRate = await this.getBitRate(this.currentSong)) / bitRateDivisor;

    const throttleTransform = (this.throttleTransform = new Throttle(bitRate));
    const songReadable = (this.currentReadable = this.createFileStream(this.currentSong));

    return streamsPromises.pipeline(songReadable, throttleTransform, this.broadCast());
  }

  stopStreaming() {
    this.throttleTransform?.end?.();
  }

  createFileStream(filename) {
    return fs.createReadStream(filename);
  }

  async getFileInfo(file) {
    // file = home/index.html
    const fullFilePath = join(publicDirectory, file);
    // valida se existe, se não existe estoura erro!!
    await fsPromises.access(fullFilePath);
    const fileType = extname(fullFilePath);

    return {
      name: fullFilePath,
      type: fileType,
    };
  }

  async getFileStream(file) {
    const { name, type } = await this.getFileInfo(file);

    return {
      stream: this.createFileStream(name),
      type,
    };
  }
}

export { Service };
