const jwt = require('jsonwebtoken');
const path_env = require("path");
require('dotenv').config({ path: path_env.resolve(__dirname, '../../.env') });
const secretKey = process.env.JWT_SECRET;
function generateToken(user) {
    return new Promise((resolve, reject) => {
        jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '30s' }, (err, token) => {
            if (err) {
                console.error("JWT signing error:", err);
                return reject(err);
            }
            resolve(token);
        });
    });
}
function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                console.error("JWT verification error:", err);
                return reject(err);
            }
            resolve(decoded);
        });
    });
}
module.exports = { generateToken, verifyToken };
