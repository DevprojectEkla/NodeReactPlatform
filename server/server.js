const path = require('path')
const logger = require("./helpers/logger");
// const https = require("https");
const http = require("http");
const https = require("https");
const cors = require("cors");
const fs = require("fs");
const {
  response,
  redirectToIndex,
  serveAssets,
  serveStaticBuild,
  sendSuccess,
  getTurnConfig,
  getDebugVar,
} = require("./helpers/manipulateData");
const {
  getApi,
  getArticles,
  getSingleArticle,
  createArticle,
  updateArticle,
} = require("./controllers/articleController");

const {
  createAccount,
  googleAuthCallback,
  getAvatar,
  handleLogOut,
  handleLogin,
} = require("./controllers/userController");
const {
  isDevelopment,
  CERT,
  KEY,
  MONGOOSE_ID_PATTERN,
  AVATAR_PATTERN,
} = require("../config");
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname,"./config/.env") });
const connectMongoDB = require("../config/mongodb");
const { googleAuthHandler, getSessionData } = require("./helpers/auth");
const { Server } = require("socket.io");

connectMongoDB();
const PASS_PHRASE = process.env.PASS_PHRASE;

const PORT = process.env.SERVER_PORT || 8000;

const encryptionOpts = {
  key: fs.readFileSync(KEY),
  cert: fs.readFileSync(CERT),
  passphrase: PASS_PHRASE,
};
// const server = https.createServer(encryptionOpts, (req, res) => {});
const corsOptions = {
  origin: ["http://localhost:3000", "http://192.168.133.106:3000"],
  optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ["GET", "POST", "PUT", "DELETE"],
  preflightContinue: false,
  credentials: true,
};
const createProdServer = () => {
  const server = http.createServer((req, res) => {
    router(req, res);
  });
  logger.info("::Server Started in Production Mode::");
  return server;
};
const createDevServer = () => {
  const server = https.createServer(encryptionOpts, (req, res) => {
    cors(corsOptions)(req, res, () => {
      router(req, res);
    });
  });
  logger.info(
    "Development Mode started (for production mode set the NODE_ENV environment variable to anything but 'development')"
  );

  return server;
};
// , {
// cors: {
// origin: "*", // Update with the actual origin of your client application
// methods: ["GET", "POST"],
// },
// }); //this would be the same as if we wrote the body function inside the create server function
// server.on('request',(req,res) => {

//     corsMiddleware(req,res, () => {
//     route(req,res);
//         server.emit('app.request',req,res);
//     })
// })
function checkMethod(req, type) {
  if (req.method === type) {
    return true;
  } else {
    return false;
  }
}
function isGET(req) {
  return checkMethod(req, "GET");
}
function isPOST(req) {
  return checkMethod(req, "POST");
}
function isDELETE(req) {
  return checkMethod(req, "DELETE");
}
const routeMethodCallback = async (
  req,
  res,
  {
    url = "",
    pattern = "",
    index = 0,
    type,
    require_auth = true,
    callback,
  } = {}
) => {
  console.log(
    `Checking route ${url} for method: ${type}, with pattern: ${pattern} and auth:${auth}`
  );
  // console.log("callback method");
  if (require_auth) {
    console.log("checking for authentication...");
    const session = await getSessionData(req);
    if (!session) {
      console.log("authentication needed to access this resource");
      response(res, "Unauthorized. Please login to access this page", 401);

      return false;
    }
  }

  if (pattern && req.url.match(pattern) && checkMethod(req, type)) {
    console.log(`match for: ${type}`);
    const id = req.url.split("/")[index];
    // console.log("article ID:", id);

    callback(req, res, id);
    return true;
  } else if (req.url === url && checkMethod(req, type)) {
    console.log(`match for: ${type}`);
    callback(req, res);
    return true;
  } else {
    console.log(` method ${type} did not matched for: ${req.url}`);
    return false;
  }
};
// }
function routeMethodError404(req, res) {
  res.writeHead(404, { "Content-type": "application/json" });
  res.end(JSON.stringify({ message: "Route Not Found" }));

  console.log("TODO: other method or url");
}

function setHandlerObject(method, handler, require_auth, index = 0) {
  return { method, handler, require_auth, index };
}
const connectSocket = (req, res) => {};
const chatHandler = (req, res) => {
  // console.log(req.headers);
};

