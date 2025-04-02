const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: process.env.ELASTICSEARCH_URL
});

async function checkElasticsearchConnection() {
    try {
        await client.ping();
        console.log('Connected to Elasticsearch');
    } catch (error) {
        console.error('Error connecting to Elasticsearch:', error);
    }
}

module.exports = { client, checkElasticsearchConnection };