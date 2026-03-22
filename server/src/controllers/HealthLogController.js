// server/src/controllers/HealthLogController.js
const { HealthLog, User } = require('../models');

module.exports = {
    // 1. ฟังก์ชันบันทึกเดิมของนาย (แก้ไขเล็กน้อยเพื่อความคลีน)
    async create(req, res) {
        try {
            const log = await HealthLog.create(req.body);
            await User.update({
                weight: req.body.weight,
                height: req.body.height
            }, {
                where: { id: req.body.userId }
            });
            res.send(log);
        } catch (err) {
            res.status(500).send({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
        }
    },

    // 🚩 2. เพิ่มฟังก์ชันนี้เพื่อรองรับการดึงประวัติ (GET /health-logs/:userId)
    async index(req, res) {
        try {
            const logs = await HealthLog.findAll({
                where: {
                    userId: req.params.userId // ดึง ID จาก URL
                },
                order: [
                        ['createdAt', 'DESC']
                    ] // เอาใหม่ล่าสุดขึ้นก่อน
            });
            res.send(logs);
        } catch (err) {
            res.status(500).send({ error: 'ดึงข้อมูลประวัติไม่สำเร็จ' });
        }
    }
};