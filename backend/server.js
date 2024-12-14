import http from 'http';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';
import querystring from 'querystring';
import client from './db.js';

const PORT = process.env.PORT || 8000;
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MIME types for different file types
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
    const parseUrl = url.parse(req.url, true);

    if (req.method === 'GET' && parseUrl.pathname === '/') {
        try {
            const data = await fs.readFile(path.join(__dirname, 'public', 'index.html'), 'utf-8');

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error reading index.html');
        }
    } else if (req.method === 'POST' && parseUrl.pathname === '/submit') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', async () => {
            const formData = querystring.parse(body);

            const { fullName, cni, email, phone, healthProblem, doctor, city, age, gender } = formData;

            const createdAt = new Date();
            const updatedAt = new Date();

            const query = `
            INSERT INTO "Patients" ("fullName", "cni", "email", "phoneNumber", "healthProblem", "doctorName", "city", "age", "gender", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            `;
            const values = [fullName, cni, email, phone, healthProblem, doctor, city, age, gender, createdAt, updatedAt];
                    try {
                await client.query(query, values);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Patient successfully registered!');
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error saving data: ' + err.message);
            }
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
