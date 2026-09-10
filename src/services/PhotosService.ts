import type { iProduct, iResponse } from "../interfaces/app.interfaces.js";
import appConfig from "../config/app.config.js";
import axios from "axios";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "../utils/logger.js";
import TxtService from "./TxtService.js";

export default class PhotosService {
  /**
   * Salva as informações de preço e embalagem em um arquivo dentro da pasta do produto
   */
  public static async saveProductInfo(manufactureCode: string): Promise<void> {
    try {
      logger.info(`Salvando informações para o produto: ${manufactureCode}`);
      const folderPath = join(appConfig.photosDownloadPath, manufactureCode);
      await mkdir(folderPath, { recursive: true });

      const priceInfo = await TxtService.getResalePrice(manufactureCode);

      const filePath = join(folderPath, "info.txt");
      const content = priceInfo
        ? JSON.stringify(priceInfo, null, 2)
        : JSON.stringify(
            { message: "Informações não encontradas no Excel" },
            null,
            2,
          );

      await writeFile(filePath, content, "utf-8");
      logger.info(`Arquivo de informações salvo em: ${filePath}`);
    } catch (error) {
      logger.error(
        `Erro ao salvar arquivo de informações para ${manufactureCode}: ${String(error)}`,
      );
    }
  }

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

      if (
        !response ||
        !response.data ||
        (response.data as ArrayBuffer).byteLength === 0
      ) {
        logger.warning(
          `Resposta vazia ao baixar foto ${manufactureCode}_${colorCode}_${position}. URL: ${url}`,
        );
      }

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
      if (axios.isAxiosError && axios.isAxiosError(error)) {
        logger.error(
          `Axios error ao baixar foto ${manufactureCode}_${colorCode}_${position}: status=${error.response?.status} statusText=${error.response?.statusText} URL=${url}`,
        );
        try {
          const respBody = error.response?.data
            ? String(error.response.data).slice(0, 200)
            : "<sem corpo>";
          logger.error(`Corpo da resposta: ${respBody}`);
        } catch (e) {
          logger.error(
            `Não foi possível serializar corpo da resposta: ${String(e)}`,
          );
        }
      } else {
        logger.error(
          `Erro ao baixar foto ${manufactureCode}_${colorCode}_${position}: ${String(error)}`,
        );
      }
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

    // Cria/salva o arquivo com as infos para cada produto
    await Promise.all(
      products.map((product) => this.saveProductInfo(product.manufactureCode)),
    );

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
