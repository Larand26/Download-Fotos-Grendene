import TxtService from "../services/TxtService.js";
import type { iResponse } from "../interfaces/app.interfaces.js";

export default class TxtController {
  static async fetchProductsTxt(): Promise<iResponse> {
    const products = await TxtService.fetchProductsTxt();
    return {
      success: true,
      data: products,
      message: "Produtos obtidos com sucesso",
    };
  }
}
