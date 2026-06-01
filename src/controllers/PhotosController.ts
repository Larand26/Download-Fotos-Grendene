import PhotosService from "../services/PhotosService.js";
import type { iProduct, iResponse } from "../interfaces/app.interfaces.js";
import { logger } from "../utils/logger.js";

export default class PhotosController {
  static async downloadPhotos(products: iProduct[]): Promise<iResponse> {
    logger.info(`Iniciando download de fotos para ${products.length} produtos`);
    const result = await PhotosService.downloadPhotos(products);
    if (result && result.success) {
      logger.success("Todos os downloads de foto concluídos com sucesso.");
    } else {
      logger.warning(
        "Alguns downloads de foto falharam. Verifique logs para detalhes.",
      );
    }
    return result;
  }
}
