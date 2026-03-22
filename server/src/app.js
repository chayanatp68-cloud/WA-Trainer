const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // ✨ 1. ต้องดึง path มาใช้งานด้วย

const { sequelize, User } = require('./models');
const config = require('./config/config');

app.use(bodyParser.json());
app.use(cors());

// ✨✨ 2. จุดสำคัญที่หายไป! ต้องเปิดโฟลเดอร์ uploads ให้เบราว์เซอร์เข้ามาดึงรูปได้ ✨✨
const uploadPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadPath));

require('./routes')(app);

async function seedAdmin() {
    try {
        const adminEmail = 'admin@gmail.com';
        const adminPass = '123456';

        const existingAdmin = await User.findOne({ where: { email: adminEmail } });

        if (!existingAdmin) {
            await User.create({
                email: adminEmail,
                password: adminPass,
                name: 'Super',
                lastname: 'Admin',
                type: 'admin',
                weight: 0,
                height: 0
            });
            console.log('✅ บัญชี Admin สำเร็จ! ');
        } else {
            console.log('มีบัญชี Admin มีอยู่ในระบบแล้ว พร้อมใช้งาน!');
        }
    } catch (err) {
        console.error('❌ เกิดข้อผิดพลาดในการสร้าง Admin:', err);
    }
}

sequelize.sync().then(() => {
    seedAdmin();

    app.listen(config.port);
    console.log(`Server started on port ${config.port}`);
});