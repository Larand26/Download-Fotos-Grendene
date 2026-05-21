import appConfig from "../config/app.config.js";
import type { iProduct } from "../interfaces/app.interfaces.js";
import { access } from "node:fs/promises";
import { resolve } from "node:path";

export default class TxtService {
  private static async checkFileExists(): Promise<boolean> {
    try {
      const filePath = resolve(appConfig.txtFilePath);
      await access(filePath);
      return true;
    } catch (error) {
      console.error("Error checking file existence:", error);
      return false;
    }
  }

  private static async readTxtFile(): Promise<string> {
    try {
      const filePath = resolve(appConfig.txtFilePath);
      const data = await import("node:fs/promises").then((fs) =>
        fs.readFile(filePath, "utf-8"),
      );
      return data;
    } catch (error) {
      console.error("Error reading text file:", error);
      return "";
    }
  }

  private static parseProductsFromText(text: string): iProduct[] {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [manufacture = "", codes = ""] = line.split("-");
        return {
          manufactureCode: manufacture.trim(),
          colorCode: codes
            ? codes.split(",").map((c) => c.trim().toUpperCase())
            : [],
        } as iProduct;
      });
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
