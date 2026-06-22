const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    callback(null, key.getPublicKey());
  });
}

function verifyMicrosoftToken(idToken) {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      { audience: process.env.MS_CLIENT_ID, algorithms: ['RS256'] },
      (err, decoded) => (err ? reject(err) : resolve(decoded))
    );
  });
}

module.exports = { verifyMicrosoftToken };