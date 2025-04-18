const { logError } = require("./logger")
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function hashPassword(password) {
    try {
        return await bcrypt.hash(password, saltRounds);
    } catch (error) {
        logError("Error hashing password:", error);
        throw error;
    }
}

async function comparePassword(password, hashedPassword) {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (error) {
        logError("Error comparing password:", error);
        throw error;
    }
}

module.exports = { hashPassword, comparePassword };