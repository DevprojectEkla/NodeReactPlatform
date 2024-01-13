const { mongoose } = require("mongoose");
const { generateSessionId,hashPassWord, comparePassWord } = require("../helpers/auth");
const User = require("../models/User");
const {
    sendSuccess,
  failure,
  collectRequestData,
  parseMultiPartDataIntoKeyValue,
  hashData,
} = require("../helpers/manipulateData");
async function getUsers(req, res) {
  return await User.find({}).lean();
}

const getHashed = async (email) => {
  const users = await getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email) {

      console.log("the email match this user:", users[i]);
      return users[i].password;
    }
  }
  return null;
};

async function createSession(req, res) {
    
    const session = {};
  console.log("createSession controller triggered with POST at /api/login");
  try {
    collectRequestData(req, async (data) => {
      const { email, password } = JSON.parse(data);
      console.log(email, password);
        const user = await User.findOne({email}).lean()
      const hashed = user.password;
      // console.log(hashed);
      const match = await comparePassWord(password, hashed);

      if (match) {
        console.log("the password matches !", match);
          const sessionID = generateSessionId();
          session[sessionID] = {userId: user._id, email: user.email}
          console.log(session)
          sendSuccess(res,session)
      } else {
        console.log("wrong password");
          const message = {message: "cannot login with this credentials"}
          failure(res,message)
      }
    });
  } catch (error) {
    console.log("cannot create a session:", error);
  }
}
async function createAccount(req, res) {
  try {
    collectRequestData(req, async (data) => {
      const { username, email, password, quote, filename, type, content } =
        parseMultiPartDataIntoKeyValue(data);
      const hashName = hashData(content);
      const hashPass = await hashPassWord(password);
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

      newAccount.save();
      console.log("new user registered:", newAccount);
    });

    console.log("Account successfully created for /api/subscribe");
  } catch (error) {
    console.log("Server Error while trying to create a new Account:", error);
    const data = { message: `Failed to create an Account ${error}` };
    failure(res, JSON.stringify(data));
  }
}

async function loginUser(req, res) {
  console.log("trying to log in");
}

module.exports = { createSession, createAccount };
