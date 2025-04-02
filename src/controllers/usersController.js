const pool = require('../db');
const { hashPassword, comparePassword } = require("../utils/auth");
const { generateToken } = require("../utils/jwt");
const { sendResponse, sendErrorResponse } = require("../utils/responseHandler");
const { logInfo, logError } = require("../utils/logger");
const { client } = require('../utils/elasticsearch');

const sessionTimeout = 60000;

async function p_query(query, value) {
    const { rows } = await pool.query(query, value);
    if (rows.length === 0)
        return null;
    return rows;
}

exports.checkUserActivity = async (req, res, next) => {
    const userId = parseInt(req.params.id);
    try {
        const result = await pool.query(
            'SELECT last_activity, logged FROM users WHERE id = $1',
            [userId]
        );
        if (result.rows.length === 0) {
            return next();
        }
        const { last_activity, logged } = result.rows[0];
        if (!logged) {
            return next();
        }
        const lastActivity = new Date(last_activity);
        const now = new Date();
        const timeSinceLastActivity = now - lastActivity;
        if (timeSinceLastActivity > sessionTimeout) {
            await pool.query('UPDATE users SET logged = FALSE WHERE id = $1', [userId]);
            logInfo(`User ${userId} logged out due to inactivity.`);
            return next();
        }
        await pool.query(
            'UPDATE users SET last_activity = NOW() WHERE id = $1',
            [userId]
        );
        next();
    } catch (err) {
        logError("Error in checkUserActivity:", err);
        return next();
    }
};

exports.authentication = async (req, res) => {
    const username = req.params.username.toString();
    const password = req.params.password.toString();
    try {
        const q_user = 'SELECT * FROM users WHERE username = $1';
        const user = await p_query(q_user, [username])
        if (!user) {
            logInfo(`Wrong username or password`);
            sendResponse(res, 404, 'Wrong username or password', { username, password });
        } else {
            const passwordMatch = await comparePassword(password, user[0].password);
            if (!passwordMatch) {
                logInfo(`Invalid username or password {$username}`);
                sendResponse(res, 404, 'Invalid username or password', { username, password });
            } else {
                const token = generateToken(user[0]);
                logInfo(`User: ${user[0].id} logged in successfully`);
                sendResponse(res, 200, 'User logged in successfully', { token });
            }
        }
    } catch (err) {
        logError('Error in authentication:', err);
        sendErrorResponse(res, 500, 'Error', err);
    }
};

exports.status = async (req, res) => {
    const username = req.params.username.toString();
    const password = req.params.password.toString();
    try {
        const q_user = 'SELECT * FROM users WHERE username = $1';
        const user = await p_query(q_user, username)
        if (!user) {
            logInfo(`Wrong username or password`);
            sendResponse(res, 404, 'Wrong username or password', { username, password });
        } else {
            const passwordMatch = await comparePassword(password, user[0].password);
            if (!passwordMatch) {
                logInfo(`Wrong username or password`);
                sendResponse(res, 404, 'Wrong username or password', { username, password });
            } else {
                logInfo(`User: ${user[0].id} status checked successfully`);
                sendResponse(res, 200, 'User status checked successfully', { logged: user[0].logged });
            }
        }
    } catch (err) {
        logError('Error in status:', err);
        sendErrorResponse(res, 500, 'Error', err);
    }
};

exports.users = async (req, res) => {
    try {
        const q_users = 'SELECT * FROM public.users';
        const users = await p_query(q_users)
        sendResponse(res, 200, 'Users get successfully', { users });
    } catch (err) {
        logError('Error in users:', err);
        sendErrorResponse(res, 500, 'Error', err);
    }
};

exports.registration = async (req, res) => {
    const username = req.params.username.toString();
    const password = req.params.password.toString();
    const h_password = await hashPassword(password);
    try {
        const users_q = 'INSERT INTO public.users (username, password, logged, last_activity) VALUES ($1, $2, false, NOW()) ON CONFLICT (username) DO NOTHING RETURNING *;';
        const users = await p_query(users_q, [username, h_password]);
        if (!users) {
            const { rows: existingUser } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            logInfo(`User ${existingUser[0].id} with this username: ${existingUser[0].username} already exists`);
            sendResponse(res, 200, 'User with this username already exists', { username: existingUser[0].username });
        } else {
            logInfo(`User ${users[0].id} created successfully`);
            sendResponse(res, 200, 'User created successfully', { user: users });
        }
    } catch (err) {
        logError('Error in registration:', err);
        sendErrorResponse(res, 500, 'Error', err);
    }
};