const api = new Map([
  [/^\/socket.io\//, setHandlerObject("GET", chatHandler)],
  [/^\/socket.io\//, setHandlerObject("POST", chatHandler)],
  // ["/", setHandlerObject("GET", getApi)],
  [/^\/static\//, setHandlerObject("GET", serveStaticBuild)],
  [/^\/assets\//, setHandlerObject("GET", serveAssets)],
  ["/api/getTurnConfig", setHandlerObject("GET", getTurnConfig)],
  ["/api/login", setHandlerObject("POST", handleLogin)],
  ["/api/logout", setHandlerObject("GET", handleLogOut)],
  ["/auth/google", setHandlerObject("GET", googleAuthHandler)],
  [/^\/auth\/google\/callback/, setHandlerObject("GET", googleAuthCallback)],
  ["/api/subscribe", setHandlerObject("POST", createAccount)],
  ["/api/articles/create", setHandlerObject("POST", createArticle, true)],
  ["/api/articles", setHandlerObject("GET", getArticles, true)],
  ["/api/debug", setHandlerObject("GET", getDebugVar)],
  [
    new RegExp(`/api/avatars/${AVATAR_PATTERN}`),
    setHandlerObject("GET", getAvatar),
  ],
  [
    /\/api\/articles\/[0-9]+/,
    setHandlerObject("GET", getSingleArticle, true, 3),
  ],
  [
    new RegExp(`/api/articles/update/${MONGOOSE_ID_PATTERN}`),
    setHandlerObject("PUT", updateArticle, true, 4),
  ],
  ["/", setHandlerObject("GET", redirectToIndex)],
  [/.*/, setHandlerObject("GET", redirectToIndex)], //this handles all routes that are not directly an endpoints and that should be rendererd by the client. so /articles is not an endpoint (it is /api/articles that is an endpoint) and the client will handle that request
]);
const logError = (req, err) => {
  logger.error(
    `Error handling request for ${req.method} ${req.url}: ${err.stack}`
  );
  logger.error(`Request Headers: ${JSON.stringify(req.headers)}`);
};
const router = async (req, res) => {
  try {
    const url = req.url;
    const method = req.method;
    let clientReqMatch = false;
    for (const [
      availableRoute,
      { method: availableMethod, handler, require_auth, index },
    ] of api) {
      if (
        (typeof availableRoute === "string" &&
          availableRoute === url &&
          availableMethod === method) ||
        (availableRoute instanceof RegExp &&
          availableRoute.test(url) &&
          availableMethod === method)
      ) {
        clientReqMatch = true;
        console.log(
          `request match OK for: ${url} - ${method} - available: ${availableMethod}`
        );
        if (require_auth) {
          console.log("checking for authentication...");
          const session = await getSessionData(req);
          if (!session) {
            console.log("authentication needed to access this resource");
            response(
              res,
              "Unauthorized. Please login to access this page",
              401
            );

            return false;
          }
        }
        //the index correspond to the id element retrieved from the matching pattern of the url /.../:id, the value of the index depends on the pattern used to retrieve the ID
        if (index === 0) {
          handler(req, res);
          return;
        } else {
          const id = url.split("/")[index];
          handler(req, res, id);
          return;
        }
      }
    }
    console.log(`No match for : ${url}, ${method}`);
    routeMethodError404(req, res);
  } catch (err) {
    logError(req, err);
    res.writeHead(500, { "Content-type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
};
let anonymousCount = 0;
let users = [];
const userJoinOrLeftCallBack = (socket, userData) => {
  console.log("User connected with data:", userData);
  socket.join("chatRoom");
  io.to("chatRoom").emit("userJoined", {
    socketId: socket.id,
    username: userData.username,
    users: users,
  });
  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id, userData);
    console.log("list before refresh", users);
    users = users.filter(
      (user) => user.userData.username !== userData.username
    );
    io.to("chatRoom").emit("userLeft", {
      socketId: socket.id,
      username: userData.username,
      users: users,
    });
    console.log(
      `user ${userData.username} disconnected new list: ${JSON.stringify(
        users
      )}`
    );
  });
};

const startSocketIo = () => {
  io.on("connection", (socket) => {
    console.log(`WebSocket connected for chat room: ${socket.id}`);
    const handshake = socket.handshake;
    const headers = handshake.headers;
    const clientIP = handshake.address;
    const cookie = headers.cookie;
    console.log("Client IP:", clientIP);
      console.log("Headers of the client:",headers);
    console.log("cookie from socket headers:", cookie);

    const userDataString = decodeURIComponent(cookie).split("session_data=")[1];
    console.log(userDataString);

    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        // const username = userData.username;

        if (
          !users.some((user) => user.userData.username === userData.username)
        ) {
          users = [...users, { userData: userData, socketId: socket.id }];
        }

        console.log("user data from socket.io", userData);
        console.log("users connected", users);
        userJoinOrLeftCallBack(socket, userData);
      } catch (err) {
        logger.error(`Error in retrieving user data from socket.io ${err}`);
      }
    } else {
      console.warn(
        "no user data retrieved by socket.io, disconnecting:",
        socket.id
      );
      socket.disconnect();
    }
    // For example, you can broadcast messages to all clients in the chat room
    socket.on("message", (data) => {
      console.log(`Received message from ${socket.id}: ${data}`);
      // Broadcast the message to all clients in the chat room
      io.emit("message", { sender: socket.id, text: data });
    });
    socket.on("iceCandidate", (iceCandidate) => {
      console.log(
        `IceCandidate received from ${iceCandidate.sender} to ${iceCandidate.receiver}`,
        iceCandidate
      );
      socket.to(iceCandidate.receiver).emit("iceCandidate", iceCandidate);
    });
    socket.on("offer", (offer) => {
      console.log(
        `Received offer:${JSON.stringify(offer)} from ${socket.id} for user ${
          offer.socketId
        }`
      );
      // Broadcast the offer to the target socket
      socket
        .to(offer.socketId)
        .emit("offer", { id: socket.id, offer: offer.offer });
    });

    socket.on("answer", (answer) => {
      console.log(
        `Received answer ${JSON.stringify(answer)} from ${answer.sender} to ${
          answer.receiver
        }`
      );
      // Broadcast the answer to the target socket
      socket.to(answer.receiver).emit("answer", answer);
    });
  });
};

//when dealing with a client running on port 3000 and server on port 8000
//the origin of the request is automatically blocked by the server for security
//leading to a Cross Origin Resource Sharing error
//but cors npm module can be used to allow this multiple origin request

const server = isDevelopment ? createDevServer() : createProdServer();
const initIoDevServer = () => new Server(server, { cors: corsOptions });
const initIoProdServer = () => new Server(server);
const io = isDevelopment ? initIoDevServer() : initIoProdServer();

startSocketIo();

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
