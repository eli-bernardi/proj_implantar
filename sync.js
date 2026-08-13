const conn = require('./db/conn')
const { Produto, Usuario, Estoque } = require('./models/rel')

async function dataBaseSync(){
    try {
        await conn.sync({force: true})
        console.log('sincronizadas as tabelas!')
    } catch (err) {
        console.error('Erro de sincronização!',err.message || err)
    }finally{
        await conn.close()
        console.log('fechando o banco de dados')
    }
}

dataBaseSync()