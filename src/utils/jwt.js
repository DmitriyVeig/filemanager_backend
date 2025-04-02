const jwt = require('jsonwebtoken');
const path_env = require("path");
require('dotenv').config({ path: path_env.resolve(__dirname, '../../.env') });
const secretKey = process.env.JWT_SECRET;

function generateToken(user) {
    return jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
}

function verifyToken(token) {
    return jwt.verify(token, secretKey);
}

module.exports = { generateToken, verifyToken };