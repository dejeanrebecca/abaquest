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

const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 8080;

server.set('query parser', 'extended');
server.use(middlewares);

server.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        engine: 'json-server-0.17.4',
        db: dbPath,
        time: new Date().toISOString()
    });
});

server.use(jsonServer.bodyParser);

// Serve the static React build
// Ensure it's mounted before the router to prioritize actual static assets
server.use(express.static(path.join(__dirname, 'build')));

// Mount the API on /api
server.use('/api', router);

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
