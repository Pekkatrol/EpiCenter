"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyMicrosoftToken = verifyMicrosoftToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const client = (0, jwks_rsa_1.default)({
    jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
});
function getKey(header, callback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err)
            return callback(err);
        callback(null, key?.getPublicKey());
    });
}
function verifyMicrosoftToken(idToken) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(idToken, getKey, { audience: process.env.MS_CLIENT_ID, algorithms: ['RS256'] }, (err, decoded) => (err ? reject(err) : resolve(decoded)));
    });
}
