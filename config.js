
//if the react app is served on a different server in dev stage
//we need an absolute url to fetch stuff from our server api
//but once react client is merged we don't need an absolute but a relative url and we can set apiBaseUrl to an empty string
const dotenv = require("dotenv");
dotenv.config({ path: "./config/.env" });

const isDevelopment = process.env.NODE_ENV === "development";
const apiBaseUrl = isDevelopment ? process.env.DEV_URL : "";
const SALT_ROUNDS = process.env.SALT_ROUNDS;
const KEY = process.env.PATH_KEY;
const CERT = process.env.PATH_CERT;
console.log(KEY,CERT)

const CLIENT_SESSION_COOKIE_EXP_TIME=process.env.CLIENT_SESSION_COOKIE_EXP_TIME ;
const SESSION_EXP_TIME=process.env.SESSION_EXP_TIME;//session expires after one day
const MUTLIPART_BOUNDARY = process.env.MUTLIPART_BOUNDARY;
const API = process.env.API
const DEFAULT_AVATAR_HASH_NAME = process.env.DEFAULT_AVATAR_HASH_NAME; 
const GOOGLE_TOKEN_URL = process.env.GOOGLE_TOKEN_URL;
const GOOGLE_USER_INFO_URL= process.env.GOOGLE_USER_INFO_URL;
const DATA_PATH = process.env.DATA_PATH;
const ARTICLES_PATH = process.env.ARTICLES_PATH; 
const USERS_PATH = process.env.USERS_PATH; 
const AVATAR_PATTERN = process.env.AVATAR_PATTERN;
const MONGOOSE_ID_PATTERN = process.env.MONGOOSE_ID_PATTERN;
console.log(DATA_PATH,apiBaseUrl,GOOGLE_TOKEN_URL,GOOGLE_USER_INFO_URL)

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

