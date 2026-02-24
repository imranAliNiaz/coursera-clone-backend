import "dotenv/config";
import http from "http";
import app from "./app";
import { env } from "./config/env";
import { initSocket } from "./socket";

const PORT = env.PORT || 5000;

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
