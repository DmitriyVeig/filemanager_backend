const pool = require('./db');


exports.users = async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM public.users');
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('failed');
    }
}