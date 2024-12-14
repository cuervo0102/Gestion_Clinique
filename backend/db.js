import pkg from 'pg';
import dotenv from 'dotenv';


dotenv.config();

const { Client } = pkg;

const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

client.connect()
    .then(() => {
        console.log('Connected to Postgres');
    })
    .catch((err) => {
        console.log('Connection error', err.stack);
        client.end();
    });

export  default client ;