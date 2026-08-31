require('dotenv').config()
const { Sequelize } = require('sequelize')

const db = new Sequelize(process.env.MYSQL_URL || process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false
})

module.exports = db
