const { Pool } = require('pg');
const { logError } = require('./utils/logger');
const path_env = require("path");
require('dotenv').config({ path: path_env.resolve(__dirname, '../.env') });
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
async function callPostgresObject(objectName, args = []) {
    try {
        const objectTypeQuery = `
            SELECT prokind
            FROM pg_proc
            WHERE proname = $1;
        `;
        const objectTypeResult = await pool.query(objectTypeQuery, [objectName]);
        const objectType = objectTypeResult.rows[0]?.prokind;
        if (!objectType) {
            const errorMessage = `Object "${objectName}" not found in PostgreSQL.`;
            logError(errorMessage);
        }
        let query, result;
        if (objectType === 'f') {
            const argPlaceholders = args.map((_, index) => `$${index + 1}`).join(', ');
            query = `SELECT * FROM ${objectName}(${argPlaceholders})`; // Выбираем все столбцы
            result = await pool.query(query, args);
            if (result.rows.length > 0) {
                return result.rows[0];
            } else {
                return null;
            }
        } else if (objectType === 'p') {
            const argPlaceholders = args.map((_, index) => `$${index + 1}`).join(', ');
            query = `CALL ${objectName}(${argPlaceholders})`;
            await pool.query(query, args);
            return undefined;
        } else {
            const errorMessage = `Unsupported object type for "${objectName}".`;
            logError(errorMessage);
        }
    } catch (error) {
        logError('Error calling PostgreSQL object:', error, error.stack);
        throw error;
    }
}
module.exports = { callPostgresObject };