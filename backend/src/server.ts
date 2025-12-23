import "dotenv/config";
import { env } from "./config/env.js";
import { createApp } from "./app.js";
import { logger } from "./lib/logger.js";
import http from "http";
import { initIo } from "./realtime/io.js";

async function bootstrap() {
  try {
    const app = createApp();
    const server = http.createServer(app);
    const port = Number(env.PORT) || 5000;
    initIo(server);
    server.listen(port, () => {
      logger.info(`Server is now listening to port: http://localhost:${port}`);
    });
  } catch (error) {
    logger.error("Failed to strat server", `${error as Error}.message`);
  }
}
bootstrap();
