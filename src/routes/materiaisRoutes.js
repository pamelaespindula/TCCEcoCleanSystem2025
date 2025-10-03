const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');

router.get('/', materialController.listarMateriais);
router.post('/', materialController.criarMaterial);
router.post('/editar/:id', materialController.atualizarMaterial);
router.post('/deletar/:id', materialController.deletarMaterial);

module.exports = router;
