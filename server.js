const express = require('express');
const server = express();
const port = 3001;

// Определение маршрута для корневого URL
server.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Запуск сервера
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});