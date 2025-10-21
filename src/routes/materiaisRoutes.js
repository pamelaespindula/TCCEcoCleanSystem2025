const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

// Middleware para proteger rota
function protegerRota(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.redirect('/login');
}

router.get('/', protegerRota, materialController.listarMateriais);
router.get('/novo', protegerRota, materialController.novaView);
router.post('/', protegerRota, materialController.criarMaterial);
router.get('/editar/:id', protegerRota, materialController.editarView);
router.post('/editar/:id', protegerRota, materialController.atualizarMaterial);
router.post('/deletar/:id', protegerRota, materialController.deletarMaterial);

module.exports = router;
