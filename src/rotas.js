const express = require('express');
const rotas = express.Router();

const { verificarCamposObrigatorios,
  camposObrigatoriosLogin,
  email,
  cpf,
  camposObrigatoriosClientes,
  validandoExclusaoProduto } = require('./intermediarios/validacoes');

const { atualizarPerfil,
  cadastrarUsuario,
  listarCategorias,
  detalharPerfilUsuario,
  login } = require('./controladores/usuarios');

const { verificarLogin } = require('./intermediarios/validarToken');
const { cadastrarProdutos, editarProduto, excluirProduto, listarProduto, detalharProduto } = require('./controladores/produto');
const { detalharCliente, cadastrarCliente, editarDadosCliente, listarClientes } = require('./controladores/clientes');
const { cadastrarPedido, listarPedidos } = require('./controladores/pedidos');

//cadastrar, login e listar categorias
rotas.get('/categoria', listarCategorias);
rotas.post('/usuario', verificarCamposObrigatorios, cadastrarUsuario);
rotas.post('/login', camposObrigatoriosLogin, login);

//verificação token requerida:

rotas.use(verificarLogin);

const multer = require('./services/multer');

rotas.get('/usuario', detalharPerfilUsuario);
rotas.put('/usuario', verificarCamposObrigatorios, atualizarPerfil);
rotas.post('/produto', multer.single('produto_imagem'), cadastrarProdutos);
rotas.put('/produto/:id', multer.single('produto_imagem'), editarProduto);
rotas.get('/produto', listarProduto);
rotas.get('/produto/:id', detalharProduto);
rotas.delete('/produto/:id', validandoExclusaoProduto, excluirProduto);
rotas.post('/cliente', cadastrarCliente);
rotas.put('/cliente/:id', editarDadosCliente);
rotas.get('/cliente', listarClientes);
rotas.get('/cliente/:id', detalharCliente);
rotas.post('/cliente', email, cpf, camposObrigatoriosClientes, cadastrarCliente);
rotas.put('/cliente/:id', email, cpf, camposObrigatoriosClientes, editarDadosCliente);
rotas.post('/pedido', cadastrarPedido);
rotas.get('/pedido', listarPedidos)


module.exports = rotas;