const jsonServer = require('json-server');
const path = require('path');
const express = require('express');
const fs = require('fs');

// Log everything for Cloud Run debugging
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err.stack || err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

console.log('Server process starting... v5-PRODUCTION');

const server = jsonServer.create();

// Support external volume mounts for persistence on GCP
const dataDir = process.env.DATA_DIR || '.';
const dbPath = path.join(dataDir, 'db.json');

console.log(`Starting server in ${__dirname}`);
console.log(`Database target path: ${dbPath}`);

// If the database doesn't exist in the mounted volume yet, copy it from the built-in seed
if (!fs.existsSync(dbPath)) {
    console.log(`Database not found at ${dbPath}. Seeding it now...`);
    try {
        if (dataDir !== '.') {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.copyFileSync('db.json', dbPath);
        console.log(`Successfully seeded database.`);
    } catch (err) {
        console.error(`Error seeding database: ${err.message}`);
    }
}

// 1. Health check - absolute priority
server.get('/health', (req, res) => {
    console.log('Health check requested');
    res.json({ 
        status: 'ok', 
        engine: 'json-server-0.17.4-v6',
        db: dbPath,
        time: new Date().toISOString()
    });
});

const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080;

server.set('query parser', 'extended');

// 2. API Routes - mount before static catch-all
server.use('/api', router);

// 3. Body Parser for POST/PUT
server.use(jsonServer.bodyParser);

// 4. Default middlewares (logger, cors, etc.)
server.use(middlewares);

// 5. Serve static files
server.use(express.static(path.join(__dirname, 'build')));

// Catch-all to serve index.html for React Router
server.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    }
});

server.listen(port, '0.0.0.0', () => {
    console.log(`JSON Server with React static serving is running on port ${port}`);
    console.log(`Server is ready to handle requests.`);
});
