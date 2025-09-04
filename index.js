import { createServer } from 'http';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

const server = createServer(async (req, res) => {
    // remove leading slash
    let reqPath = req.url.startsWith('/') ? req.url.slice(1) : req.url;

    // default to index.html
    if (reqPath === '') reqPath = 'index.html';

    const filePath = path.join(__dirname, 'public', reqPath);

    try {
        const data = await readFile(filePath);

        // determine content type
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'text/html';
        if (ext === '.js') contentType = 'text/javascript'; // <--- critical for ES modules
        if (ext === '.css') contentType = 'text/css';
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    } catch (err) {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
