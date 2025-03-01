const fs = require('fs');
const config = require('../config');
const PASS_PHRASE = process.env.PASS_PHRASE;

const encryptionOpts = {
  key: fs.readFileSync(config.KEY),
  cert: fs.readFileSync(config.CERT),
  passphrase: PASS_PHRASE,
};

const corsOptions = {
    origin: ['http://localhost:3000','https://visio.devekla.com', 'http://192.168.133.106:3000'],
  optionsSuccessStatus: 204,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  preflightContinue: false,
  credentials: true,
};

module.exports = {
  encryptionOpts,
  corsOptions,
};
