import TxtService from "../services/TxtService.js";
import type { iResponse } from "../interfaces/app.interfaces.js";
import { logger } from "../utils/logger.js";

export default class TxtController {
  static async fetchProductsTxt(): Promise<iResponse> {
    logger.info("Iniciando leitura do arquivo de produtos (TXT)");
    const products = await TxtService.fetchProductsTxt();
    logger.info(`Leitura finalizada. Produtos obtidos: ${products.length}`);
    return {
      success: true,
      data: products,
      message: "Produtos obtidos com sucesso",
    };
  }
}
