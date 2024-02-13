const Session = require("../models/Session");
const logger = require("../helpers/logger");
const { mongoose } = require("mongoose");
const {
  destroySession,
  getSessionIdFromClientCookie,
  getCookieData,
  setCookieHeader,
  checkSessionOpen,
  getSessionData,
  generateSessionId,
  hashPassWord,
  comparePassWord,
} = require("../helpers/auth");
const { notFound, sendSuccess, failure } = require("../helpers/manipulateData");
const User = require("../models/User");
async function createSessionObject(user, session) {
  const sessionID = generateSessionId();
  const userData = {
    userId: user._id,
    username: user.username,
    email: user.email,
    avatar: {
      uniqueName: user.avatar.uniqueName,
      type: user.avatar.mimeType.split("/")[1],
    },
  };
  session["id"] = sessionID;
  session["userData"] = userData;
  //keep track of the new session:
  const newSession = new Session({
    _id: new mongoose.Types.ObjectId(),
    sessionId: sessionID,
    userData: userData,
  });
  newSession.save();
}


const loadOrCreateSession = async (user) => {
    var session = {};
const sessionOpen = await checkSessionOpen(user);
    logger.info(`check for existing sessions: ${sessionOpen}`);
    if (!sessionOpen) {
     await createSessionObject(user, session);
    } else {
      session = sessionOpen;
    }
    return session
}

async function sessionInitResponse(res,user){
const session = await loadOrCreateSession(user) 
    await setCookieHeader(res, session);
    logger.info(
      `session cookie:  ${JSON.stringify(session)}, ID: ${session.id}`
    );
    sendSuccess(res, session);

}

async function credentialCheckResponse(res,user,password){
    const hashed = user.password;
  // logger.info(hashed);
  const match = await comparePassWord(password, hashed);
if (match) {
    logger.info("the password matches !", match);
  sessionInitResponse(res,user) 
    // const sessionId = session.sessionId;
  } else {
    logger.warn("wrong password");
    const message = { message: "cannot login with this credentials" };
    failure(res, message);
  }
}

async function createSession(req, res, username, email, password) {
  logger.info("createSession controller triggered with POST at /api/login");

  const user = await User.findOne({
    $or: [{ username }, { email }],
  }).lean();
  logger.info("find user:", user);

  if (!user) {
    const message = { message: "no user associated with that name or email" };
    logger.warn(message.message);
    return notFound(res, message);
  }
    // const checkUser = email ? email : username;
  // logger.info(`checkUser: ${checkUser}`);
    await credentialCheckResponse(res,user,password)
}

async function createGoogleSession(req, res, googleData) {
  const user = await User.findOne({
    $or: [{ email: googleData.email }, { googleId: googleData.sub }],
  }).lean();
  logger.info("find user:", user);

  if (!user) {
    const message = { message: "no user associated with that email or googleId" };
    logger.warn(message.message);
    return notFound(res, message);
  }
    return await loadOrCreateSession(user)
}

module.exports = { createSession, createGoogleSession };
