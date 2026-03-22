const UserController = require('./controllers/UserController');
const UserAuthenController = require('./controllers/UserAuthenController');
const HealthLogController = require('./controllers/HealthLogController');
const SlipLogController = require('./controllers/SlipLogController'); // ดึงประวัติสลิป [cite: 509]
const { User } = require('./models');

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// [Senior Trick] จัดการโฟลเดอร์เก็บไฟล์ [cite: 462, 1020]
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// ตั้งค่า Multer [cite: 1026, 1034, 1317]
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'slip-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

module.exports = (app) => {
    // ---  ระบบยืนยันตัวตนและจัดการผู้ใช้ ---
    app.post('/register', UserAuthenController.register);
    app.post('/login', UserAuthenController.login);
    app.get('/user/:userId', UserController.show);
    app.put('/user/:userId', UserController.put);
    app.get('/users', UserController.index);
    app.delete('/user/:userId', UserController.delete);
    app.put('/user/approve/:userId', UserController.approve);
    // --- 🥗 ระบบบันทึกสุขภาพ (Health Logs) ---
    app.post('/health-log', HealthLogController.create);
    app.get('/health-logs/:userId', HealthLogController.index);

    // --- 💰 ระบบจัดการสลิป (Slip Logs) ---
    // ✨ แก้จุดที่ผิด: ย้ายออกมาอยู่ข้างนอก และส่ง Control ให้ Controller จัดการ [cite: 515, 1106]
    app.post('/membership-renewal', upload.single('slip'), SlipLogController.create);

    // ✨ เพิ่ม route สำหรับดูประวัติสลิปทั้งหมด
    app.get('/slip-logs/:userId', SlipLogController.index);
};