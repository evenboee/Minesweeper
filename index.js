// Simple web server to serve static assets
const express = require('express');
const path = require('path')
const app = express();
app.use(express.static('./'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

const PORT = process.env.PORT || 80;
app.listen(PORT, ()=>console.log(`Listening on port ${PORT}`));
