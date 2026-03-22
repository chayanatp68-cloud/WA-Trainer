const fs = require('node:fs');
const path = require('node:path');
const Sequelize = require('sequelize');
const config = require('../config/config');

const db = {};

const sequelize = new Sequelize(
    config.db.database,
    config.db.user,
    config.db.password,
    config.db.options
);

fs.readdirSync(__dirname)
    .filter((file) => file.indexOf('.') !== 0 && file !== 'index.js')
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
        db[model.name] = model;
    });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;