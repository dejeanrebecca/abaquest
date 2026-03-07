import jsonServer from 'json-server';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';

const server = jsonServer.create();

// Support external volume mounts for persistence on GCP
const dataDir = process.env.DATA_DIR || '.';
const dbPath = path.join(dataDir, 'db.json');

// If the database doesn't exist in the mounted volume yet, copy it from the built-in seed
if (!fs.existsSync(dbPath)) {
    console.log(`Database not found at ${dbPath}. Seeding it now...`);
    fs.copyFileSync('db.json', dbPath);
    console.log(`Successfully seeded database.`);
}

const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

const port = process.env.PORT || 8080;

// Set default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// To handle POST, PUT and PATCH you need to use a body-parser
server.use(jsonServer.bodyParser);

// Serve the static React build
server.use(express.static(path.join(__dirname, 'dist')));

// Mount the API on /api
server.use('/api', router);

// Catch-all to serve index.html for React Router (if using client-side routing)
server.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    }
});

server.listen(port, () => {
    console.log(`JSON Server with React static serving is running on port ${port}`);
});
