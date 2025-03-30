const pool = require('../db');

const sessionTimeout = 60000;

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

exports.userLogging = async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        await pool.query(
            'UPDATE users SET logged = TRUE, last_activity = NOW() WHERE id = $1 RETURNING *',
            [userId]
        );
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (rows.length === 0) {
            console.log(`Trying to log in user with unexpected id: ${userId}`);
            res.status(404).json({ message: 'Trying to log in user with unexpected id', id : userId });
        }
        else {
            console.log(`User: ${userId} logged in successfully`);
            res.status(200).json({message: 'User logged in successfully', id : userId, logged: rows[0].logged});
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error', error: err.message });
    }
}

exports.userLogged = async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        if (rows.length === 0) {
            console.log(`Trying to check user log in status with unexpected id: ${userId}`);
            res.status(404).json({message: 'Trying to check user log in status with unexpected id', id: userId});
        }
        else {
            console.log(`User: ${userId} log in status checked successfully`);
            res.status(200).json({message: 'User log in status checked successfully', id: userId, logged: rows[0].logged});
        }
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error', error: err.message });
    }
}

exports.users = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM public.users');
        res.status(200).json({ message: 'Users get successfully', users: rows});
    } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'Error', error: err.message });
    }
}

exports.createUser = async (req, res) => {
    const userLogin = req.params.username.toString();
    const userPassword = req.params.password.toString();
    try {
        const { rows } = await pool.query(
            `INSERT INTO public.users (username, password, logged, last_activity)
             VALUES ($1, $2, false, NOW())
             ON CONFLICT (username) DO NOTHING
             RETURNING *;`,
            [userLogin, userPassword]
        );
        if (rows.length === 0) {
            const { rows: existingUser } = await pool.query('SELECT * FROM users WHERE username = $1', [userLogin]);
            console.log(`User ${existingUser[0].id} with this username: ${existingUser[0].username} already exists`);
            res.status(200).json({ message: 'User with this username already exists', username: existingUser[0].username });
        } else {
            console.log(`User ${rows[0].id} created successfully`);
            res.status(200).json({ message: 'User created successfully', user: rows });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error', error: err.message });
    }
};