// src/controllers/materialController.js
const MaterialModel = require('../models/materialModel');

function normalizeQueryResult(result) {
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0];
  return Array.isArray(result) ? result : [];
}

exports.listarMateriais = async (req, res) => {
  try {
    const result = await MaterialModel.listarTodos();
    const materiais = normalizeQueryResult(result);
    return res.render('materiais', {
      materiais,
      usuario: req.session ? req.session.usuario : null,
      activePage: 'materiais'
    });
  } catch (error) {
    console.error('Erro ao listar materiais:', error);
    return res.render('materiais', {
      materiais: [],
      usuario: req.session ? req.session.usuario : null,
      activePage: 'materiais',
      error: 'Erro ao carregar materiais'
    });
  }
};

exports.criarMaterial = async (req, res) => {
  try {
    const { nome, quantidade } = req.body;
    if (!nome || String(nome).trim() === '') {
      const result = await MaterialModel.listarTodos();
      const materiais = normalizeQueryResult(result);
      return res.render('materiais', { materiais, usuario: req.session.usuario, error: 'Nome do material é obrigatório', nome, quantidade });
    }
    const qtd = quantidade !== undefined && quantidade !== null && quantidade !== '' ? Number(quantidade) : 0;
    await MaterialModel.criar({ nome: String(nome).trim(), quantidade: qtd });
    return res.redirect('/materiais');
  } catch (error) {
    console.error('Erro ao criar material:', error);
    const result = await MaterialModel.listarTodos().catch(() => []);
    const materiais = normalizeQueryResult(result);
    return res.render('materiais', { materiais, usuario: req.session ? req.session.usuario : null, activePage: 'materiais', error: 'Erro ao criar material' });
  }
};

exports.atualizarMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, quantidade } = req.body;
    if (!id) return res.redirect('/materiais');
    if (!nome || String(nome).trim() === '') return res.redirect('/materiais');
    const qtd = quantidade !== undefined && quantidade !== null && quantidade !== '' ? Number(quantidade) : 0;
    await MaterialModel.atualizar(id, { nome: String(nome).trim(), quantidade: qtd });
    return res.redirect('/materiais');
  } catch (error) {
    console.error('Erro ao atualizar material:', error);
    return res.redirect('/materiais');
  }
};

exports.deletarMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.redirect('/materiais');
    await MaterialModel.deletar(id);
    return res.redirect('/materiais');
  } catch (error) {
    console.error('Erro ao deletar material:', error);
    return res.redirect('/materiais');
  }
};
