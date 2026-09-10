import appConfig from "../config/app.config.js";
import type { iProduct } from "../interfaces/app.interfaces.js";
import { access, readFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { logger } from "../utils/logger.js";
import * as XLSX from "xlsx";

export interface ResalePriceResult {
  resalePrice: string;
  packing: "F" | "C";
}

export default class TxtService {
  private static async checkFileExists(): Promise<boolean> {
    try {
      const filePath = resolve(appConfig.txtFilePath);
      await access(filePath);
      logger.info(`Arquivo TXT encontrado: ${filePath}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao verificar existência do arquivo: ${String(error)}`);
      return false;
    }
  }

  private static async readTxtFile(): Promise<string> {
    try {
      const filePath = resolve(appConfig.txtFilePath);
      const data = await readFile(filePath, "utf-8");
      logger.info(
        `Arquivo lido com sucesso: ${filePath} (tamanho: ${data.length} bytes)`,
      );
      return data;
    } catch (error) {
      logger.error(`Erro ao ler o arquivo de texto: ${String(error)}`);
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
          colorCodes: codes
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

    logger.info(`Produtos parseados: ${products.length}`);

    return products;
  }

  static async getResalePrice(
    manufactureCode: string,
  ): Promise<ResalePriceResult | null> {
    try {
      const folderPath =
        "C:\\Users\\Victor.DESKTOP-C4LD4B4\\Desktop\\20.03\\segmentacao";
      const files = await readdir(folderPath);

      // Filtra apenas arquivos válidos do Excel e ignora temporários (~$)
      const excelFiles = files.filter(
        (file) =>
          (file.endsWith(".xlsx") || file.endsWith(".xls")) &&
          !file.startsWith("~$"),
      );

      const searchCode = String(manufactureCode).trim().toLowerCase();

      for (const file of excelFiles) {
        const fullPath = join(folderPath, file);

        // Lê o arquivo como buffer em memória usando fs/promises
        const fileBuffer = await readFile(fullPath);
        // Usa XLSX.read com o buffer em vez de XLSX.readFile
        const workbook = XLSX.read(fileBuffer, { type: "buffer" });

        for (const sheetName of workbook.SheetNames) {
          const sheet = workbook.Sheets[sheetName];

          // Evita erro de 'WorkSheet | undefined' no TypeScript
          if (!sheet) continue;

          // Extrai linhas preservando formatações (R$)
          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            raw: false,
            defval: "",
          });

          // Busca correspondências na Coluna C (índice 2)
          const matchingRows = rows.filter((row) => {
            const cellC = String(row?.[1] ?? "")
              .trim()
              .toLowerCase();
            return cellC === searchCode;
          });

          // Se encontrar 1 ou 2 correspondências na mesma tabela
          if (matchingRows.length === 1 || matchingRows.length === 2) {
            const firstMatch = matchingRows[0];
            const resalePriceValue = String(firstMatch?.[5] ?? "").trim();

            return {
              resalePrice: resalePriceValue,
              packing: matchingRows.length === 1 ? "F" : "C",
            };
          }
        }
      }

      return null;
    } catch (error) {
      console.error(
        `Erro ao buscar preço de revenda para o código ${manufactureCode}:`,
        error,
      );
      return null;
    }
  }
}
