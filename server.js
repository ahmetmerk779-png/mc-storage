const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Basit CORS desteği (servisler arası sorunsuz haberleşme için)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Verilerin kalıcı olarak saklandığı JSON dosyası
const DATA_FILE = path.join(__dirname, 'storage_data.json');

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

function writeStorage(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error('Veri yazma hatası:', e);
    }
}

// GET: Belirli bir sitenin/servisin verilerini çekme
app.get('/data/:siteKey', (req, res) => {
    const siteKey = req.params.siteKey;
    const storage = readStorage();
    const siteData = storage[siteKey] || {
        globalConfig: {},
        bots: []
    };
    res.json(siteData);
});

// POST: Belirli bir sitenin/servisin verilerini kaydetme (Sildiğin botlar anında güncellenir ve geri gelmez)
app.post('/data/:siteKey', (req, res) => {
    const siteKey = req.params.siteKey;
    const { globalConfig, bots } = req.body;
    
    const storage = readStorage();
    storage[siteKey] = {
        globalConfig: globalConfig || {},
        bots: Array.isArray(bots) ? bots : [],
        updatedAt: Date.now()
    };
    
    writeStorage(storage);
    res.json({ success: true, siteKey, botCount: (bots || []).length });
});

// Sağlık kontrolü
app.get('/', (req, res) => {
    res.send('🚀 MC-Storage Depolama Servisi Aktif ve Çalışıyor!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`📦 MC-Storage Sunucusu ${PORT} portunda başlatıldı.`);
});
