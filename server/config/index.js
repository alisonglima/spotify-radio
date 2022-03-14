import { join, dirname } from "path";
import { fileURLToPath } from "url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const root = join(currentDir, "..", "..");
const audioDirectory = join(root, "audio");
const publicDirectory = join(root, "public");

export default {
  port: process.env.PORT || 3333,
  dir: {
    root,
    audioDirectory,
    publicDirectory,
    songsDirectory: join(audioDirectory, "songs"),
    fxDirectory: join(audioDirectory, "fx"),
  },
  pages: {
    home: "home/index.html",
    controller: "controller/index.html",
  },
  location: {
    home: "/home",
  },
  constants: {
    CONTENT_TYPE: {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "text/javascript",
    },
  },
};
