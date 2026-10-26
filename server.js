const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Verilerin kalıcı olması için sunucu dizininde bir JSON dosyası
const DATA_FILE = path.join(__dirname, 'storage_data.json');

// Depolama dosyasını okuma fonksiyonu
function readStorage() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const raw = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(raw);
        }
    } catch (e) {
        console.error('Veri okuma hatası:', e);
    }
    return {};
}

// Depolama dosyasına yazma fonksiyonu
function writeStorage(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Veri yazma hatası:', e);
    }
}

// GET: Belirli bir site anahtarına (siteKey) ait bot ve konfigürasyon verisini çekme
app.get('/data/:siteKey', (req, res) => {
    const siteKey = req.params.siteKey;
    const storage = readStorage();
    const siteData = storage[siteKey] || {
        globalConfig: {},
        bots: []
    };
    res.json(siteData);
});

// POST: Belirli bir site anahtarına (siteKey) ait bot ve konfigürasyon verisini kaydetme
app.post('/data/:siteKey', (req, res) => {
    const siteKey = req.params.siteKey;
    const { globalConfig, bots } = req.body;
    
    const storage = readStorage();
    storage[siteKey] = {
        globalConfig: globalConfig || {},
        bots: bots || [],
        updatedAt: Date.now()
    };
    
    writeStorage(storage);
    res.json({ success: true, siteKey, botCount: (bots || []).length });
});

// Sağlık kontrolü (Health check)
app.get('/', (req, res) => {
    res.send('🚀 MC-Storage Merkezi Depolama Servisi Aktif!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`📦 MC-Storage Sunucusu ${PORT} portunda başlatıldı.`);
});
