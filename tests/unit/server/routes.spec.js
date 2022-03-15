import { jest, expect, describe, it, afterEach, beforeAll } from "@jest/globals";

import config from "../../../server/config/index.js";
import { Controller } from "../../../server/controller/index.js";
import { handler } from "../../../server/routes/index.js";
import { TestUtil } from "../../_util/testUtil.js";

const {
  pages,
  location,
  constants: { CONTENT_TYPE },
} = config;

let params;

describe("#Routes - test suite for api routes", () => {
  beforeAll(() => {
    params = TestUtil.defaultHandleParams();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("GET / - should redirect to home page", async () => {
    params.request.method = "GET";
    params.request.url = "/";

    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalledWith(302, {
      Location: location.home,
    });
    expect(params.response.end).toHaveBeenCalled();
  });

  it(`GET /home - should response with ${pages.home} file stream`, async () => {
    params.request.method = "GET";
    params.request.url = "/home";

    const mockFileStream = TestUtil.generateReadableStream(["anything"]);

    jest.spyOn(Controller.prototype, "getFileStream").mockResolvedValue({
      stream: mockFileStream,
    });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(pages.home);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  it(`GET /controller - should response with ${pages.controller} file stream`, async () => {
    params.request.method = "GET";
    params.request.url = "/controller";

    const mockFileStream = TestUtil.generateReadableStream(["anything"]);

    jest.spyOn(Controller.prototype, "getFileStream").mockResolvedValue({
      stream: mockFileStream,
    });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(pages.controller);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  it(`GET /index.html - should response with file stream`, async () => {
    const filename = "/index.html";
    params.request.method = "GET";
    params.request.url = filename;

    const expectedType = ".html";

    const mockFileStream = TestUtil.generateReadableStream(["anything"]);

    jest.spyOn(Controller.prototype, "getFileStream").mockResolvedValue({
      stream: mockFileStream,
      type: expectedType,
    });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(filename);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).toHaveBeenCalledWith(200, {
      "Content-Type": CONTENT_TYPE[expectedType],
    });
  });

  it(`GET /file.ext - should response with file stream`, async () => {
    const filename = "/file.ext";
    params.request.method = "GET";
    params.request.url = filename;

    const expectedType = ".ext";

    const mockFileStream = TestUtil.generateReadableStream(["anything"]);

    jest.spyOn(Controller.prototype, "getFileStream").mockResolvedValue({
      stream: mockFileStream,
      type: expectedType,
    });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toHaveBeenCalledWith(filename);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).not.toHaveBeenCalled();
  });

  it(`POST /unknown - given an inexistent route is should response with 404`, async () => {
    params.request.method = "POST";
    params.request.url = "/unknown";

    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalledWith(404);
    expect(params.response.end).toHaveBeenCalled();
  });

  describe("exceptions", () => {
    it("should respond with 404 when receiving a non-existent file", async () => {
      params.request.method = "GET";
      params.request.url = "/index.png";

      jest
        .spyOn(Controller.prototype, "getFileStream")
        .mockRejectedValue(new Error("Error: ENOENT: no such file or directory, open 'index.png'"));

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalled();
    });

    it("should respond with 500 when receiving an unexpected error", async () => {
      params.request.method = "GET";
      params.request.url = "/index.png";

      jest
        .spyOn(Controller.prototype, "getFileStream")
        .mockRejectedValue(new Error("Error: EACCES: permission denied, open 'index.png'"));

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(500);
      expect(params.response.end).toHaveBeenCalled();
    });
  });
});
