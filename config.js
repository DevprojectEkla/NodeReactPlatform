//if the react app is served on a different server in dev stage
//we need an absolute url to fetch stuff from our server api
//but once react client is merged we don't need an absolute but a relative url and we can set apiBaseUrl to an empty string
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, "./config/.env") });

const isDevelopment = process.env.NODE_ENV === "development";
const HOSTNAME = process.env.HOSTNAME;
const apiBaseUrl = isDevelopment ? process.env.DEV_URL : HOSTNAME;
const SALT_ROUNDS = process.env.SALT_ROUNDS;
const KEY = process.env.PATH_KEY;
const CERT = process.env.PATH_CERT;

const TURN_SERVER_URL = process.env.TURN_SERVER_URL;
const STUN_SERVER_URL = process.env.STUN_SERVER_URL;
const TURN_STATIC_AUTH_SECRET = process.env.TURN_STATIC_AUTH_SECRET;
const TURN_REALM = process.env.TURN_REALM;
const STD_PORT = process.env.STD_PORT;
const SSL_PORT = process.env.SSL_PORT;

//console.log(KEY,CERT,TURN_SERVER_URL,TURN_STATIC_AUTH_SECRET,TURN_REALM)
const CLIENT_SESSION_COOKIE_EXP_TIME =
  process.env.CLIENT_SESSION_COOKIE_EXP_TIME;
const SESSION_EXP_TIME = process.env.SESSION_EXP_TIME; //session expires after one day
const MUTLIPART_BOUNDARY = process.env.MUTLIPART_BOUNDARY;
const API = process.env.API;
const DEFAULT_AVATAR_HASH_NAME = process.env.DEFAULT_AVATAR_HASH_NAME;
const GOOGLE_TOKEN_URL = process.env.GOOGLE_TOKEN_URL;
const GOOGLE_USER_INFO_URL = process.env.GOOGLE_USER_INFO_URL;
const DATA_PATH = process.env.DATA_PATH;
const ARTICLES_PATH = process.env.ARTICLES_PATH;
const USERS_PATH = process.env.USERS_PATH;
const AVATAR_PATTERN = process.env.AVATAR_PATTERN;
const MONGOOSE_ID_PATTERN = process.env.MONGOOSE_ID_PATTERN;
//console.log(DATA_PATH,apiBaseUrl,GOOGLE_TOKEN_URL,GOOGLE_USER_INFO_URL)
module.exports = {
  DEFAULT_AVATAR_HASH_NAME,
  GOOGLE_USER_INFO_URL,
  GOOGLE_TOKEN_URL,
  SESSION_EXP_TIME,
  CLIENT_SESSION_COOKIE_EXP_TIME,
  KEY,
  CERT,
  TURN_SERVER_URL,
  STUN_SERVER_URL,
  TURN_STATIC_AUTH_SECRET,
  TURN_REALM,
  STD_PORT,
  SSL_PORT,
  SALT_ROUNDS,
  MONGOOSE_ID_PATTERN,
  AVATAR_PATTERN,
  ARTICLES_PATH,
  USERS_PATH,
  DATA_PATH,
  apiBaseUrl,
  isDevelopment,
  MUTLIPART_BOUNDARY,
  API,
};
