const express = require('express');
const app = express();
const port = process.env.PORT || 8080;

console.log('!!! MINIMAL SERVER STARTING !!! v4');

app.get('/health', (req, res) => {
    res.send('MINIMAL-V4-ALIVE');
});

app.get('*', (req, res) => {
    res.send('MINIMAL-V4-CATCHALL');
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Minimal server listening on port ${port}`);
});
