const logger = require("../helpers/logger");
const bcrypt = require("bcrypt");
const { sendSuccess } = require("../helpers/manipulateData");
const Session = require("../models/Session");
const {
  apiBaseUrl,
  CLIENT_SESSION_COOKIE_EXP_TIME,
  SALT_ROUNDS,
  isDevelopment,
} = require("../../config");
const uuid = require("uuid");

const protocole = isDevelopment ? "https://" : "http://";
const setCodeForGoogle = (code) => {
  return `code=${code}&client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_SECRET}&redirect_uri=${protocole}${apiBaseUrl}/auth/google/callback
&grant_type=authorization_code`;
};

function googleAuthHandler(req, res) {
  logger.info("Google Auth handler started");
  logger.debug(`process.env: ${process.env.GOOGLE_CLIENT_ID}`);
  const data = {
    redirect: `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=https://${apiBaseUrl}/auth/google/callback
&scope=profile email&client_id=${process.env.GOOGLE_CLIENT_ID}`,
  };
  sendSuccess(res, data);
}
function googleSessionRedirect(req, res, session, location) {
  setCookieHeader(res, session);
  res.writeHead(302, { Location: location });
  res.end();
}

async function setCookieHeader(res, data) {
  const expirationDate = new Date(
    Date.now() + parseInt(CLIENT_SESSION_COOKIE_EXP_TIME, 10) * 1000 * 60 * 60); // * 1000 * 60 * 60 converts milliseconds in hours
  const expires = expirationDate.toUTCString();
  console.log("Expiration time", expires);
  const userDataString = JSON.stringify({
    sessionId: data["id"],
    username: data["userData"].username,
    avatar: {
      name: data["userData"].avatar.uniqueName,
      type: data["userData"].avatar.type,
    },
    // Add other user data as needed
  });
  console.log(
    `Set-Cookie: session_data=${encodeURIComponent(
      userDataString
    )}; Secure; SameSite=None; expires=${expires}; Path=/`
  );
  res.setHeader(
    "Set-Cookie",
    `session_data=${encodeURIComponent(
      userDataString
    )}; Secure; SameSite=None; expires=${expires}; Path=/`
  ); //HttpOnly is more secure but prevent browser to access the session cookie
}

const generateSessionId = () => {
  return uuid.v4();
};
const checkSessionOpen = async (checkUser) => {
  console.log("checking for already existing session");
  const session = await Session.findOne({
    $or: [{ "userData.username": checkUser }, { "userData.email": checkUser }],
  });
  logger.info(`session find ${session}`);
  if (session) {
    console.log("a session with this username already exists:", session);

    return session;
  } else {
    return null;
  }
};

const destroySession = async (id) => {
  logger.info(`Destroying session with id:${id}`);
  try {
    await Session.deleteOne({ sessionId: id });
    logger.info("The session has been destroyed in DataBase");
  } catch (error) {
    logger.error(
      "Error when trying to delete a session model in DataBase:",
      error
    );
    logger.info("Cannot delete the session: the session does not exist");
  }
};
const getCookieData = async (req) => {
  try {
    const cookieData = JSON.parse(
      decodeURIComponent(
        await req.headers.cookie
          ?.split(";")
          .find((cookie) => cookie.trim().startsWith("session_data="))
          ?.split("=")[1]
      )
    );
    return cookieData;
  } catch (err) {
    logger.error("enable to parse data from cookie");
  }
};
const getSessionIdFromClientCookie = async (req) => {
  return JSON.parse(
    decodeURIComponent(
      await req.headers.cookie
        ?.split(";")
        .find((cookie) => cookie.trim().startsWith("session_data="))
        ?.split("=")[1]
    )
  ).sessionId;
};
const getSessionData = async (req) => {
  let session = null;
  try {
    const sessionId = await getSessionIdFromClientCookie(req);
    console.log(
      "Session ID retrieved from client side cookie session :",
      sessionId
    );
    session = await Session.findOne({ sessionId });
    if (session) {
      console.log("Session object retrieved from database:", session);
    } else {
      console.log(
        "No session in database was find for this client session cookie ID:",
        sessionId
      );
      console.log("the session must have expired");
    }
  } catch (error) {
    logger.error(
      `there was an error trying to retrieve session info with session ID: ${error}`
    );
  }
  return session;
};

const hashPassWord = async (password) => {
  const hashedPass = bcrypt.hash(password, parseInt(SALT_ROUNDS, 10));
  return hashedPass;
};
const comparePassWord = async (password, hashed) => {
  return await bcrypt.compare(password, hashed);
};
module.exports = {
  googleSessionRedirect,
  setCodeForGoogle,
  getCookieData,
  getSessionIdFromClientCookie,
  destroySession,
  googleAuthHandler,
  checkSessionOpen,
  setCookieHeader,
  getSessionData,
  generateSessionId,
  hashPassWord,
  comparePassWord,
};
