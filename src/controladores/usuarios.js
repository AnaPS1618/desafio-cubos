require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const senhaToken = require('../senhaToken');
const knex = require('../conexao');

const cadastrarUsuario = async (req, res) => {
  const { nome, email, senha } = req.body;
  try {
    const quantidadeUsuarios = await knex('usuarios').where('email', email).first();

    if (quantidadeUsuarios) {
      return res.status(400).json("O email já existe");
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuario = await knex('usuarios').insert({
      nome: nome,
      email: email,
      senha: senhaCriptografada
    }).returning('*');


    if (!usuario[0]) {
      return res.status(400).json("O usuario não foi cadastrado");
    }

    const { senha: _, ...usuarioCadastrado } = usuario[0];

    return res.status(200).json(usuarioCadastrado);
  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await knex("usuarios").where("email", email).first();

    if (!usuario) {
      return res.status(404).json("O usuario não foi encontrado");
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta) {
      return res.status(400).json("Email e senha não conferem");
    }
    const token = jwt.sign({ id: usuario.id }, senhaToken, { expiresIn: "8h" });

    const { senha: _, ...usuarioLogado } = usuario;

    return res.status(200).json({
      usuario: usuarioLogado,
      token,
    });

  } catch (error) {
    return res.status(400).json(error.message);
  }
};

const atualizarPerfil = async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const emailExiste = await knex('usuarios').where({ email }).first().whereNot('id', req.usuario.id);

    if (emailExiste) {
      return res.status(400).json('O email já está cadastrado para outro usuario');
    }

    const senhaCriptografada = await bcrypt.hash(senha, 10);

    const usuarioAtualizado = await knex('usuarios').where({ id: req.usuario.id }).update({ nome, email, senha: senhaCriptografada })

    if (!usuarioAtualizado) {
      return res.status(400).json("O usuario não foi atualizado");
    }

    return res.status(200).json('Usuario foi atualizado com sucesso.');
  } catch (error) {
    
    return res.status(400).json(error.message);
  }
};

const listarCategorias = async (req, res) => {

  try {

    const sql = await knex('categorias').returning('*').debug()

    return res.status(200).json(sql)

  } catch (error) {
    return res.status(500).json('Erro interno, necessário verificar')
  }
};

const detalharPerfilUsuario = async (req, res) => {

  try {

    return res.status(200).json(req.usuario)

  } catch (error) {
    return res.status(500).json('Erro interno, necessário verificar')
  }
};

module.exports = {
  cadastrarUsuario,
  login,
  atualizarPerfil,
  listarCategorias,
  detalharPerfilUsuario
};
