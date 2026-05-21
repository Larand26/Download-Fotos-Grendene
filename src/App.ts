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

  async fetchProductsTxt() {
    return await TxtController.fetchProductsTxt();
  }
}
