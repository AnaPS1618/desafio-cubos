require('dotenv').config();
const knex = require('../conexao');
const transportador = require('../services/email')

const cadastrarPedido = async (req, res) => {
    const { cliente_id, observacao, pedido_produtos } = req.body
    const arrayProdutosEncontrados = []
    let somaProdutos = 0

    if (!cliente_id || !pedido_produtos) {
        return res.status(404).json("Todos os campos, exceto observação são obrigatórios");
    }

    try {
        const procurarCliente = await knex('clientes').where('id', cliente_id).first()

        if (!procurarCliente) {
            return res.status(400).json("id informado não existe")
        }

        for (let i = 0; i < pedido_produtos.length; i++) {

            let procurarProduto = await knex('produtos').where('id', pedido_produtos[i]['produto_id']).first()

            if (!procurarProduto) {
                return res.status(404).json(`O produto com o id ${pedido_produtos[i]['produto_id']} não existe`)
            }

            if (procurarProduto['quantidade_estoque'] < pedido_produtos[i]['quantidade_produto']) {
                return res.status(404).json(`Estoque indisponivel para o produto ${procurarProduto['descricao']}`)
            }

            arrayProdutosEncontrados.push(procurarProduto)

            somaProdutos = pedido_produtos[i]['quantidade_produto'] * arrayProdutosEncontrados[i]['valor'] + somaProdutos
        }

        const pedidoCadastrado = await knex('pedidos').insert({
            cliente_id: cliente_id,
            observacao: observacao,
            valor_total: somaProdutos
        }).returning("*");

        for (let i = 0; i < pedido_produtos.length; i++) {
            await knex('pedido_produtos').insert({
                pedido_id: pedidoCadastrado[i]['id'],
                produto_id: arrayProdutosEncontrados[i]['id'],
                quantidade_produto: pedido_produtos[i]['quantidade_produto'],
                valor_produto: Number(arrayProdutosEncontrados[i]['valor'])
            })
        };

        if (!pedidoCadastrado) {
            return res.status(400).json("O pedido não foi cadastrado");
        }

        transportador.sendMail({
            from: `${process.env.EMAIL_NAME} <${process.env.EMAIL_FROM}>`,
            to: `${procurarCliente.nome} <${procurarCliente.email}>`,
            subject: "Pedido Realizado",
            text: `O pedido foi realizado com sucesso`
        })

        return res.status(200).json('Pedido realizado com sucesso, email de notificação enviado')


    } catch (error) {
        return res.status(500).json('Erro interno, necessário verificar')
    }
}

const listarPedidos = async (req, res) => {

    const { cliente_id } = req.query

    try {

        const clienteExiste = await knex('pedidos').where('cliente_id', cliente_id).first();

        if (!clienteExiste) {
            const pedidosComProdutos = await knex('pedidos')
                .select(
                    'pedidos.id as pedido_id',
                    'pedidos.valor_total',
                    'pedidos.observacao',
                    'pedidos.cliente_id',
                    'pedido_produtos.id as produto_id',
                    'pedido_produtos.quantidade_produto',
                    'pedido_produtos.valor_produto',
                    'pedido_produtos.pedido_id',
                    'pedido_produtos.produto_id'
                )
                .join('pedido_produtos', 'pedidos.id', '=', 'pedido_produtos.pedido_id').returning('*');

            return res.status(200).send(pedidosComProdutos)
        } else {

            const tabPedidos = await knex.select('*').from('pedidos');
            const tabPedProdutos = await knex.select('*').from('pedido_produtos');

            return res.status(200).send(
                tabPedidos,
                tabPedProdutos
            )
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json('Erro interno, necessário verificar')
    }
}


module.exports = {
    cadastrarPedido,
    listarPedidos
}
