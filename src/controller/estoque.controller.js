const db = require('../db/conn')
const Usuario = require('../models/Usuario')
const Servico = require('../models/Servico')
const Estoque = require('../models/Estoque')

const cadastrar = async (req, res) => {
    const valores = req.body

    if (!valores.idUsuario || !valores.idServico || !valores.data || !valores.qtdeMov || !valores.tipo) {
        return res.status(400).json({ message: 'Campos Obrigatórios' })
    }

    try {
        const usuario = await Usuario.findByPk(valores.idUsuario)
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado' })
        }
        const servico = await Servico.findByPk(valores.idServico)
        if (!servico) {
            return res.status(404).json({ message: 'Serviço não encontrado' })
        }

        let novaCapacidade = servico.capacidadeDisponivel

        if (valores.tipo === 'ENTRADA') {
            // Abre novas vagas de capacidade de atendimento
            novaCapacidade += valores.qtdeMov
        } else if (valores.tipo === 'SAIDA') {
            // Só pode reduzir capacidade se houver disponibilidade
            if (servico.capacidadeDisponivel < valores.qtdeMov) {
                return res.status(400).json({ message: 'Capacidade insuficiente!', novaCapacidade })
            }
            novaCapacidade -= valores.qtdeMov
        } else {
            return res.status(400).json({ message: 'Tipo inválido' })
        }

        await servico.update({ capacidadeDisponivel: novaCapacidade })

        const dados = await Estoque.create(valores)
        res.status(201).json({ message: 'Capacidade atualizada!', novaCapacidade, dados })
    } catch (err) {
        console.log('Erro ao cadastrar movimentação de estoque!', err)
        res.status(500).json({ message: 'Erro ao cadastrar movimentação de estoque!' })
    }
}

const listar = async (req, res) => {
    try {
        const dados = await Estoque.findAll()
        res.status(200).json(dados)
    } catch (err) {
        console.log('Erro ao listar estoque!', err)
        res.status(500).json({ message: 'Erro ao listar estoque!' })
    }
}

// PUT /estoque/:id - corrige uma movimentação já registrada (data, quantidade e/ou tipo).
// Reverte o efeito da movimentação antiga na capacidade do serviço e reaplica com os novos valores.
const atualizar = async (req, res) => {
    const { id } = req.params
    const valores = req.body

    if (valores.tipo && !['ENTRADA', 'SAIDA'].includes(valores.tipo)) {
        return res.status(400).json({ message: 'Tipo inválido' })
    }

    const transacao = await db.transaction()

    try {
        const movimentacao = await Estoque.findByPk(id, { transaction: transacao })
        if (!movimentacao) {
            await transacao.rollback()
            return res.status(404).json({ message: 'Movimentação de estoque não encontrada' })
        }

        const servico = await Servico.findByPk(movimentacao.idServico, { transaction: transacao })
        if (!servico) {
            await transacao.rollback()
            return res.status(404).json({ message: 'Serviço vinculado não encontrado' })
        }

        // 1. Reverte o efeito da movimentação antiga
        let capacidadeRevertida = servico.capacidadeDisponivel
        capacidadeRevertida += movimentacao.tipo === 'ENTRADA' ? -movimentacao.qtdeMov : movimentacao.qtdeMov

        // 2. Aplica o efeito da movimentação atualizada
        const novoTipo = valores.tipo || movimentacao.tipo
        const novaQtde = valores.qtdeMov !== undefined ? valores.qtdeMov : movimentacao.qtdeMov

        let capacidadeFinal = capacidadeRevertida
        if (novoTipo === 'ENTRADA') {
            capacidadeFinal += novaQtde
        } else {
            if (capacidadeRevertida < novaQtde) {
                await transacao.rollback()
                return res.status(400).json({ message: 'Capacidade insuficiente para aplicar esta atualização' })
            }
            capacidadeFinal -= novaQtde
        }

        await servico.update({ capacidadeDisponivel: capacidadeFinal }, { transaction: transacao })
        await movimentacao.update(
            {
                data: valores.data || movimentacao.data,
                qtdeMov: novaQtde,
                tipo: novoTipo
            },
            { transaction: transacao }
        )

        await transacao.commit()
        res.status(200).json({ message: 'Movimentação de estoque atualizada!', novaCapacidade: capacidadeFinal, dados: movimentacao })
    } catch (err) {
        await transacao.rollback()
        console.log('Erro ao atualizar movimentação de estoque!', err)
        res.status(500).json({ message: 'Erro ao atualizar movimentação de estoque!' })
    }
}

module.exports = { cadastrar, listar, atualizar }
