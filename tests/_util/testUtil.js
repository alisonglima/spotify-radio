/* istanbul ignore file */
import { jest, expect } from "@jest/globals";
import supertest from "supertest";
import { Transform } from "stream";
import { Readable, Writable } from "stream";
import portfinder from "portfinder";

import Server from "../../server/server.js";

const getAvailablePort = portfinder.getPortPromise;
const commandResponse = JSON.stringify({
  result: "ok",
});

class TestUtil {
  static generateReadableStream(data) {
    return new Readable({
      read() {
        for (const chunk of data) {
          this.push(chunk);
        }

        this.push(null);
      },
    });
  }

  static generateWritableStream(onData) {
    return new Writable({
      write(chunk, encoding, callback) {
        onData(chunk);
        callback(null, chunk);
      },
    });
  }

  static defaultHandleParams() {
    const requestStream = this.generateReadableStream(["body da requisição"]);
    const responseStream = this.generateWritableStream(() => {});

    const data = {
      request: Object.assign(requestStream, {
        headers: {},
        method: "",
        url: "",
      }),
      response: Object.assign(responseStream, {
        writeHead: jest.fn(),
        end: jest.fn(),
      }),
    };

    return {
      values: () => Object.values(data),
      ...data,
    };
  }

  static async getTestServer() {
    const getSuperTest = (port) => supertest(`http://localhost:${port}`);
    const port = await getAvailablePort();

    return new Promise((resolve, reject) => {
      const server = Server.listen(port)
        .once("listening", () => {
          const testServer = getSuperTest(port);
          const response = {
            testServer,
            kill() {
              server.close();
            },
          };

          return resolve(response);
        })
        .once("error", reject);
    });
  }

  static pipeAndReadStreamData(stream, onChunk) {
    const transform = new Transform({
      transform(chunk, encoding, callback) {
        onChunk(chunk);
        callback(null, chunk);
      },
    });

    return stream.pipe(transform);
  }

  static commandSender(testServer) {
    return {
      async send(command) {
        const response = await testServer.post("/controller").send({
          command,
        });

        expect(response.text).toStrictEqual(commandResponse);
      },
    };
  }
}

export { TestUtil };
