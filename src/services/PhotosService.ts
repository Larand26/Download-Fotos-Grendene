import type { iProduct, iResponse } from "../interfaces/app.interfaces.js";
import appConfig from "../config/app.config.js";
import axios from "axios";

export default class PhotosService {
  private static async downloadPhoto(
    manufactureCode: string,
    colorCode: string,
    position: string,
  ): Promise<iResponse> {
    // função para baixar a foto
    return {
      success: true,
      message: `Foto baixada: ${manufactureCode}-${colorCode}-${position}`,
    };
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
          if (!response.success) continue;
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
