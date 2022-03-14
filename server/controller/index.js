import { Service } from "../service/index.js";

class Controller {
  constructor() {
    this.service = new Service();
  }

  async getFileStream(filename) {
    return this.service.getFileStream(filename);
  }
}

export { Controller };
