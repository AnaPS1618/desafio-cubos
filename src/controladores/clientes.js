const knex = require('../conexao');

const cadastrarCliente = async (req, res) => {
    const { nome, email, cpf, cep, rua, numero, bairro, cidade, estado } = req.body

    try {

        const cadastrandoCliente = await knex('clientes').insert({
            nome: nome, email: email,
            cpf: cpf, cep: cep,
            rua: rua, numero: numero,
            bairro: bairro, cidade: cidade,
            estado: estado
        }).returning('nome', 'email', 'cpf', 'cep', 'rua', 'numero',
        'bairro', 'cidade', 'estado').debug();

        return res.status(201).json(cadastrandoCliente)
    } catch (error) {
        return res.status(500).json('Erro interno, necessário verificar')
    }
}

const editarDadosCliente = async (req, res) => {
    const { id } = req.params
    const { nome, email, cpf, cep, rua, numero, bairro, cidade, estado } = req.body
    try {

        const verificandoID = await knex('clientes').where('id', id).first().debug();

        if (!verificandoID) {
            return res.status(400).json("id informado não existe");
        }

        const editandoDados = await knex('clientes').where('id', id).update({
            nome: nome, email: email,
            cpf: cpf, cep: cep,
            rua: rua, numero: numero,
            bairro: bairro, cidade: cidade,
            estado: estado
        }).returning('*').debug()

        return res.status(200).json(editandoDados)

    } catch (error) {
        console.log(error.message)
        return res.status(500).json('Erro interno, necessário verificar')
    }
}

const listarClientes = async (req, res) => {
    try {

        const listandoClientes = await knex('clientes').debug()

        return res.status(200).json(listandoClientes)
    } catch (error) {
        
        return res.status(500).json('Erro interno, necessário verificar')
    }
}

const detalharCliente = async (req, res) => {
    const { id } = req.params

    try {
        const procurarCliente = await knex('clientes').where('id', id).first().returning('*')

        if (!procurarCliente) {
            return res.status(404).json('Cliente não encontrado')
        }

        return res.status(200).json(procurarCliente)

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro ao detalhar cliente." });
    }
}


module.exports = {
    cadastrarCliente,
    editarDadosCliente,
    listarClientes,
    detalharCliente
}