const express = require('express');
const router = express.Router();
const cadastroController = require('../controllers/cadastroController');

router.get('/', cadastroController.renderCadastro);
router.post('/', cadastroController.cadastrarFuncionario);

module.exports = router;
