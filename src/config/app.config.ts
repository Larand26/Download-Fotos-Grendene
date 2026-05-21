import dotenv from "dotenv";

dotenv.config();

export default {
  txtFilePath: process.env.TXT_FILE_PATH || "",
  photosDownloadPath: process.env.DOWNLOAD_DIR || "",
  maxPhotoPositions: Number(process.env.MAX_PHOTO_POSITIONS) || 5,
};
