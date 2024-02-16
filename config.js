
//if the react app is served on a different server in dev stage
//we need an absolute url to fetch stuff from our server api
//but once react client is merged we don't need an absolute but a relative url and we can set apiBaseUrl to an empty string
const isDevelopment = process.env.NODE_ENV === "development";
const MY_TURN_SERVER = "turn:77.159.73.15:3478"
const apiBaseUrl = isDevelopment ? "https://localhost:8000" : "";
const SALT_ROUNDS = 10;
const APP_TITLE = "Isaïæ Vox";
const SUB_TITLE = "La plateforme de ta vocation";
const DESCRIPTION =
  "Tu as entendu l'appel du Seigneur et cherches à répondre à cet appel mais sans savoir par où commencer ? Cette app' est faite pour toi !";
const TYPE = "articles";
const CONCEPTEUR = "Ekla Development";
const KEY = "./server/cert/key.pem";
const CERT = "./server/cert/cert.pem";

const ASSETS = "";
const BACKGROUND = "/assets/landscape-0-page4.jpg";

const CLIENT_SESSION_COOKIE_EXP_TIME=60*60;
const SESSION_EXP_TIME=60*60*24;//session expires after one day
const THEME_COLOR = "rgba(70, 130, 180, 0.8)";
const HOVER_BACKGROUND_COLOR = "rgb(230,80,255,.5)";
const HOVER_EFFECT = `&:hover {
    background-color: ${HOVER_BACKGROUND_COLOR};
transition: background-color 0.3s ease,color 0.3s ease,border-color 0.3s ease;`

const FAILURE_COLOR='#e74c3c'
const SUCCESS_COLOR = "rgba(192, 130,140,0.8)";
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
const content_type = "Content-Type";
const html = "text/html";

module.exports = {
    MY_TURN_SERVER,
    DEFAULT_AVATAR_HASH_NAME,
    GOOGLE_USER_INFO_URL,
    GOOGLE_TOKEN_URL,
    HOVER_EFFECT,
    SESSION_EXP_TIME,CLIENT_SESSION_COOKIE_EXP_TIME,
    KEY,
    CERT,
  SALT_ROUNDS,
  MONGOOSE_ID_PATTERN,
    AVATAR_PATTERN,
    ARTICLES_PATH,USERS_PATH,
  DATA_PATH,
  ASSETS,
  BACKGROUND,
  TYPE,
  DESCRIPTION,
  CONCEPTEUR,
  apiBaseUrl,
  isDevelopment,
  APP_TITLE,
  SUB_TITLE,
  THEME_COLOR,
  SUCCESS_COLOR,
    FAILURE_COLOR,
  MUTLIPART_BOUNDARY,
  API,
};

