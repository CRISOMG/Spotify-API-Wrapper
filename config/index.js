require('dotenv').config();

const config = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,
  code: process.env.CODE,
};

module.exports = config;
