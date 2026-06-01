import type { iProduct, iResponse } from "../interfaces/app.interfaces.js";
import appConfig from "../config/app.config.js";
import axios from "axios";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "../utils/logger.js";

export default class PhotosService {
  private static async downloadPhoto(
    manufactureCode: string,
    colorCode: string,
    position: string,
  ): Promise<iResponse> {
    const url = `https://api-uai.grendene.com.br/api/material/getmaterial?n=${manufactureCode}${colorCode}${position}&d=IMAGEM_GRANDE_JPG`;

    try {
      logger.info(`Baixando foto: ${manufactureCode}_${colorCode}_${position}`);
      const response = await axios.get<ArrayBuffer>(url, {
        responseType: "arraybuffer",
      });

      const folderPath = join(appConfig.photosDownloadPath, manufactureCode);
      const filePath = join(
        folderPath,
        `${manufactureCode}_${colorCode}_${position}.jpg`,
      );

      await mkdir(folderPath, { recursive: true });
      await writeFile(filePath, Buffer.from(response.data));

      logger.success(`Foto salva em: ${filePath}`);

      return {
        success: true,
        message: `Foto salva em: ${filePath}`,
      };
    } catch (error) {
      logger.error(
        `Erro ao baixar foto ${manufactureCode}_${colorCode}_${position}: ${String(error)}`,
      );
      return {
        success: false,
        message: `Erro ao baixar foto ${manufactureCode}_${colorCode}_${position}: ${String(error)}`,
      };
    }
  }

  static async downloadPhotos(products: iProduct[]): Promise<iResponse> {
    if (products.length === 0) {
      return {
        success: false,
        message: "Nenhum produto para baixar fotos.",
      };
    }

    const tasks = products.flatMap((product) =>
      product.colorCodes.flatMap((colorCode) =>
        Array.from({ length: appConfig.maxPhotoPositions }, (_, index) => {
          const position = index.toString().padStart(2, "0");
          return this.downloadPhoto(
            product.manufactureCode,
            colorCode,
            position,
          );
        }),
      ),
    );

    logger.info(`Disparando ${tasks.length} downloads de fotos em paralelo`);

    const results = await Promise.all(tasks);

    const success = results.every((result) => result.success);
    if (success) {
      logger.success("Todos os downloads foram concluídos com sucesso.");
    } else {
      logger.warning(
        "Alguns downloads falharam. Verifique mensagens de erro acima.",
      );
    }

    return {
      success,
      data: results,
      message: "Processo de download finalizado",
    };
  }
}
