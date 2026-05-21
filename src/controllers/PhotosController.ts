import PhotosService from "../services/PhotosService.js";
import type { iProduct, iResponse } from "../interfaces/app.interfaces.js";

export default class PhotosController {
  static async downloadPhotos(products: iProduct[]): Promise<iResponse> {
    return await PhotosService.downloadPhotos(products);
  }
}
