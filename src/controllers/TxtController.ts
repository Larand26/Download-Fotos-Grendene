import TxtService from "../services/TxtService.js";

export default class TxtController {
  static async fetchProductsTxt() {
    return await TxtService.fetchProductsTxt();
  }
}
