const pool = require('../db');
const {hashPassword, comparePassword} = require("../utils/auth");

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
            console.log(`User ${userId} logged out due to inactivity.`);
            return next();
        }
        await pool.query(
            'UPDATE users SET last_activity = NOW() WHERE id = $1',
            [userId]
        );
        next();
    } catch (err) {
        console.error("Error in checkUserActivity:", err);
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
            console.log(`Wrong username or password`);
            res.status(404).json({ message: 'Wrong username or password', username: username, password: password });
        }
        else {
            const passwordMatch = await comparePassword(password, user.password);
            if (!passwordMatch) {
                console.log(`Invalid username or password {$username}`);
                res.status(404).json({ message: 'Invalid username or password', username: username, password: password });
            }
            else {
                console.log(`User: ${user.id} logged in successfully`);
                res.status(200).json({message: 'User logged in successfully', username: user.id});
            }
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error', error: err.message });
    }
}

exports.status = async (req, res) => {
    const username = req.params.username.toString();
    const password = req.params.password.toString();
    try {
        const q_user = 'SELECT * FROM users WHERE username = $1';
        const user = await p_query(q_user, username)
        if (!user) {
            console.log(`Wrong username or password`);
            res.status(404).json({ message: 'Wrong username or password', username: username, password: password });
        }
        else {
            const passwordMatch = await comparePassword(password, user.password);
            if (!passwordMatch) {
                console.log(`Wrong username or password`);
                res.status(404).json({ message: 'Wrong username or password', username: username, password: password });
            }
            else {
                console.log(`User: ${user.id} status checked successfully`);
                res.status(200).json({message: 'User status checked successfully', logged: user.logged});
            }
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error', error: err.message });
    }
}

exports.users = async (req, res) => {
    try {
        const q_users = 'SELECT * FROM public.users';
        const users = await p_query(q_users)
        res.status(200).json({ message: 'Users get successfully', users: users});
    } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'Error', error: err.message });
    }
}

exports.registration = async (req, res) => {
    const username = req.params.username.toString();
    const password = req.params.password.toString();
    const h_password = await hashPassword(password);
    try {
        const users_q = 'INSERT INTO public.users (username, password, logged, last_activity) VALUES ($1, $2, false, NOW()) ON CONFLICT (username) DO NOTHING RETURNING *;'
        const users = p_query(users_q, [username, h_password]);
        if (!users) {
            const { rows: existingUser } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            console.log(`User ${existingUser[0].id} with this username: ${existingUser[0].username} already exists`);
            res.status(200).json({ message: 'User with this username alr   eady exists', username: existingUser[0].username });
        } else {
            console.log(`User ${rows[0].id} created successfully`);
            res.status(200).json({ message: 'User created successfully', user: rows });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error', error: err.message });
    }
};