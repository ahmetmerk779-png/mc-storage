const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());

// Depolanan veriler (Botlar, loglar, ayarlar burada tutulur ve izlenir)
let storedData = {
    globalConfig: {},
    bots: [] // Her botun durumu, logları ve envanter bilgisi burada saklanır
};

// 🖥️ DEPOLAMA VE İZLEME PANELİ (Arayüz)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MC Storage & Bot Monitor Hub</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css">
            <script src="/socket.io/socket.io.js"></script>
            <style>
                :root { --bg-dark: #0f172a; --card-bg: #1e293b; --accent-color: #38bdf8; --border-color: #334155; --text-main: #f8fafc; --text-muted: #94a3b8; }
                body { background-color: var(--bg-dark); color: var(--text-main); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding-bottom: 30px; }
                .navbar { background-color: var(--card-bg); border-bottom: 1px solid var(--border-color); }
                .card { background-color: var(--card-bg); border: 1px solid var(--border-color); color: var(--text-main); border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
                .status-badge { font-size: 0.8rem; padding: 4px 8px; border-radius: 20px; font-weight: 600; }
                .status-online { background-color: #16a34a; color: #fff; }
                .status-connecting { background-color: #ca8a04; color: #fff; }
                .status-offline { background-color: #dc2626; color: #fff; }
                .terminal-box { background-color: #090d16; border: 1px solid var(--border-color); border-radius: 8px; height: 220px; overflow-y: auto; font-family: 'Courier New', Courier, monospace; font-size: 0.82rem; padding: 10px; color: #38bdf8; }
                .log-entry { margin-bottom: 3px; line-height: 1.3; }
                .log-info { color: #94a3b8; } .log-success { color: #4ade80; } .log-warn { color: #facc15; } .log-error { color: #f87171; } .log-chat { color: #e2e8f0; }
            </style>
        </head>
        <body>
            <nav class="navbar navbar-expand-lg sticky-top mb-4">
                <div class="container-fluid px-4">
                    <a class="navbar-brand text-light fw-bold" href="#">
                        <i class="bi bi-hdd-stack me-2 text-info"></i>MC Storage & Monitor Center
                    </a>
                    <span class="text-muted">Kayıtlı Bot Sayısı: <b id="botCount" class="text-info">${storedData.bots.length}</b></span>
                </div>
            </nav>

            <div class="container-fluid px-4">
                <div class="row g-4" id="monitorCardsContainer">
                    <!-- Botlar dinamik yüklenecek -->
                </div>
            </div>

            <script>
                const socket = io();

                socket.on('init-storage', (data) => {
                    renderDashboard(data.bots);
                });

                socket.on('data-updated', (data) => {
                    renderDashboard(data.bots);
                    document.getElementById('botCount').innerText = data.bots.length;
                });

                function renderDashboard(bots) {
                    const container = document.getElementById('monitorCardsContainer');
                    container.innerHTML = '';

                    if (!bots || bots.length === 0) {
                        container.innerHTML = '<div class="col-12 text-center text-muted py-5">Henüz depoda kayıtlı bot bulunmuyor.</div>';
                        return;
                    }

                    bots.forEach(bot => {
                        const col = document.createElement('div');
                        col.className = 'col-lg-6 col-xl-4';
                        const statusClass = bot.status === 'Online' ? 'status-online' : (bot.status === 'Connecting' ? 'status-connecting' : 'status-offline');
                        
                        let logsHtml = '';
                        if (bot.logs && bot.logs.length > 0) {
                            logsHtml = bot.logs.map(l => `<div class="log-entry log-${l.type || 'info'}">[${l.timestamp}] ${l.text}</div>`).join('');
                        } else {
                            logsHtml = '<div class="text-muted">Henüz log yok...</div>';
                        }

                        col.innerHTML = \`
                            <div class="card h-100 p-3">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div class="d-flex align-items-center gap-2">
                                        <i class="bi bi-robot fs-4 text-info"></i>
                                        <div>
                                            <h6 class="mb-0 fw-bold">\${bot.username}</h6>
                                            <small class="text-muted">\${bot.host || '141.95.82.164'}:\${bot.port || 25565}</small>
                                        </div>
                                    </div>
                                    <span class="status-badge \${statusClass}">\${bot.status || 'Offline'}</span>
                                </div>
                                <label class="text-muted small mb-1"><i class="bi bi-terminal me-1"></i>Canlı Terminal & Loglar</label>
                                <div class="terminal-box">\${logsHtml}</div>
                            </div>
                        \`;
                        container.appendChild(col);
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// Bot Yöneticisinin verileri çektiği endpoint
app.get('/data', (req, res) => {
    res.json(storedData);
});

// Bot Yöneticisinin verileri güncellediği / logları aktardığı endpoint
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
