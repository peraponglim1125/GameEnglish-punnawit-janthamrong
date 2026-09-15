const express = require('express');
const os = require('os');
const path = require('path');
const http = require('http');
const qrcode = require('qrcode-terminal');

const app = express();
const DEFAULT_PORT = parseInt(process.env.PORT || '3000', 10);

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Helper: Get local IPv4 address on LAN / Wi-Fi
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                // Prefer 192.168.x or 10.x networks if available
                if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
                    return iface.address;
                }
            }
        }
    }
    // Fallback to any non-internal IPv4
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

function startServer(port) {
    const server = http.createServer(app);

    server.listen(port, '0.0.0.0', () => {
        const localIP = getLocalIP();
        const localUrl = `http://localhost:${port}`;
        const networkUrl = `http://${localIP}:${port}`;

        console.clear();
        console.log('\x1b[36m%s\x1b[0m', '==========================================================');
        console.log('\x1b[33m%s\x1b[0m', '      🎮  ENGLISH QUIZ ADVENTURE - SERVER STARTED  🎮      ');
        console.log('\x1b[36m%s\x1b[0m', '==========================================================');
        console.log('');
        console.log('\x1b[32m%s\x1b[0m', '  📱 สแกน QR Code ด้านล่างด้วยโทรศัพท์มือถือ เพื่อเริ่มเล่นเกมได้ทันที:');
        console.log('\x1b[90m%s\x1b[0m', '  (โทรศัพท์และคอมพิวเตอร์ต้องเชื่อมต่อ Wi-Fi เดียวกัน)');
        console.log('');

        // Generate terminal QR Code
        qrcode.generate(networkUrl, { small: true }, (qr) => {
            console.log(qr);
            console.log('');
            console.log('\x1b[36m%s\x1b[0m', '----------------------------------------------------------');
            console.log(`  💻 Desktop Browser : \x1b[34m\x1b[4m${localUrl}\x1b[0m`);
            console.log(`  📱 Mobile / Network: \x1b[32m\x1b[4m${networkUrl}\x1b[0m`);
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
