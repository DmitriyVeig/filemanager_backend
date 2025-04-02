const winston = require('winston');
const path = require('path');

const logFilePath = path.join(__dirname, '../logs/server.log');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: logFilePath }),
        new winston.transports.Console()
    ],
});

function logInfo(message) {
    logger.info(message);
}

function logError(message, error) {
    logger.error(message, { message: message, error: error }); // Добавляем сообщение и ошибку в объект
}

module.exports = { logInfo, logError };