const path_env = require('path');
const express = require('express')
const UserRouter = require('./routes/users')
const app = express()
require('dotenv').config({ path: path_env.resolve(__dirname, '../.env') }); // Абсолютный путь
const port = process.env.PORT;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('<div>' +
        '<p>Main Page<p>' +
        '<p><a href="/users">/users</a> (id, username, password)</p>' +
        '</div>');
});

app.use('/users', UserRouter);

app.listen(port, () => {
    console.log(`Server running ${port}`)
})