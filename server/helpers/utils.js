const logger = require("./logger")


function routeMethodError404(req, res) {
  res.writeHead(404, { "Content-type": "application/json" });
  res.end(JSON.stringify({ message: "Route Not Found" }));
  console.log("TODO: other method or url");
}
function setHandlerObject(route, method, desc, handler, require_auth, index = 0) {
  return {route, method, desc, handler, require_auth, index };
}
const logError = (req, err) => {
  logger.error(
    `Error handling request for ${req.method} ${req.url}: ${err.stack}`
  );
  logger.error(`Request Headers: ${JSON.stringify(req.headers)}`);
};



module.exports = {routeMethodError404,setHandlerObject,logError,}
