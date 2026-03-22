// server/src/models/HealthLog.js
module.exports = (sequelize, DataTypes) => {
    const HealthLog = sequelize.define('HealthLog', {
        userId: DataTypes.INTEGER, // เชื่อมกับ ID ของสมาชิก
        weight: DataTypes.FLOAT, // น้ำหนักที่กรอกในขณะนั้น
        height: DataTypes.FLOAT, // ส่วนสูงที่กรอกในขณะนั้น
        bmi: DataTypes.FLOAT // ค่า BMI ที่คำนวณได้ ณ ตอนนั้น
    }); // 
    return HealthLog;
};