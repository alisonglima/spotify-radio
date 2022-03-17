import { jest, expect, describe, it } from "@jest/globals";
import { setTimeout } from "timers/promises";

import { TestUtil } from "../../_util/testUtil.js";

const RETENTION_DATA_PERIOD = 200;
const possibleCommands = { start: "start", stop: "stop" };

describe("API E2E Suite Test", () => {
  const pipeAndReadStreamData = TestUtil.pipeAndReadStreamData;

  describe("client workflow", () => {
    const getTestServer = TestUtil.getTestServer;
    const commandSender = TestUtil.commandSender;

    it("should not receive data stream if the process is not playing", async () => {
      const server = await getTestServer();
      const onChunk = jest.fn();
      pipeAndReadStreamData(server.testServer.get("/stream"), onChunk);

      await setTimeout(RETENTION_DATA_PERIOD);
      server.kill();

      expect(onChunk).not.toHaveBeenCalled();
    });

    it("should receive data stream if the process is playing", async () => {
      const server = await getTestServer();
      const onChunk = jest.fn();
      const { send } = commandSender(server.testServer);

      pipeAndReadStreamData(server.testServer.get("/stream"), onChunk);

      await send(possibleCommands.start);
      await setTimeout(RETENTION_DATA_PERIOD);
      await send(possibleCommands.stop);
      const [[buffer]] = onChunk.mock.calls;

      server.kill();

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(1000);
    });
  });
});
