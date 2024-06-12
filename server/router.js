const api = require("./api");
const auth = require("./helpers/auth");
const manipulateData = require("./helpers/manipulateData");
const utils = require("./helpers/utils");

const router = async (req, res) => {
  try {
    const { url, method, headers } = req;

    for (const [
      availableRoute,
      { method: availableMethod, handler, require_auth, index },
    ] of api.endPoints) {
      if (isRouteMatching(availableRoute, availableMethod, url, method)) {
        console.debug(headers);
        console.log(
          `Request match OK for: ${url} - ${method} - available: ${availableMethod}`
        );

        if (require_auth && !(await isAuthenticated(req, res))) {
          return;
        }

        handleRequest(handler, req, res, index, url);
        return;
      }
    }

    console.log(`No match for: ${url}, ${method}`);
    utils.routeMethodError404(req, res);
  } catch (err) {
    utils.logError(req, err);
    respondWithError(res, "Internal Server Error", 500);
  }
};

const isRouteMatching = (availableRoute, availableMethod, url, method) => {
  return (
    (typeof availableRoute === "string" &&
      availableRoute === url &&
      availableMethod === method) ||
    (availableRoute instanceof RegExp &&
      availableRoute.test(url) &&
      availableMethod === method)
  );
};

const isAuthenticated = async (req, res) => {
  console.log("Checking for authentication...");
  const session = await auth.getSessionData(req);
  if (!session) {
    console.log("Authentication needed to access this resource");
    manipulateData.response(
      res,
      "Unauthorized. Please login to access this page",
      401
    );
    return false;
  }
  return true;
};

const handleRequest = (handler, req, res, index, url) => {
  if (index === 0) {
    handler(req, res);
  } else {
    const id = url.split("/")[index];
    handler(req, res, id);
  }
};

const respondWithError = (res, message, statusCode) => {
  res.writeHead(statusCode, { "Content-type": "application/json" });
  res.end(JSON.stringify({ error: message }));
};

module.exports = {
  router,
};
