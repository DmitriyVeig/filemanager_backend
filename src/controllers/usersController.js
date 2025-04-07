/**
 * @module UserController
 * @description Контроллер управления пользователей.
 */

const { hashPassword, comparePassword } = require("../utils/auth");
const { generateToken, verifyToken } = require("../utils/jwt");
const { sendResponse, sendErrorResponse } = require("../utils/responseHandler");
const { logInfo, logError } = require("../utils/logger");
const { callPostgresObject } = require("../db")

/**
 * @function usersCheckPassword
 * @description Проверяет соответствие введенного пароля хешу пароля в базе данных.
 * @param {string} username - Имя пользователя.
 * @param {string} password - Введенный пароль.
 * @returns {boolean} - Возвращает true, если пароль верен, иначе false.
 */
async function usersCheckPassword(username, password) {
    try {
        const user = await callPostgresObject("users_check_password", [username, password]);
        if (!user) {
            logInfo(`Wrong password or username: ${username}`);
            return false;
        }
        return true;

    } catch (err) {
        logError("Error in usersCheckPassword", err);
        return false;
    }
}

/**
 * @route POST /users/authentication
 * @group User - Операции аутентификации пользователей
 * @param {string} req.body.username.required - Имя пользователя
 * @param {string} req.body.password.required - Пароль
 * @returns {object} 200 - Успешная аутентификация
 * @returns {object} 400 - Неверный запрос (отсутствуют имя пользователя или пароль)
 * @returns {object} 401 - Неверные учетные данные
 * @returns {Error} 500 - Ошибка сервера
 */
exports.authentication = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        logInfo('Missing username or password');
        return sendResponse(res, 400, 'Missing username or password');
    }
    try {
        const correct_password = usersCheckPassword(username, password);
        if (!correct_password) {
            logInfo('Wrong username or password');
            return sendResponse(res, 401, 'Wrong username or password');
        }
        const user = { username: username, password: password };
        const token = generateToken(user);
        logInfo(`User ${username} authenticated successfully`);
        sendResponse(res, 200, 'User authenticated successfully', { token });
    } catch (err) {
        logError('Error in authentication:', err);
        sendErrorResponse(res, 500, 'Authentication error', err);
    }
};

/**
 * @function verifyToken
 * @description Middleware для проверки JWT токена.
 * @param {object} req - Объект запроса Express.
 * @param {object} res - Объект ответа Express.
 * @param {function} next - Функция next middleware.
 */
exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) {
        logInfo("No token provided");
        return res.sendStatus(401);
    }
    verifyToken(token)
        .then(user => {
            req.user = user;
            next();
        })
        .catch(err => {
            logInfo("Invalid token");
            return res.sendStatus(403);
        });
};

//
// exports.status = async (req, res) => {
//     const username = req.params.username.toString();
//     const password = req.params.password.toString();
//     try {
//         const q_user = 'SELECT * FROM users WHERE username = $1';
//         const user = await p_query(q_user, username)
//         if (!user) {
//             logInfo(`Wrong username or password`);
//             sendResponse(res, 404, 'Wrong username or password', { username, password });
//         } else {
//             const passwordMatch = await comparePassword(password, user[0].password);
//             if (!passwordMatch) {
//                 logInfo(`Wrong username or password`);
//                 sendResponse(res, 404, 'Wrong username or password', { username, password });
//             } else {
//                 logInfo(`User: ${user[0].id} status checked successfully`);
//                 sendResponse(res, 200, 'User status checked successfully', { logged: user[0].logged });
//             }
//         }
//     } catch (err) {
//         logError('Error in status:', err);
//         sendErrorResponse(res, 500, 'Error', err);
//     }
// };
//
// exports.users = async (req, res) => {
//     try {
//         const q_users = 'SELECT * FROM public.users';
//         const users = await p_query(q_users)
//         sendResponse(res, 200, 'Users get successfully', { users });
//     } catch (err) {
//         logError('Error in users:', err);
//         sendErrorResponse(res, 500, 'Error', err);
//     }
// };
//
// exports.registration = async (req, res) => {
//     const username = req.params.username.toString();
//     const password = req.params.password.toString();
//     const h_password = await hashPassword(password);
//     try {
//         const users_q = 'INSERT INTO public.users (username, password, logged, last_activity) VALUES ($1, $2, false, NOW()) ON CONFLICT (username) DO NOTHING RETURNING *;';
//         const users = await p_query(users_q, [username, h_password]);
//         if (!users) {
//             const { rows: existingUser } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
//             logInfo(`User ${existingUser[0].id} with this username: ${existingUser[0].username} already exists`);
//             sendResponse(res, 200, 'User with this username already exists', { username: existingUser[0].username });
//         } else {
//             logInfo(`User ${users[0].id} created successfully`);
//             sendResponse(res, 200, 'User created successfully', { user: users });
//         }
//     } catch (err) {
//         logError('Error in registration:', err);
//         sendErrorResponse(res, 500, 'Error', err);
//     }
// };