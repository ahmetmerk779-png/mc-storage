const express = require('express');
const app = express();
app.use(express.json());

// Botların ve ayarların tutulduğu bellek alanı
let storedData = {
    globalConfig: {},
    bots: []
};

// 🖥️ Depolama Servisinin Kendi Görsel Arayüzü (Dashboard)
app.get('/', (req, res) => {
    const botRows = storedData.bots.length > 0 
        ? storedData.bots.map(b => `
            <tr>
                <td><code>${b.id}</code></td>
                <td><b>${b.username}</b></td>
                <td>${b.host || '141.95.82.164'}:${b.port || 25565}</td>
                <td>${b.proxy || 'Otomatik / Yok'}</td>
                <td>${b.version || '1.20.1'}</td>
            </tr>
        `).join('')
        : '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 20px;">Henüz kayıtlı bot bulunmuyor.</td></tr>';

    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MC Storage - Bot Veritabanı</title>
            <style>
                body { background: #0f172a; color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; margin: 0; }
                .container { max-width: 950px; margin: 0 auto; }
                .card { background: #1e293b; padding: 25px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                h2 { color: #38bdf8; margin-top: 0; display: flex; align-items: center; gap: 10px; }
                .badge { background: #16a34a; color: #fff; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #334155; font-size: 0.9rem; }
                th { color: #94a3b8; font-weight: 600; }
                code { background: #090d16; padding: 3px 6px; border-radius: 4px; color: #38bdf8; font-size: 0.85rem; }
                .refresh-btn { background: #38bdf8; color: #0f172a; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; float: right; }
                .refresh-btn:hover { background: #7dd3fc; }
                .stats { display: flex; gap: 15px; margin-top: 15px; margin-bottom: 5px; }
                .stat-box { background: #090d16; padding: 10px 15px; border-radius: 8px; border: 1px solid #334155; font-size: 0.85rem; color: #94a3b8; }
                .stat-box b { color: #f8fafc; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <button class="refresh-btn" onclick="location.reload()">Yenile</button>
                    <h2>📦 MC Storage Veritabanı <span class="badge">Aktif</span></h2>
                    <p style="color: #94a3b8; margin-bottom: 5px;">Depolama servisindeki kayıtlı botlar ve yapılandırma listesi:</p>
                    
                    <div class="stats">
                        <div class="stat-box">Kayıtlı Bot Sayısı: <b>${storedData.bots.length}</b></div>
                        <div class="stat-box">Sunucu IP: <b>${storedData.globalConfig.host || '141.95.82.164'}</b></div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Kullanıcı Adı</th>
                                <th>Sunucu (IP:Port)</th>
                                <th>Proxy</th>
                                <th>Sürüm</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${botRows}
                        </tbody>
                    </table>
                </div>
            </div>
        </body>
        </html>
    `);
});

// Bot yöneticisinin verileri çektiği endpoint
app.get('/data', (req, res) => {
    res.json(storedData);
});

// Bot yöneticisinin güncel verileri kaydettiği endpoint
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
    console.log(`🚀 mc-storage API ve Arayüzü ${PORT} portunda aktif.`);
});
