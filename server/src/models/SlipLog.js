module.exports = (sequelize, DataTypes) => {
    const SlipLog = sequelize.define('SlipLog', {
        userId: DataTypes.INTEGER, // เชื่อมกับ User คนไหน
        slip_image: DataTypes.STRING // ชื่อไฟล์รูปสลิป
    });
    return SlipLog;
};