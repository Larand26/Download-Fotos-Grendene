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

    for (const product of products) {
      for (const colorCode of product.colorCode) {
        for (
          let position = 0;
          position < appConfig.maxPhotoPositions;
          position++
        ) {
          const response = await this.downloadPhoto(
            product.manufactureCode,
            colorCode,
            position.toString().padStart(2, "0"),
          );
          if (!response.success) break;
        }
      }
    }
    return {
      success: true,
      data: products,
      message: "Fotos baixadas com sucesso",
    };
  }
}
