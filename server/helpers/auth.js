const bcrypt = require("bcrypt")
const { SALT_ROUNDS } = require('config')
const uuid = require("uuid");


const generateSessionId = () => {
    return uuid.v4();

}

const hashPassWord = async (password) => {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPass = await bcrypt.hash(password, salt)
    return hashedPass;

};
const comparePassWord  = async (password,hashed) => {
    return await bcrypt.compare(password, hashed)
}
module.exports = {
    generateSessionId,
    hashPassWord, comparePassWord
}
