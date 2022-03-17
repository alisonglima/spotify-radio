import { jest, expect, describe, it } from "@jest/globals";
import { setTimeout } from "timers/promises";
import { readFileSync } from "fs";
import { join } from "path";

import { TestUtil, commandResponse } from "../../_util/testUtil.js";
import config from "../../../server/config/index.js";

const {
  location,
  dir: { publicDirectory },
  pages,
} = config;

const RETENTION_DATA_PERIOD = 200;
const possibleCommands = { start: "start", stop: "stop" };

describe("API E2E Suite Test", () => {
  const pipeAndReadStreamData = TestUtil.pipeAndReadStreamData;
  const getTestServer = TestUtil.getTestServer;
  const commandSender = TestUtil.commandSender;

  describe("client workflow", () => {
    it("GET /stream should not receive data stream if the process is not playing", async () => {
      const server = await getTestServer();
      const onChunk = jest.fn();
      pipeAndReadStreamData(server.testServer.get(location.stream), onChunk);

      await setTimeout(RETENTION_DATA_PERIOD);
      server.kill();

      expect(onChunk).not.toHaveBeenCalled();
    });

    it("GET /stream should receive data stream if the process is playing", async () => {
      const server = await getTestServer();
      const onChunk = jest.fn();
      const { send } = commandSender(server.testServer);

      pipeAndReadStreamData(server.testServer.get(location.stream), onChunk);

      await send(possibleCommands.start);
      await setTimeout(RETENTION_DATA_PERIOD);
      await send(possibleCommands.stop);
      const [[buffer]] = onChunk.mock.calls;

      server.kill();

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);
    });

    it("GET / should redirect to /home", async () => {
      const server = await getTestServer();

      const testServerResponse = await server.testServer.get("/");

      server.kill();

      expect(testServerResponse.status).toStrictEqual(302);
      expect(testServerResponse.header.location).toStrictEqual(location.home);
    });

    it("GET /home should render the home page", async () => {
      const server = await getTestServer();

      const testServerResponse = await server.testServer.get(location.home);
      const page = String(readFileSync(join(publicDirectory, pages.home)));

      server.kill();

      expect(testServerResponse.status).toStrictEqual(200);
      expect(testServerResponse.text).toStrictEqual(page);
    });

    it("GET /controller should render the controller page", async () => {
      const server = await getTestServer();

      const testServerResponse = await server.testServer.get(location.controller);
      const page = String(readFileSync(join(publicDirectory, pages.controller)));

      server.kill();

      expect(testServerResponse.status).toStrictEqual(200);
      expect(testServerResponse.text).toStrictEqual(page);
    });

    it("POST /controller should start the stream if the command is start", async () => {
      const server = await getTestServer();

      const testServerResponse = await server.testServer
        .post(location.controller)
        .send({ command: possibleCommands.start });

      server.kill();

      expect(testServerResponse.status).toStrictEqual(200);
      expect(testServerResponse.text).toStrictEqual(commandResponse);
    });

    it("POST /controller should stop the stream if the command is stop", async () => {
      const server = await getTestServer();

      const testServerResponse = await server.testServer
        .post(location.controller)
        .send({ command: possibleCommands.stop });

      server.kill();

      expect(testServerResponse.status).toStrictEqual(200);
      expect(testServerResponse.text).toStrictEqual(commandResponse);
    });
  });

  describe("exceptions", () => {
    it("GET /invalid-route should respond with 404 when try access a non-existent route", async () => {
      const server = await getTestServer();

      const testServerResponse = await server.testServer.get("/invalid-route");

      server.kill();

      expect(testServerResponse.status).toStrictEqual(404);
    });

    it("POST /controller should respond with 400 if an invalid command is sent", async () => {
      const server = await getTestServer();

      const testServerResponse = await server.testServer
        .post(location.controller)
        .send({ command: "invalid-command" });

      server.kill();

      expect(testServerResponse.status).toStrictEqual(400);
    });
  });
});
