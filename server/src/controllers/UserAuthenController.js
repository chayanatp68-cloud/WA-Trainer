const { User } = require('../models');
const jwt = require('jsonwebtoken');

// ฟังก์ชันสร้างบัตรผ่าน (Token) มีอายุ 1 สัปดาห์
function jwtSignUser(user) {
    const ONE_WEEK = 60 * 60 * 24 * 7;
    return jwt.sign(user, 'fitness-secret-key', { // ในงานจริง 'fitness-secret-key' ควรอยู่ใน config
        expiresIn: ONE_WEEK
    });
}

module.exports = {
    async register(req, res) {
        try {
            // --- 🛠 ส่วนที่แก้ไขเพิ่มเติม (กำหนดวันหมดอายุ 7 วัน) ---
            const today = new Date();
            const expireDate = new Date(today);
            expireDate.setDate(today.getDate() + 7); // บวกเพิ่ม 7 วัน

            // นำข้อมูลที่ส่งมาจากหน้าบ้าน มารวมกับฟิลด์ member_end ที่เราคำนวณเอง
            const userData = {
                ...req.body,
                member_end: expireDate
            };
            // ----------------------------------------------------

            // 1. สร้าง User ใหม่ลง Database ด้วยข้อมูลที่ถูกปรับแต่งแล้ว
            const user = await User.create(userData);
            const userJSON = user.toJSON();

            // 2. ส่งข้อมูล User พร้อม Token กลับไปทันที
            res.send({
                user: userJSON,
                token: jwtSignUser(userJSON)
            });
        } catch (err) {
            // 3. ถ้าอีเมลซ้ำ หรือข้อมูลผิดพลาด ให้ส่ง Error กลับไป
            res.status(400).send({
                error: 'อีเมลนี้ถูกใช้งานไปแล้ว หรือข้อมูลไม่ถูกต้อง'
            });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email: email } });

            if (!user) {
                return res.status(403).send({ error: 'ไม่พบอีเมลนี้ในระบบ' });
            }

            // เช็ครหัสผ่าน
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(403).send({ error: 'รหัสผ่านไม่ถูกต้อง' });
            }

            const userJSON = user.toJSON();
            res.send({
                user: userJSON,
                token: jwtSignUser(userJSON)
            });
        } catch (error) {
            res.status(500).send({ error: 'เกิดข้อผิดพลาดในการล็อกอิน' });
        }
    }
};