require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')

const PORT = process.env.PORT || 3000

const conn = require('./db/conn')
require('./models/rel')

const usuarioController = require('./controller/usuario.controller')
const produtoController = require('./controller/produto.controller')
const estoqueController = require('./controller/estoque.controller')

// ---------- middleware -------------
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(cors())
// app.use(cors({
//     origin: '*',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
// }))
// -----------------------------------

// Rotas Usuário
app.post('/usuario', usuarioController.cadastrar)
app.get('/usuario', usuarioController.listar)
app.get('/usuario/:id', usuarioController.consultar)
app.put('/usuario/:id', usuarioController.atualizar)
app.delete('/usuario/:id', usuarioController.apagar)

// Rotas Produto
app.post('/produto', produtoController.cadastrar)
app.get('/produto', produtoController.listar)
app.get('/produto/:id', produtoController.consultar)
app.put('/produto/:id', produtoController.atualizar)
app.delete('/produto/:id', produtoController.apagar)

// Rotas Estoque
app.post('/estoque', estoqueController.cadastrar)
app.get('/estoque', estoqueController.listar)

app.get('/', (req,res)=>{
    res.status(200).json({message: 'teste de aplicação rodando'})
})

// ------------------- Server ---------------
conn.sync()
.then(()=>{
    app.listen(PORT, ()=>{
        console.log(`Servidor rodando em Port: ${PORT}`)
    })
})
.catch((err)=>{
    console.error('Erro de conexão com o banco de dados!',err.message || err)
})
