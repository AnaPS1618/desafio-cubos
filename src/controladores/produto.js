require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senhaToken = require('../senhaToken');
const knex = require('../conexao');
const s3 = require('../config/conexaoAWS');

const cadastrarProdutos = async (req, res) => {
    const { descricao, quantidade_estoque, valor, categoria_id } = req.body;

    try {

        if (!descricao || !quantidade_estoque || !valor || !categoria_id) {
            return res.status(400).json({ mensagem: "Todos os campos são obrigatórios" })
        }

        const categoriaExiste = await knex('categorias').where('id', categoria_id).first();
        if (!categoriaExiste) {
            return res.status(404).json({ mensagem: "A categoria não existe" });
        }

        if (quantidade_estoque < 0) {
            return res.status(400).json({ mensagem: "A quantidade do produto não pode ser um número negativo. Certifique-se de inserir um valor positivo." });
        }

        if (valor < 0) {
            return res.status(400).json({ mensagem: "Desculpe, o valor do produto não pode ser negativo. Por favor, insira um valor positivo." });
        }

        const file = req.file;

        const produto_imagem = file
            ? (await s3
                .upload({
                    Bucket: process.env.BACKBLAZE_BUCKET,
                    Key: file.originalname,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                })
                .promise()).Location
            : null;

        const novoProduto = {
            descricao,
            quantidade_estoque,
            valor,
            categoria_id,
            produto_imagem
        };

        await knex('produtos').insert(novoProduto);

        return res.status(200).json(novoProduto);
    } catch (error) {
        console.log(error)
        return res.status(500).json({ mensagem: "Erro ao cadastrar o produto." });
    }
}

const editarProduto = async (req, res) => {
    const { id } = req.params
    const { descricao, quantidade_estoque, valor, categoria_id } = req.body

    try {

        if (!descricao || !quantidade_estoque || !valor || !categoria_id) {
            return res.status(400).json({ mensagem: "Todos os campos são obrigatórios" })
        }

        const validandoID = await knex('produtos').where('id', id).first().debug();

        if (!validandoID) {
            return res.status(404).json('Produto não localizado');
        }

        if (quantidade_estoque < 0) {
            return res.status(400).json({ mensagem: "A quantidade do produto não pode ser um número negativo. Certifique-se de inserir um valor positivo." });
        }

        if (valor < 0) {
            return res.status(400).json({ mensagem: "Desculpe, o valor do produto não pode ser negativo. Por favor, insira um valor positivo." });
        }

        const file = req.file;

        const produto_imagem = file
            ? (await s3
                .upload({
                    Bucket: process.env.BACKBLAZE_BUCKET,
                    Key: file.originalname,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                })
                .promise()).Location
            : null;

        const dadosProduto = {
            descricao,
            quantidade_estoque,
            valor,
            categoria_id,
            produto_imagem
        }

        const atualizacaoProduto = await knex("produtos")
            .update(dadosProduto)
            .where({ id })
            .returning("*");

        return res.status(200).json(atualizacaoProduto);

    } catch (error) {
        return res.status(500).json({ mensagem: "Erro ao cadastrar o produto." });
    }

}

const listarProduto = async (req, res) => {
    const { categoria_id } = req.query;

    try {

        if (!categoria_id) {
            const produtos = await knex('produtos');
            return res.status(200).json(produtos);
        }

        const produto = await knex('produtos').where('categoria_id', categoria_id).first();

        if (produto) {
            return res.status(200).json(produto);
        }

        return res.status(404).json("Esta categoria não existe");

    } catch (error) {

        return res.status(500).json('Erro interno, necessário verificar')
    }
}

const detalharProduto = async (req, res) => {
    const { id } = req.params;
    try {
        const produto = await knex('produtos').where('id', id).first();

        if (produto) {
            return res.status(200).json(produto)
        }

        return res.status(404).json("Produto não existente")

    } catch (error) {

        return res.status(500).json('Erro interno, necessário verificar')
    }
}

const excluirProduto = async (req, res) => {
    const { id } = req.params

    const produtoExcluido = await knex('produtos').where('id', id).del()

    if (!produtoExcluido) {
        return res.status(400).json('O produto não foi excluido')
    }

    return res.status(200).json('Produto excluido com sucesso')
}

module.exports = {
    cadastrarProdutos,
    editarProduto,
    excluirProduto,
    listarProduto,
    detalharProduto
}

