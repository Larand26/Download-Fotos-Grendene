import App from "./App.js";
import { logger } from "./utils/logger.js";

const app = new App();
app
  .start()
  .then(() => logger.success("Aplicação finalizada com sucesso."))
  .catch((err) =>
    logger.error(`Erro não tratado na aplicação: ${String(err)}`),
  );
