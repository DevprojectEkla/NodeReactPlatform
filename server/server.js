const path = require("path");
const logger = require("./helpers/logger");
const http = require("http");
const https = require("https");
const cors = require("cors");
const router = require("./router");
const config = require("../config");
const serverConfig = require("./serverConfig");
const dotenv = require("dotenv");
const connectMongoDB = require("../config/mongodb");
const webSocketServer = require("./webSocketServer");

dotenv.config({ path: path.join(__dirname, "./config/.env") });

connectMongoDB();
const PORT = process.env.SERVER_PORT || 8000;

const createProdServer = () => {
  const server = http.createServer((req, res) => {
    router.router(req, res);
  });
  logger.info("::Server Started in Production Mode::");
  return server;
};

const createDevServer = () => {
  const server = https.createServer(serverConfig.encryptionOpts, (req, res) => {
    cors(serverConfig.corsOptions)(req, res, () => {
      router.router(req, res);
    });
  });
  logger.info(
    "Development Mode started (for production mode set the NODE_ENV environment variable to anything but 'development')"
  );
  return server;
};

const server = config.isDevelopment ? createDevServer() : createProdServer();
const io = webSocketServer.io(server);
webSocketServer.startSocketIo(io);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
