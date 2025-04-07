const { logError } = require('./logger');

function sendResponse(res, statusCode, message, data = {}) {
    res.status(statusCode).json({ message, ...data });
}

function sendErrorResponse(res, statusCode, message, error) {
    logError(message, error);
    res.status(statusCode).json({ message, error: error.message });
}

module.exports = { sendResponse, sendErrorResponse };
