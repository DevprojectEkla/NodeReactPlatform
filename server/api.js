const config = require("../config");
const utils = require("./helpers/utils");
const auth = require("./helpers/auth");
const manipulateData = require("./helpers/manipulateData");
const articleController = require("./controllers/articleController");
const userController = require("./controllers/userController");
const contactController = require("./controllers/contactController");
const paymentController = require("./controllers/paymentController");

const endPointsArray = [
  [
    /^\/static\//,
    "GET",
    "serve static build files",
    manipulateData.serveStaticBuild,
  ],
  [/^\/assets\//, "GET", "serve assets files", manipulateData.serveAssets],
  ["/api", "GET", "show this api descripion", getApi],
  [
    "/api/getTurnConfig",
    "GET",
    "get turn server configuration",
    manipulateData.getTurnConfig,
  ],
  [
    "/api/payments",
    "POST",
    "post the payment form [not implemented]",
    paymentController.makePayments,
  ],
  [
    "/api/sendMail",
    "POST",
    "send a mail to the admin via the contact form",
    contactController.sendMail,
  ],
  ["/api/login", "POST", "send login form", userController.handleLogin],
  ["/api/logout", "GET", "log current user out", userController.handleLogOut],
  ["/auth/google", "GET", "google Auth handler", auth.googleAuthHandler],
  [
    /^\/auth\/google\/callback/,
    "GET",
    "google Auth callback function",
    userController.googleAuthCallback,
  ],
  [
    "/api/subscribe",
    "POST",
    "post subscription form",
    userController.createAccount,
  ],
  [
    "/api/articles/create",
    "POST",
    "create a new article",
    articleController.createArticle,
    true,
  ],
  [
    "/api/articles",
    "GET",
    "get the list of articles from MongoDB",
    articleController.getArticles,
    true,
  ],
  [
    "/api/debug",
    "GET",
    "get the DEBUG variable value from the server",
    manipulateData.getDebugVar,
  ],
  [
    new RegExp(`/api/avatars/${config.AVATAR_PATTERN}`),
    "GET",
    "get the avatar based on the given pattern",
    userController.getAvatar,
  ],
  [
    /\/api\/articles\/[0-9]+/,
    "GET",
    "get article by ID",
    articleController.getSingleArticle,
    true,
    3,
  ],
  [
    new RegExp(`/api/articles/update/${config.MONGOOSE_ID_PATTERN}`),
    "PUT",
    "update article",
    articleController.updateArticle,
    true,
    4,
  ],
  ["/", "GET", "get index.html", manipulateData.redirectToIndex],
  [
    /.*/,
    "GET",
    "every other root will redirect to the index.html",
    manipulateData.redirectToIndex,
  ],
];
const endPoints = endPointsArray.map((endpoint) =>
  utils.setHandlerObject(...endpoint)
);
console.warn(endPointsArray, endPoints);
//@desc:   get API description
//@route: /api
async function getApi(req, res) {
  try {
    manipulateData.sendSuccess(
      res,
      endPoints.filter((endpoint) => !(endpoint.route instanceof RegExp))
    );
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  endPoints,
};
