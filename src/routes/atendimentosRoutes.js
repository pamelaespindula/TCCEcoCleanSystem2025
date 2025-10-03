const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  const [atendimentos] = await db.query(`
    SELECT a.id, s.nome as nome_servico, a.data_agendada, a.hora_agendada, a.status
    FROM agendamentos a
    JOIN servicos s ON a.servico_id = s.id
    ORDER BY a.data_agendada, a.hora_agendada
  `);
  res.render('atendimentos', { atendimentos, usuario: req.session.usuario });
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  try {
    await db.query('UPDATE agendamentos SET status = ? WHERE id = ?', [status, id]);
    res.json({ sucesso: true });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar status' });
  }
});

module.exports = router;
