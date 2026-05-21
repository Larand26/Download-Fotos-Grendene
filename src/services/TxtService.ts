import appConfig from "../config/app.config.js";
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

  static async fetchProductsTxt() {
    const fileExists = await this.checkFileExists();
    console.log("File exists:", fileExists);
  }
}
