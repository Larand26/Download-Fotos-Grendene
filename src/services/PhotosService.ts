import type { iProduct, iResponse } from "../interfaces/app.interfaces.js";
import appConfig from "../config/app.config.js";
import axios from "axios";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export default class PhotosService {
  private static async downloadPhoto(
    manufactureCode: string,
    colorCode: string,
    position: string,
  ): Promise<iResponse> {
    const url = `https://api-uai.grendene.com.br/api/material/getmaterial?n=${manufactureCode}${colorCode}${position}&d=IMAGEM_GRANDE_JPG`;

    try {
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

      return {
        success: true,
        message: `Foto salva em: ${filePath}`,
      };
    } catch (error) {
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
        message: "No products to download photos for.",
      };
    }

    const tasks = products.flatMap((product) =>
      product.colorCode.flatMap((colorCode) =>
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

    const results = await Promise.all(tasks);

    return {
      success: results.every((result) => result.success),
      data: results,
      message: "Processo de download finalizado",
    };
  }
}
