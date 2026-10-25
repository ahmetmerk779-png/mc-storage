const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let storedData = {
    globalConfig: {},
    bots: []
};

// Verileri alma endpoint'i
app.get('/data', (req, res) => {
    res.json(storedData);
});

// Bot yöneticisinin verileri güncellediği / logları aktardığı endpoint
app.post('/data', (req, res) => {
    if (req.body) {
        storedData = req.body;
        res.json({ success: true });
        // Tarayıcıdan izleyen varsa ekrandakileri anında güncelle
        io.emit('data-updated', storedData);
    } else {
        res.status(400).json({ error: 'Geçersiz veri' });
    }
});

io.on('connection', (socket) => {
    socket.emit('init-storage', storedData);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 mc-storage ve İzleme Paneli ${PORT} portunda aktif.`);
});
