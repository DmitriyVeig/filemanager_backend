const path_env = require('path');
const express = require('express')
const { Pool } = require('pg');
const app = express()
require('dotenv').config({ path: path_env.resolve(__dirname, '../.env') }); // Абсолютный путь
const port = process.env.PORT;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/users', async (req, res) => {
    try {
        const query = 'SELECT * FROM public.users';
        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('failed');
    }
});

app.listen(port, () => {
    console.log(`Server running ${port}`)
})