const { User } = require('../models');
const { Op } = require('sequelize'); // ✨ 1. เรียกใช้ Operator จาก sequelize โดยตรงตามที่อาจารย์สอน

module.exports = {
    async show(req, res) {
        try {
            const user = await User.findByPk(req.params.userId);
            res.send(user);
        } catch (err) {
            res.status(500).send({ error: 'หาข้อมูลไม่พบ' });
        }
    },
    async put(req, res) {
        try {
            await User.update(req.body, {
                where: { id: req.params.userId }
            });
            res.send(req.body);
        } catch (err) {
            res.status(500).send({ error: 'แก้ไขข้อมูลไม่สำเร็จ' });
        }
    },
    async index(req, res) {
        try {
            let users = null;
            const search = req.query.search;

            if (search) {
                users = await User.findAll({
                    where: {
                        [Op.or]: [
                            'name', 'lastname', 'email'
                        ].map(key => ({
                            [key]: {
                                [Op.like]: `%${search}%`
                            }
                        }))
                    },
                    order: [
                            ['updatedAt', 'DESC']
                        ] // ✨ 2. เปลี่ยนเป็น updatedAt ตามเอกสารอาจารย์
                });
            } else {
                users = await User.findAll({
                    order: [
                            ['updatedAt', 'DESC']
                        ] // ✨ 2. เปลี่ยนเป็น updatedAt
                });
            }
            res.send(users);
        } catch (err) {
            // ✨ 3. ตัวดักจับ Error: ถ้ามันพังอีก เราจะรู้สาเหตุจาก Terminal หลังบ้าน
            console.error('\n🔥🔥🔥 ERROR จากหลังบ้าน 🔥🔥🔥\n', err, '\n');
            res.status(500).send({ error: 'ดึงข้อมูลสมาชิกไม่สำเร็จ' });
        }
    },
    async delete(req, res) {
        try {
            const user = await User.findByPk(req.params.userId);
            if (!user) {
                return res.status(403).send({ error: 'ไม่พบสมาชิกที่ต้องการลบ' });
            }
            await user.destroy();
            res.send(user);
        } catch (err) {
            res.status(500).send({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
        }
    },

    // ✨ 4. ฟังก์ชันสำหรับยืนยันสลิปและเพิ่มวันหมดอายุสมาชิก
    async approve(req, res) {
        try {
            const user = await User.findByPk(req.params.userId);
            if (!user) {
                return res.status(403).send({ error: 'ไม่พบสมาชิก' });
            }

            const daysToAdd = parseInt(req.body.days); // รับจำนวนวัน (7, 30, 365)

            // คำนวณวันเริ่มต้น: ถ้าวันหมดอายุเดิมยังไม่ถึง ให้บวกต่อจากของเดิม 
            // แต่ถ้าหมดอายุไปแล้ว ให้เริ่มบวกจาก "วันนี้"
            let startDate = new Date();
            if (user.member_end && new Date(user.member_end) > new Date()) {
                startDate = new Date(user.member_end);
            }

            const newEndDate = new Date(startDate);
            newEndDate.setDate(startDate.getDate() + daysToAdd);

            // อัปเดตข้อมูลลง Database
            await User.update({
                member_end: newEndDate,
                slip_image: null // ล้างสถานะสลิปหน้าแรกให้เป็น "❌ ยังไม่แนบ" เพื่อรอรอบถัดไป (ประวัติสลิปใน SlipLogs ยังอยู่ครบ)
            }, {
                where: { id: req.params.userId }
            });

            res.send({ message: `ขยายเวลาสมาชิกเพิ่ม ${daysToAdd} วัน เรียบร้อยแล้ว` });
        } catch (err) {
            console.error('\n🔥🔥🔥 ERROR ยืนยันสลิป 🔥🔥🔥\n', err, '\n');
            res.status(500).send({ error: 'เกิดข้อผิดพลาดในการยืนยันสลิป' });
        }
    }
};