const knex = require("../conexao");

const verificarCamposObrigatorios = async (req, res, next) => {
    const { nome, email, senha } = req.body;

    try {

        if (!nome || !email || !senha) {
            return res.status(404).json("Todos os campos são obrigatorios");
        }

        next();

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const camposObrigatoriosLogin = async (req, res, next) => {
    const { email, senha } = req.body;

    try {

        if (!email || !senha) {
            return res.status(404).json("Todos os campos são obrigatorios");
        }

        next();

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const camposObrigatoriosClientes = async (req, res, next) => {
    const { nome, email, cpf } = req.body;

    try {

        if (!nome || !email || !cpf) {
            return res.status(404).json("Todos os campos são obrigatorios");
        }

        next();

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const email = async (req, res, next) => {
    const { email } = req.body;

    try {

        const verificandoEmail = await knex('clientes')
            .where('email', email)
            .first()
            .debug();

        if (verificandoEmail) {
            return res.status(400)
                .json("O email ou cpf já existe");
        }

        next();

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const cpf = async (req, res, next) => {
    const { cpf } = req.body;

    try {

        const verificandoCPF = await knex('clientes')
            .where('cpf', cpf)
            .first()
            .debug();

        if (verificandoCPF) {
            return res.status(400).json("O email ou cpf já existe");
        }

        next();

    } catch (error) {
        return res.status(400).json(error.message);
    }
}

const validandoExclusaoProduto = async (req, res, next) => {
    const { id } = req.params

    try {
        const procurarProduto = await knex('produtos').where('id', id).first()
        if (!procurarProduto) {
            return res.status(404).json('Produto não encontrado')
        }

        const procurarProdutoNoPedido = await knex('pedido_produtos').where('produto_id', id).first()

        if (!procurarProdutoNoPedido) {
            next()
        } else {
            return res.status(400).json('O produto não pode ser  excluido, pois possui pedido vinculado')
        }

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro ao excluir o produto." });
    }
}

module.exports = {
    verificarCamposObrigatorios,
    camposObrigatoriosLogin,
    camposObrigatoriosClientes,
    cpf,
    email,
    validandoExclusaoProduto
}