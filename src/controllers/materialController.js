const MaterialModel = require('../models/materialModel');

exports.listarMateriais = async (req, res) => {
  try {
    const materiais = await MaterialModel.listarTodos();
    res.render('materiais', { materiais, usuario: req.session.usuario });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar materiais');
  }
};

exports.criarMaterial = async (req, res) => {
  try {
    const { nome, quantidade } = req.body;
    await MaterialModel.criar({ nome, quantidade });
    res.redirect('/materiais');
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).send('Erro ao atualizar material');
  }
};

exports.deletarMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    await MaterialModel.deletar(id);
    res.redirect('/materiais');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao deletar material');
  }
};
