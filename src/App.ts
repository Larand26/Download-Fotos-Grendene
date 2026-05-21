import type { iProduct } from "./interfaces/app.interfaces.js";

// Controllers
import TxtController from "./controllers/TxtController.js";

export default class App {
  async start() {
    // Pegar os produtos da Grendene
    const products = await this.fetchProductsTxt();
    // Processar os produtos
    // função
    // Baixar as fotos
    // função
  }

  async fetchProductsTxt(): Promise<iProduct[] | []> {
    const response = await TxtController.fetchProductsTxt();
    if (!response || response.data.length === 0) {
      console.error("No products found in the text file.");
      return [];
    }
    return response.data as iProduct[];
  }
}
