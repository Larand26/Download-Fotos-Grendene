import dotenv from "dotenv";

dotenv.config();

export default {
  txtFilePath: process.env.TXT_FILE_PATH || "",
  photosDownloadPath: process.env.DOWNLOAD_DIR || "",
  maxPhotoPositions: Number(process.env.MAX_PHOTO_POSITIONS) || 5,
  // Quantos downloads rodam ao mesmo tempo (evita sobrecarregar a API)
  downloadConcurrency: Number(process.env.DOWNLOAD_CONCURRENCY) || 5,
  // Quantas vezes tentar novamente uma foto que falhou por erro temporário
  downloadRetries: Number(process.env.DOWNLOAD_RETRIES) || 15,
  // Tempo máximo de cada requisição (ms)
  downloadTimeoutMs: Number(process.env.DOWNLOAD_TIMEOUT_MS) || 60000,
  // Quantas rodadas no total para as fotos que falharam ou deram 502
  downloadRounds: Number(process.env.DOWNLOAD_ROUNDS) || 3,
  // Pausa antes da 2ª rodada (ms); dobra na 3ª, triplica na 4ª...
  roundPauseMs: Number(process.env.ROUND_PAUSE_MS) || 30000,
};
