Punnawit janthamrong 6611507168  Major:Multimedia and E-Sports  Chandrakasem Rajabhat University
# 🎮 English Quiz Adventure

เกมตอบคำถามภาษาอังกฤษแบบ Interactive รองรับ 3 ระดับความยาก (พื้นฐาน, ปานกลาง, สูงสุด) พร้อมระบบเสียง Web Audio API, การอ่านออกเสียงคำศัพท์ Native TTS และ Terminal QR Code สำหรับสแกนเล่นผ่านสมาร์ตโฟนได้ทันที

---

## ✨ จุดเด่นและฟีเจอร์ของเกม
1. **3 ระดับความยาก (30 ด่าน):**
   - 🌱 **1. พื้นฐาน (Basic):** เติมตัวอักษรที่ขาดหายไป คำศัพท์พื้นฐาน A1-A2 พร้อมคำใบ้ภาษาไทย
   - ⚡ **2. ปานกลาง (Intermediate):** ไวยากรณ์ (Grammar), Tenses, คำบุพบท, การเรียงประโยค
   - 🔥 **3. สูงสุด (Advanced / Master):** สำนวน (Idioms), Phrasal Verbs, การตรวจแก้ประโยค (Error Correction)
2. **ระบบการเล่น (Gameplay Mechanics):**
   - พิมพ์คำตอบแล้วกด `Enter` หรือกดปุ่ม `ส่งคำตอบ`
   - ระบบ Combo Streak โบนัสคะแนนเมื่อตอบถูกต่อเนื่อง
   - ระบบหัวใจ (3 พลังชีวิต) ❤️
   - ปุ่ม 💡 คำใบ้ และปุ่ม 🔊 ฟังเสียงอ่านภาษาอังกฤษมาตรฐาน (Web Speech TTS)
   - เอฟเฟกต์พลุ Confetti และเสียงประกอบเชิงฟิสิกส์ (Web Audio API)
   - ปลดล็อกด่านอัตโนมัติ และบันทึกคะแนนลง LocalStorage
3. **ระบบรันผ่าน Terminal & สแกน QR Code:**
   - เมื่อรัน `npm start` จะแสดง **QR Code** ในหน้าต่าง Terminal ทันที
   - สามารถนำโทรศัพท์มือถือที่ต่อ Wi-Fi เดียวกันมาสแกนเพื่อเปิดเล่นบนมือถือได้ทันที

---

## 🚀 วิธีการติดตั้งและรันเกม

### 1. ติดตั้ง Dependencies (ทำเพียงครั้งแรก)
```bash
npm install
```

### 2. รันเซิร์ฟเวอร์และแสดง QR Code
```bash
npm start
```

### 3. เข้าเล่นเกม:
- **บนคอมพิวเตอร์:** เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`
- **บนมือถือ / แท็บเล็ต:** สแกน QR Code ที่ปรากฏใน Terminal ด้วยกล้องมือถือ

---

## 📁 โครงสร้างโปรเจกต์
```
├── package.json          # Node.js dependencies (express, qrcode-terminal)
├── server.js             # Express Server + IP Detection + Terminal QR Code generator
└── public/
    ├── index.html        # หน้าจอหลักของเกม (Glassmorphism & Cyber Theme)
    ├── css/
    │   └── style.css     # ดีไซน์และอนิเมชัน Responsive
    └── js/
        ├── audio.js      # Web Audio API Synth + Web Speech API (TTS)
        ├── questions.js  # ฐานข้อมูลโจทย์คำถามทั้ง 3 ระดับ (30 ด่าน)
        └── game.js       # Game Engine ควบคุมด่าน, คอมโบ, หัวใจ และบันทึกคะแนน
```
