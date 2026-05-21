import type { iProduct, iResponse } from "../interfaces/app.interfaces.js";

export default class PhotosService {
  static async downloadPhotos(products: iProduct[]): Promise<iResponse> {
    return {
      success: true,
      data: products,
      message: "Fotos baixadas com sucesso",
    };
  }
}
