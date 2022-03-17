import config from "../config/index.js";
import { logger } from "../utils/index.js";
import { once } from "events";
import { AppError } from "../errors/AppError.js";

import { Controller } from "../controller/index.js";

const controller = new Controller();

const {
  location,
  pages,
  constants: { CONTENT_TYPE },
} = config;

async function routes(req, res) {
  const { method, url } = req;

  if (method === "GET" && url === "/") {
    res.writeHead(302, { Location: location.home });

    return res.end();
  }

  if (method === "GET" && url === "/home") {
    const { stream } = await controller.getFileStream(pages.home);

    // padrão do response é text/html
    // res.writeHead(200, { "Content-Type": "text/html" });

    return stream.pipe(res);
  }

  if (method === "GET" && url === "/controller") {
    const { stream } = await controller.getFileStream(pages.controller);

    return stream.pipe(res);
  }

  if (method === "GET" && url.includes("/stream")) {
    const { stream, onClose } = controller.createClientStream();

    req.once("close", onClose);

    res.writeHead(200, { "Content-Type": "audio/mpeg", "Accept-Rages": "bytes" });

    return stream.pipe(res);
  }

  if (method === "POST" && url === "/controller") {
    const data = await once(req, "data");
    const item = JSON.parse(data);
    const result = await controller.handleCommand(item);

    return res.end(JSON.stringify(result));
  }

  // files
  if (method === "GET") {
    const { stream, type } = await controller.getFileStream(url);

    const contentType = CONTENT_TYPE[type];

    if (contentType) {
      res.writeHead(200, { "Content-Type": contentType });
    }

    return stream.pipe(res);
  }

  res.writeHead(404);

  return res.end();
}

function handleError(err, res) {
  logger.info("Cheguei aqui");
  if (err instanceof AppError) {
    logger.error(err.message);

    res.writeHead(err.statusCode);
    return res.end();
  }

  if (err.message.includes("ENOENT")) {
    logger.error(`asset not found ${err.stack}`);

    res.writeHead(404);
    return res.end();
  }

  logger.error(`caught error on API ${err.stack}`);
  res.writeHead(500);
  return res.end();
}

function handler(req, res) {
  return routes(req, res).catch((err) => handleError(err, res));
}

export { handler };
