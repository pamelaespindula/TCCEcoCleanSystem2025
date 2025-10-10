const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const MaterialModel = require('../models/materialModel');

function protegerRota(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.redirect('/login');
}

router.get('/', protegerRota, materialController.listarMateriais);
router.post('/criar', protegerRota, materialController.criarMaterial);
router.post('/atualizar/:id', protegerRota, materialController.atualizarMaterial);
router.post('/excluir/:id', protegerRota, materialController.deletarMaterial);

// ROTA DE EDITAR QUE REUSA A VIEW 'materiais'
router.get('/editar/:id', protegerRota, async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await MaterialModel.buscarPorId(id);
    // adapta formatos de retorno do pool (mysql2/promise ou outros)
    const rows = Array.isArray(resultado) && Array.isArray(resultado[0]) ? resultado[0] : resultado;
    const material = Array.isArray(rows) ? rows[0] : rows;
    if (!material) return res.redirect('/materiais');

    const listaResult = await MaterialModel.listarTodos();
    const materiais = Array.isArray(listaResult) && Array.isArray(listaResult[0]) ? listaResult[0] : listaResult;

    return res.render('materiais', {
      materiais,
      usuario: req.session ? req.session.usuario : null,
      activePage: 'materiais',
      editMaterial: material
    });
  } catch (err) {
    console.error('Erro ao carregar edição:', err);
    return res.redirect('/materiais');
  }
});

module.exports = router;
