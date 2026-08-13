const Usuario = require('../models/Usuario')
const Produto = require('../models/Produto')
const Estoque = require('../models/Estoque')

const cadastrar = async (req,res)=>{
    const valores = req.body

    if(!valores.idUsuario || !valores.idProduto || !valores.data || !valores.qtdeMov || !valores.tipo){
        return res.status(400).json({message: 'Campos Obrigatórios'})
    }

    try{
        const usuario = await Usuario.findByPk(valores.idUsuario)
        if(!usuario){
            return res.status(404).json({message: 'Usuário não encontrado'})
        }
        const produto = await Produto.findByPk(valores.idProduto)
        if(!produto){
            return res.status(404).json({message: 'Produto não encontrado'})
        }

        let novaQtde = produto.quantidade

        // Entrada de novos produtos
        if(valores.tipo === 'ENTRADA'){
            novaQtde += valores.qtdeMov
        }
        // Saída de produtos
        else if(valores.tipo === 'SAIDA'){
            // 1. Só pode vender se tiver no estoque a quantidade
            if(produto.quantidade < valores.qtdeMov){
                return res.status(400).json({message: 'Estoque insuficiente!', novaQtde})
            }
            // 2. Atualiza quantidade de produto
            novaQtde -= valores.qtdeMov
        }
        // Tipo inválido
        else{
            return res.status(400).json({message: 'Tipo inválido'})
        }

        // Atualiza a tabela de produtos
        await produto.update({quantidade: novaQtde})

        // Registra movimento do estoque
        const dados = await Estoque.create(valores)
        res.status(201).json({message: 'Estoque atualizado!', novaQtde, dados})

    }catch(err){
        console.log('Erro ao cadastrar estoque!',err)
        res.status(500).json({message: 'Erro ao cadastrar estoque!'})
    }
}

const listar = async (req,res)=>{
    try{
        let dados = await Estoque.findAll()
        res.status(200).json(dados)
    }catch(err){
        console.log('Erro ao listar estoque!',err)
        res.status(500).json({message: 'Erro ao listar estoque!'})
    }
}

module.exports = { cadastrar, listar }