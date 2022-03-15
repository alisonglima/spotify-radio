import { describe, jest, beforeEach, it, expect } from "@jest/globals";

import config from "../../../server/config/index.js";
import { Controller } from "../../../server/controller/index.js";
import { Service } from "../../../server/service";
import { TestUtil } from "../../_util/testUtil.js";

const { pages } = config;

describe("#Controller - test suite for api controller", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("getFileStream() - should return a fileStream ", async () => {
    const controller = new Controller();
    const mockFileStream = TestUtil.generateReadableStream(["anything"]);
    const expectedType = ".html";

    jest.spyOn(Service.prototype, "getFileStream").mockResolvedValue({
      stream: mockFileStream,
      type: expectedType,
    });

    const controllerReturn = await controller.getFileStream(pages.home);

    expect(Service.prototype.getFileStream).toBeCalledWith(pages.home);
    expect(controllerReturn).toStrictEqual({
      stream: mockFileStream,
      type: expectedType,
    });
  });
});
