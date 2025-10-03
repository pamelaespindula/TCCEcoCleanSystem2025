const express = require('express');
const router = express.Router();
const db = require('../../config/db');

router.get('/', async (req, res) => {
  try {
    // Busca serviços para o formulário de agendamentos
    const [servicos] = await db.query('SELECT id, nome FROM servicos ORDER BY nome ASC');

    // Busca agendamentos para mostrar no calendário
    const [agendamentos] = await db.query(`
      SELECT ag.id, ag.data_agendada, ag.hora_agendada, s.nome AS nome_servico
      FROM agendamentos ag
      JOIN servicos s ON ag.servico_id = s.id
      ORDER BY ag.data_agendada, ag.hora_agendada
    `);

    res.render('dashboard', {
      servicos,
      agendamentos,
      usuario: req.session.usuario,
      activePage: 'dashboard'
    });
  } catch (error) {
    console.error(error);
    res.render('dashboard', {
      servicos: [],
      agendamentos: [],
      usuario: req.session.usuario,
      activePage: 'dashboard'
    });
  }
});

module.exports = router;
