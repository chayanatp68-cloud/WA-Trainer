const { SlipLog, User } = require('../models');

module.exports = {
    // 1. บันทึกสลิปใหม่ลงในประวัติ
    async create(req, res) {
        try {
            const log = await SlipLog.create({
                userId: req.body.userId,
                slip_image: req.file.filename // รับชื่อไฟล์จาก Multer [cite: 1076, 1079]
            });

            // อัปเดต User ให้รู้ว่าเป็นรูปสลิปล่าสุด (เพื่อความรวดเร็วในการโชว์หน้าแรก)
            await User.update({
                slip_image: req.file.filename
            }, {
                where: { id: req.body.userId }
            });

            res.send(log);
        } catch (err) {
            res.status(500).send({ error: 'บันทึกประวัติสลิปไม่สำเร็จ' });
        }
    },

    // 2. ดึงประวัติสลิปทั้งหมดของ User คนนั้น
    async index(req, res) {
        try {
            const logs = await SlipLog.findAll({
                where: { userId: req.params.userId },
                order: [
                        ['createdAt', 'DESC']
                    ] // ใหม่ล่าสุดอยู่บนสุด [cite: 155]
            });
            res.send(logs);
        } catch (err) {
            res.status(500).send({ error: 'ดึงประวัติสลิปไม่สำเร็จ' });
        }
    }
};