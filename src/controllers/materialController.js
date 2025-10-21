const MaterialModel = require('../models/materialModel');

exports.novaView = async (req, res) => {
  return res.render('materiais', { editMaterial: null, materiais: [], usuario: req.session.usuario });
};

exports.editarView = async (req, res) => {
  try {
    const { id } = req.params;
    const material = await MaterialModel.buscarPorId(id);
    const materiais = await MaterialModel.listarTodos();
    res.render('materiais', { editMaterial: material, materiais, usuario: req.session.usuario });
  } catch (error) {
    res.redirect('/materiais');
  }
};

exports.listarMateriais = async (req, res) => {
  try {
    const materiais = await MaterialModel.listarTodos();
    res.render('materiais', { materiais, usuario: req.session.usuario });
  } catch (error) {
    res.status(500).send('Erro ao carregar materiais');
  }
};

exports.criarMaterial = async (req, res) => {
  try {
    const { nome, quantidade } = req.body;
    await MaterialModel.criar({ nome, quantidade });
    res.redirect('/materiais');
  } catch (error) {
    res.status(500).send('Erro ao criar material');
  }
};

exports.atualizarMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, quantidade } = req.body;
    await MaterialModel.atualizar(id, { nome, quantidade });
    res.redirect('/materiais');
  } catch (error) {
    res.status(500).send('Erro ao atualizar material');
  }
};

exports.deletarMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    await MaterialModel.deletar(id);
    res.redirect('/materiais');
  } catch (error) {
    res.status(500).send('Erro ao deletar material');
  }
};
