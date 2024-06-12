const config = require("../config");
const utils = require("./helpers/utils")
const auth = require("./helpers/auth");
const manipulateData = require("./helpers/manipulateData");
const articleController = require("./controllers/articleController");
const userController = require("./controllers/userController");


const endPoints = new Map([
  [/^\/static\//, utils.setHandlerObject("GET", manipulateData.serveStaticBuild)],
  [/^\/assets\//, utils.setHandlerObject("GET", manipulateData.serveAssets)],
  ["/api/getTurnConfig", utils.setHandlerObject("GET", manipulateData.getTurnConfig)],
  ["/api/login", utils.setHandlerObject("POST", userController.handleLogin)],
  ["/api/logout", utils.setHandlerObject("GET", userController.handleLogOut)],
  ["/auth/google", utils.setHandlerObject("GET", auth.googleAuthHandler)],
  [
    /^\/auth\/google\/callback/,
    utils.setHandlerObject("GET", userController.googleAuthCallback),
  ],
  ["/api/subscribe", utils.setHandlerObject("POST", userController.createAccount)],
  [
    "/api/articles/create",
    utils.setHandlerObject("POST", articleController.createArticle, true),
  ],
  [
    "/api/articles",
    utils.setHandlerObject("GET", articleController.getArticles, true),
  ],
  ["/api/debug", utils.setHandlerObject("GET", manipulateData.getDebugVar)],
  [
    new RegExp(`/api/avatars/${config.AVATAR_PATTERN}`),
    utils.setHandlerObject("GET", userController.getAvatar),
  ],
  [
    /\/api\/articles\/[0-9]+/,
    utils.setHandlerObject("GET", articleController.getSingleArticle, true, 3),
  ],
  [
    new RegExp(`/api/articles/update/${config.MONGOOSE_ID_PATTERN}`),
    utils.setHandlerObject("PUT", articleController.updateArticle, true, 4),
  ],
  ["/", utils.setHandlerObject("GET", manipulateData.redirectToIndex)],
  [/.*/, utils.setHandlerObject("GET", manipulateData.redirectToIndex)],
]);

module.exports = {
    endPoints,
}
