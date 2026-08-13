require('dotenv').config()
const { Sequelize } = require('sequelize')

const db = new Sequelize(process.env.MYSQL_URL ||process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false
})

// const db = new Sequelize(
//     process.env.DB_NOME,
//     process.env.DB_USUARIO,
//     process.env.DB_SENHA,
//     {
//         host: process.env.DB_HOST,
//         dialect: 'mysql',
//         port: process.env.DB_PORT || 3306
//     }
// )

// sequelize.authenticate()
// .then(() => {
//     console.log('Banco de dados conectado!')
// })
// .catch((err) => {
//     console.error('Erro de conexão com o banco de dados!', err)
// })

module.exports = db