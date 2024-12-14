import http from 'http';
import fs from 'fs/promises';
import url from 'url';
import path from 'path';



const PORT = process.env.PORT || 8000;
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


//MIME types for different file types
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


const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Server is running!');
});




server.listen(PORT, () => {
    console.log(`Server runninng on port ${PORT}`);
})