import appConfig from "../config/app.config.js";
import type { iProduct } from "../interfaces/app.interfaces.js";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

export default class TxtService {
  private static async checkFileExists(): Promise<boolean> {
    try {
      const filePath = resolve(appConfig.txtFilePath);
      await access(filePath);
      return true;
    } catch (error) {
      console.error("Erro ao verificar existência do arquivo:", error);
      return false;
    }
  }

  private static async readTxtFile(): Promise<string> {
    try {
      const filePath = resolve(appConfig.txtFilePath);
      const data = await readFile(filePath, "utf-8");
      return data;
    } catch (error) {
      console.error("Erro ao ler o arquivo de texto:", error);
      return "";
    }
  }

  private static parseProductsFromText(text: string): iProduct[] {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        if (line.split("-").length !== 2) return null;
        const [manufacture = "", codes = ""] = line.split("-");
        if (!manufacture.trim() || !codes.trim()) return null;
        return {
          manufactureCode: manufacture.trim(),
          colorCode: codes
            ? codes
                .split(",")
                .map((c) => c.trim().toUpperCase())
                .flat()
            : [],
        } as iProduct;
      })
      .filter((product): product is iProduct => product !== null);
  }

  static async fetchProductsTxt(): Promise<iProduct[] | []> {
    const fileExists = await this.checkFileExists();
    if (!fileExists) {
      return [];
    }

    const text = await this.readTxtFile();

    const products = this.parseProductsFromText(text);

    return products;
  }
}
