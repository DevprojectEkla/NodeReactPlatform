const { mongoose } = require("mongoose");
const logger = require("../helpers/logger");
const { createSession, createGoogleSession } = require("./sessionController");
const url = require("url");
const {
  setCodeForGoogle,
  destroySession,
  getSessionIdFromClientCookie,
  getCookieData,
  hashPassWord,googleSessionRedirect,

} = require("../helpers/auth");
const User = require("../models/User");
const fs = require("fs");
const {
  redirect,
  sendToken,
  fetchUserData,
  getAvatarUserFile,
  response,
  sendSuccess,
  failure,
  collectRequestData,
  parseMultiPartDataIntoKeyValue,
  hashData,
  writeToDisk,
  } = require("../helpers/manipulateData");
const {
  GOOGLE_TOKEN_URL,
  GOOGLE_USER_INFO_URL,
  USERS_PATH,
} = require("../../config");
async function getUsers(req, res) {
  return await User.find({}).lean();
}

const getHashed = async (email) => {
  const users = await getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      logger.info("the email match this user:", users[i]);
      return users[i].password;
    }
  }
  return null;
};
async function createSessionFromGoogleAuth(req, res, googleId) {
  const user = await User.findOne({ email }).lean();
}
function googleAuthCallback(req, res) {
  console.log("Google Auth callback after redirect started");

  const queryUrl = url.parse(req.url, true);
  const code = queryUrl.query.code;

  // Assuming this function sets the code for the Google token request
  const postData = setCodeForGoogle(code);

  const tokenOptions = {
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded",
    },
  };

  // Replace GOOGLE_TOKEN_URL with the actual URL for Google's token endpoint
  sendToken(GOOGLE_TOKEN_URL, tokenOptions, postData, (tokenRes) => {
    const tokenInfo = JSON.parse(tokenRes);
    console.log(tokenInfo);
    const accessToken = tokenInfo.access_token;

    const userInfoUrl = GOOGLE_USER_INFO_URL;
    fetchUserData(accessToken, userInfoUrl, async (data) => {
      const userData = JSON.parse(data);
      console.log(data, userData.name, userData.sub);

    const session =  await createGoogleSession(req, res, userData);
    googleSessionRedirect(req, res, session, "/");
    });
  });
}

async function handleLogOut(req, res) {
  logger.debug("handleLogOut Triggered");
  const sessionId = await getSessionIdFromClientCookie(req);
  const sessionData = await getCookieData(req);
  destroySession(sessionId);
  res.setHeader(
    "Set-Cookie",
    `session_data=${sessionData};Secure;SameSite=None;HttpOnly; expires=expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
  );
  sendSuccess(res, "delete session cookie in the client");
}
async function getAvatar(req, res) {
  logger.debug("getAvatar started");

  const sessionData = await getCookieData(req);
  console.log("getAvatar sessionData from cookie:", sessionData);
  const avatar = await getAvatarUserFile(
    sessionData.avatar.name,
    sessionData.avatar.type
  );
  sendSuccess(res, avatar);
}

async function handleLogin(req, res) {
  try {
    collectRequestData(req, async (data) => {
      const { email, password } = JSON.parse(data);
      logger.info(`${email}, ${password}`);
      const username = email;
      createSession(req, res, username, email, password);
    });
  } catch (error) {
    logger.error("cannot create a session:", error);
  }
}
async function createAccount(req, res) {
  try {
    collectRequestData(req, async (data) => {
      const { username, email, password, quote, filename, type, content } =
        parseMultiPartDataIntoKeyValue(data);
      const hashName = hashData(content);
      const hashPass = await hashPassWord(password);
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return response(res, `email ${email} is already registered`, 409);
      }
      const existingUserName = await User.findOne({ username });
      if (existingUserName) {
        return response(res, `username ${username} is already registered`, 409);
      }
      const newAccount = new User({
        username: username,
        email: email,
        password: hashPass,
        email: email,
        quote: quote,
        avatar: {
          id: new mongoose.Types.ObjectId(),
          fileName: filename,
          mimeType: type,
          content:
            "Data is stored on disk and is accessible via uniqueName property",
          uniqueName: hashName,
        },
      });
      const targetDir = USERS_PATH;
      writeToDisk(hashName, content, type, targetDir);
      await newAccount.save();
      logger.info("new user registered:", newAccount);
      return createSession(
        req,
        res,
        newAccount.username,
        newAccount.email,
        password,
        newAccount.avatar.uniqueName,
        newAccount.avatar.mimeType
      );
      // sendSuccess(res,"Account created successfully", 201);
    });

    logger.info("Account successfully created for /api/subscribe");
  } catch (error) {
    logger.error("Server Error while trying to create a new Account:", error);
    const data = { message: `Failed to create an Account ${error}` };
    failure(res, JSON.stringify(data));
  }
}

module.exports = {
  googleAuthCallback,
  getAvatar,
  handleLogin,
  handleLogOut,
  createAccount,
};
