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
    // Agrupa por referência: a mesma referência em várias linhas soma as cores
    const products = new Map<string, Set<string>>();

    text
      .replace(/^﻿/, "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line, index) => {
        const separator = line.indexOf("-");
        const manufacture = separator === -1 ? "" : line.slice(0, separator);
        const codes = separator === -1 ? "" : line.slice(separator + 1);
        const colorCodes = codes
          .split(/[,;]/)
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean);

        if (!manufacture.trim() || colorCodes.length === 0) {
          logger.warning(
            `Linha ${index + 1} ignorada (formato esperado "referência-cor,cor"): ${line}`,
          );
          return;
        }

        const key = manufacture.trim();
        const colors = products.get(key) ?? new Set<string>();
        colorCodes.forEach((c) => colors.add(c));
        products.set(key, colors);
      });

    return [...products].map(([manufactureCode, colors]) => ({
      manufactureCode,
      colorCodes: [...colors],
    }));
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

  // Planilhas lidas uma única vez e reaproveitadas para todos os produtos
  private static excelSheetsPromise: Promise<any[][][]> | null = null;

  private static loadExcelSheets(): Promise<any[][][]> {
    this.excelSheetsPromise ??= (async () => {
      const folderPath =
        "C:\\Users\\vbl09\\OneDrive\\Desktop\\20.03\\Segmentacao";
      const files = await readdir(folderPath);

      // Filtra apenas arquivos válidos do Excel e ignora temporários (~$)
      const excelFiles = files.filter(
        (file) =>
          (file.endsWith(".xlsx") || file.endsWith(".xls")) &&
          !file.startsWith("~$"),
      );

      const sheets: any[][][] = [];
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
          sheets.push(
            XLSX.utils.sheet_to_json(sheet, {
              header: 1,
              raw: false,
              defval: "",
            }),
          );
        }
      }
      return sheets;
    })();
    return this.excelSheetsPromise;
  }

  static async getResalePrice(
    manufactureCode: string,
  ): Promise<ResalePriceResult | null> {
    try {
      const searchCode = String(manufactureCode).trim().toLowerCase();

      for (const rows of await this.loadExcelSheets()) {
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
            packing: matchingRows.length === 1 ? "C" : "F",
          };
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
