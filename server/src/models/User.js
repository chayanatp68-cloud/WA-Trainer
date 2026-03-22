const bcrypt = require('bcrypt');

async function hashPassword(user, options) {
    if (!user.changed('password')) { return; }
    const salt = await bcrypt.genSalt(5);
    const hash = await bcrypt.hash(user.password, salt);
    user.setDataValue('password', hash);
}

async function setMemberEnd(user, options) {
    if (!user.changed('member_start') || !user.member_start) { return; }
    const startDate = new Date(user.member_start);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);
    user.setDataValue('member_end', endDate);
}

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        email: { type: DataTypes.STRING, unique: true },
        password: DataTypes.STRING,
        name: DataTypes.STRING,
        lastname: DataTypes.STRING,
        type: DataTypes.STRING,
        member_start: DataTypes.DATE,
        member_end: DataTypes.DATE,
        weight: DataTypes.FLOAT,
        height: DataTypes.FLOAT,
        slip_image: DataTypes.STRING,

        // ✨✨ 3 ฟีเจอร์ใหม่สำหรับระบบเทรนเนอร์โดยเฉพาะ ✨✨
        trainer_id: DataTypes.INTEGER, // 1. ใครเป็นคนดูแล (เก็บ ID เทรนเนอร์)
        trainer_note: DataTypes.TEXT, // 2. แผนการฝึกและการกิน (Workout & Diet Plan)
        last_weight_update: DataTypes.DATE // 3. วันที่อัปเดตน้ำหนักล่าสุด (ใช้ทำ Inactive Alert 7 วัน)

    }, {
        hooks: {
            beforeCreate: [hashPassword, setMemberEnd],
            beforeUpdate: [hashPassword, setMemberEnd]
        }
    });

    User.prototype.comparePassword = async function(password) {
        return await bcrypt.compare(password, this.password);
    };

    return User;
};