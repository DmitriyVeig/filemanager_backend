const path_env = require('path');
const cors = require('cors');
const express = require('express')
const UserRouter = require('./routes/users')
const app = express()
require('dotenv').config({ path: path_env.resolve(__dirname, '../.env') }); // Абсолютный путь
const port = process.env.PORT;

app.use(cors());

app.use(UserRouter);

app.listen(port, () => {
    console.log(`Server running ${port}`)
})