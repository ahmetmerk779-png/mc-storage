const express = require('express');
const app = express();
app.use(express.json());

let storedData = {
    globalConfig: {},
    bots: []
};

// Verileri alma endpoint'i
app.get('/data', (req, res) => {
    res.json(storedData);
});

// Verileri kaydetme endpoint'i
app.post('/data', (req, res) => {
    if (req.body) {
        storedData = req.body;
        res.json({ success: true });
    } else {
        res.status(400).json({ error: 'Geçersiz veri' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Depolama API'si ${PORT} portunda aktif.`);
});
