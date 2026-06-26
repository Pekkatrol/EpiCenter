import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
});

function getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback): void {
  client.getSigningKey(header.kid as string, (err, key) => {
    if (err) return callback(err);
    callback(null, key?.getPublicKey());
  });
}

export function verifyMicrosoftToken(idToken: string): Promise<jwt.JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      { audience: process.env.MS_CLIENT_ID, algorithms: ['RS256'] },
      (err, decoded) => (err ? reject(err) : resolve(decoded as jwt.JwtPayload))
    );
  });
}