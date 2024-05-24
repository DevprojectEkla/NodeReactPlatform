
//if the react app is served on a different server in dev stage
//we need an absolute url to fetch stuff from our server api
//but once react client is merged we don't need an absolute but a relative url and we can set apiBaseUrl to an empty string
const dotenv = require("dotenv");
dotenv.config({ path: "./config/.env" });

const isDevelopment = process.env.NODE_ENV === "development";
const apiBaseUrl = isDevelopment ? "https://localhost:8000" : "";
const SALT_ROUNDS = process.env.SALT_ROUNDS;
const KEY = process.env.PATH_KEY;
const CERT = process.env.PATH_CERT;

const CLIENT_SESSION_COOKIE_EXP_TIME=60*60;
const SESSION_EXP_TIME=60*60*24;//session expires after one day
const MUTLIPART_BOUNDARY =
  "boundaryParsingDataWithEklaDevelopmentCompany12345678901234567890123467890";
const API = {
  "/": "GET",
  "/api/articles": "GET",
  "/api/articles/:id": "GET",
  "/api/articles/create": "POST",
  "/api/articles/update/:id": "PUT",
  "/api/login": "POST",
  "/api/subscribe": "POST",
};
const DEFAULT_AVATAR_HASH_NAME = '2f6ef1ab218b73b662d2ef359aba36ce8ca9086a6aca2f5e7748a8d0fed58aca'
const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';
const GOOGLE_USER_INFO_URL= 'https://www.googleapis.com/oauth2/v3/userinfo';
const DATA_PATH = "./server/data";
const ARTICLES_PATH = "articles/img"
const USERS_PATH = "users/avatars"
const AVATAR_PATTERN = "([0-9a-fA-F]{64})";
const MONGOOSE_ID_PATTERN = "([0-9a-fA-F]{24})";

module.exports = {
    DEFAULT_AVATAR_HASH_NAME,
    GOOGLE_USER_INFO_URL,
    GOOGLE_TOKEN_URL,
    SESSION_EXP_TIME,CLIENT_SESSION_COOKIE_EXP_TIME,
    KEY,
    CERT,
  SALT_ROUNDS,
  MONGOOSE_ID_PATTERN,
    AVATAR_PATTERN,
    ARTICLES_PATH,USERS_PATH,
  DATA_PATH,
  apiBaseUrl,
  isDevelopment,
  MUTLIPART_BOUNDARY,
  API,
};

