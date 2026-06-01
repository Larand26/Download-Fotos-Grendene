import type { iProduct } from "./interfaces/app.interfaces.js";

import { logger } from "./utils/logger.js";
// Controllers
import TxtController from "./controllers/TxtController.js";
import PhotosController from "./controllers/PhotosController.js";

export default class App {
  async start() {
    logger.info("Iniciando aplicação");
    // Pegar os produtos da Grendene
    const products = await this.fetchProductsTxt();
    logger.info(`Produtos encontrados: ${products.length}`);
    // Baixar as fotos
    const result = await this.downloadPhotos(products);
    if (result && (result as any).success) {
      logger.success("Download de fotos finalizado com sucesso.");
    } else {
      logger.warning("Processo de download finalizado com falhas.");
    }
    logger.info("Aplicação encerrada");
  }

  async fetchProductsTxt(): Promise<iProduct[] | []> {
    const response = await TxtController.fetchProductsTxt();
    if (!response || !response.data || response.data.length === 0) {
      logger.warning("Nenhum produto encontrado no arquivo de texto.");
      return [];
    }
    return response.data as iProduct[];
  }

  async downloadPhotos(products: iProduct[]) {
    logger.info("Iniciando processo de download de fotos");
    return PhotosController.downloadPhotos(products);
  }
}
