import { jest } from "@jest/globals";
import { Readable, Writable } from "stream";

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
}

export { TestUtil };
