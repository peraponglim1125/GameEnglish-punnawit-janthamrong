const express = require('express');
const os = require('os');
const path = require('path');
const http = require('http');
const https = require('https');
const qrcode = require('qrcode-terminal');
const localtunnel = require('localtunnel');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Favicon handler
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Helper: Get best local IPv4 address on LAN / Wi-Fi (filters out VirtualBox, VMware, WSL, etc.)
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    const candidates = [];

    for (const [name, list] of Object.entries(interfaces)) {
        const lowerName = name.toLowerCase();

        // Ignore known virtual/loopback/container adapters
        if (
            lowerName.includes('virtual') ||
            lowerName.includes('vbox') ||
            lowerName.includes('vmware') ||
            lowerName.includes('wsl') ||
            lowerName.includes('hyper') ||
            lowerName.includes('vethernet') ||
            lowerName.includes('docker') ||
            lowerName.includes('loopback')
        ) {
            continue;
        }

        for (const iface of list) {
            if (iface.family === 'IPv4' && !iface.internal) {
                // Ignore VirtualBox standard host-only subnet (192.168.56.x) & VirtualBox MAC range (0a:00:27)
                if (iface.address.startsWith('192.168.56.') || (iface.mac && iface.mac.toLowerCase().startsWith('0a:00:27'))) {
                    continue;
                }

                const isWifi = lowerName.includes('wi-fi') || lowerName.includes('wireless') || lowerName.includes('wlan');
                candidates.push({
                    name,
                    address: iface.address,
                    isWifi
                });
            }
        }
    }

    // Prioritize Wi-Fi interfaces first
    candidates.sort((a, b) => {
        if (a.isWifi && !b.isWifi) return -1;
        if (!a.isWifi && b.isWifi) return 1;
        return 0;
    });

    if (candidates.length > 0) {
        return candidates[0].address;
    }

    // Fallback if no specific filter matched
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }

    return 'localhost';
}

function getPublicIP() {
    return new Promise((resolve) => {
        const req = https.get('https://api.ipify.org', { timeout: 3000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data.trim()));
        });
        req.on('error', () => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

async function startServer(port) {
    const server = http.createServer(app);

    server.listen(port, '0.0.0.0', async () => {
        const localIP = getLocalIP();
        const localUrl = `http://localhost:${port}`;
        const wifiUrl = `http://${localIP}:${port}`;

        let tunnelUrl = null;
        let publicIP = null;

        try {
            const [tunnel, pubIP] = await Promise.all([
                localtunnel({ port }).catch(() => null),
                getPublicIP()
            ]);
            if (tunnel && tunnel.url) {
                tunnelUrl = tunnel.url;
            }
            publicIP = pubIP;
        } catch (e) {}

        const activeQRUrl = tunnelUrl || wifiUrl;

        console.clear();
        console.log('\x1b[36m%s\x1b[0m', '==========================================================');
        console.log('\x1b[33m%s\x1b[0m', '      🎮  ENGLISH QUEST ARCADE - SERVER RUNNING  🎮       ');
        console.log('\x1b[36m%s\x1b[0m', '==========================================================');
        console.log('');
        console.log('\x1b[32m%s\x1b[0m', '  📱 สแกน QR Code ด้านล่างด้วยโทรศัพท์มือถือ เพื่อเข้าเล่นเกม:');
        if (tunnelUrl) {
            console.log('\x1b[96m%s\x1b[0m', `  🌐 ระบบสร้างลิงก์ Cloud เล่นได้ทุกเครื่อง (ทั้ง 4G/5G และ Wi-Fi)`);
        } else {
            console.log('\x1b[90m%s\x1b[0m', `  (เชื่อมต่อผ่าน IP Wi-Fi: ${localIP})`);
        }
        console.log('');

        // Generate terminal QR Code
        qrcode.generate(activeQRUrl, { small: true }, (qr) => {
            console.log(qr);
            console.log('');
            console.log('\x1b[36m%s\x1b[0m', '----------------------------------------------------------');
            console.log(`  💻 บนคอมพิวเตอร์ (Desktop) : \x1b[34m\x1b[4m${localUrl}\x1b[0m`);
            if (tunnelUrl) {
                console.log(`  🌐 ลิงก์ออนไลน์ (Cloud Link) : \x1b[32m\x1b[4m${tunnelUrl}\x1b[0m \x1b[33m(แนะนำสำหรับมือถือ)\x1b[0m`);
                if (publicIP) {
                    console.log(`     \x1b[90m(หากมีหน้าถาม Password ให้กรอก IP: ${publicIP} หรือกด Submit)\x1b[0m`);
                }
            }
            console.log(`  📶 ลิงก์วง Wi-Fi เดียวกัน    : \x1b[36m\x1b[4m${wifiUrl}\x1b[0m`);
            console.log('\x1b[36m%s\x1b[0m', '----------------------------------------------------------');
            console.log('\x1b[35m%s\x1b[0m', '  ⚡ กด Ctrl+C ใน Terminal เพื่อหยุดการทำงานของ Server');
            console.log('\x1b[36m%s\x1b[0m', '==========================================================');
        });
    });

    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`\x1b[33mPort ${port} ถูกใช้งานอยู่ กำลังสลับไปยังพอร์ต ${port + 1}...\x1b[0m`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
}

startServer(DEFAULT_PORT);
