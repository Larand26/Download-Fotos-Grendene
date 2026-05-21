import type { iProduct } from "./interfaces/app.interfaces.js";

// Controllers
import TxtController from "./controllers/TxtController.js";
import PhotosController from "./controllers/PhotosController.js";

export default class App {
  async start() {
    // Pegar os produtos da Grendene
    const products = await this.fetchProductsTxt();
    // Baixar as fotos
    await this.downloadPhotos(products);
  }

  async fetchProductsTxt(): Promise<iProduct[] | []> {
    const response = await TxtController.fetchProductsTxt();
    if (!response || !response.data || response.data.length === 0) {
      console.error("No products found in the text file.");
      return [];
    }
    return response.data as iProduct[];
  }

  async downloadPhotos(products: iProduct[]) {
    return PhotosController.downloadPhotos(products);
  }
}
