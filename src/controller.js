const pool = require('./db');

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

exports.logged = async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        await pool.query(
            'UPDATE users SET logged = TRUE, last_activity = NOW() WHERE id = $1 RETURNING *',
            [userId]
        );
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        res.json({ message: 'User logged in', user: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating user', error: err.message });
    }
}

exports.user = async (req, res) => {
    const userId = parseInt(req.params.id);
    try {
        const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Error fetching user', error: err.message });
    }
}

exports.users = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM public.users');
        res.status(200).json(rows);
    } catch (err) {
        console.error(err)
        res.status(500).send({ message: 'Error fetching users', error: err.message });
    }
}