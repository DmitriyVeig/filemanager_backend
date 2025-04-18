const express = require('express');
const cors = require('cors');
const path = require('path');
const { logInfo } = require('./utils/logger');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger');
const UserRouter = require('./routes/users');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use(UserRouter);

app.listen(port, () => {
    logInfo(`Server running on port ${port}`);
});