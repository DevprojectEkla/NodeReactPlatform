const http = require("http");
const cors = require("cors");
const {
  getApi,
  getArticles,
  getSingleArticle,
  createArticle,
  updateArticle,
} = require("./controllers/articleController");
const { createSession } = require("./controllers/userController");
const { isDevelopment, MONGOOSE_ID_PATTERN } = require("../config");
const { default: mongoose } = require("mongoose");
const dotenv = require("dotenv");
const connectMongoDB = require("../config/mongodb");

dotenv.config({ path: "./config/.env" });

connectMongoDB();

const PORT = process.env.SERVER_PORT || 8000;

const server = http.createServer((req, res) => {
  // response(res, header,content,
  // status_code)
});
//this would be the same as if we wrote the body function inside the create server function
// server.on('request',(req,res) => {

//     corsMiddleware(req,res, () => {
//     route(req,res);
//         server.emit('app.request',req,res);
//     })
// })

const middleware = (server, middleware, routes) => {
  server.on("request", (req, res) => {
    middleware(req, res, () => {
      routes(req, res);
      server.emit("app.request", req, res);
    });
  });
};
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
const routeMethodCallback = (
  req,
  res,
  { url = "", pattern = "", index = 0, type, callback } = {}
) => {
  console.log("Checking route:", { type });
  // console.log("callback method");

  if (pattern && req.url.match(pattern) && checkMethod(req, type)) {
    console.log(`match for: ${type}`);
    const id = req.url.split("/")[index];
    // console.log("article ID:", id);

    callback(req, res, id);
    return true;
  } else if (req.url === url && checkMethod(req, type)) {
    callback(req, res);
    return true;
  } else {
    console.log(`no method matched for: ${req.url}, with ${type} method`);
    return false;
  }
};
// }
function routeMethodError404(req, res) {
  res.writeHead(404, { "Content-type": "application/json" });
  res.end(JSON.stringify({ message: "Route Not Found" }));

  console.log("TODO: other method or url");
}


const routes = [
  {
    url: "",
    pattern: "/api/articles/([1-9]+)",
    index: 4,
    type: "GET",
    callback: getSingleArticle,
  },
  {
    url: "/api/articles",
    pattern: "",
    index: 1,
    type: "GET",
    callback: getArticles,
  },
  {
    url: "/",
    pattern: "",
    index: 1,
    type: "GET",
    callback: getApi,
  },
  {
    url: "/api/articles/create",
    pattern: "",
    index: 0,
    type: "POST",
    callback: createArticle,
  },
  {
    url: "",
    pattern: `/api/articles/update/${MONGOOSE_ID_PATTERN}`,
    index: 4,
    type: "PUT",
    callback: updateArticle,
  },
  {
    url: "/api/login",
    pattern: "",
    index: 0,
    type: "POST",
    callback: createSession,
  },
];

const route = (req, res) => {
  let methodMatch = false;

  for (const routeInfo of routes) {
    const { url, pattern, index, type, callback } = routeInfo;

    if (routeMethodCallback(req, res, { url, pattern, index, type, callback })) {
      methodMatch = true;
      break;
    }
  }

  if (!methodMatch) {
    routeMethodError404(req, res);
  }
};
if (isDevelopment) {
  //when dealing with a client running on port 3000 and server on port 8000
  //the origin of the request is automatically blocked by the server for security
  //leading to a Cross Origin Resource Sharing error
  //but cors npm module can be used to allow this multiple origin request
  const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 204, // some legacy browsers (IE11, various SmartTVs) choke on 204
    methods: ["GET", "POST", "PUT","DELETE" ],
  };

  const corsMiddleware = cors(corsOptions);

  middleware(server, corsMiddleware, route);
} else {
  middleware(server, route);
}

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
