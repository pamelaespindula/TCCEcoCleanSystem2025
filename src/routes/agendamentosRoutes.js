const express = require('express');
const router = express.Router();
const db = require('../../config/db');

function protegerRota(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  res.status(401).json({ erro: 'Usuário não autenticado' });
}

// GET página formulário agendar
router.get('/agendar', protegerRota, async (req, res) => {
  try {
    const [servicos] = await db.query('SELECT id, nome FROM servicos ORDER BY nome ASC');
    res.render('agendar', {
      servicos,
      usuario: req.session.usuario,
      activePage: 'agendar'
    });
  } catch (error) {
    res.status(500).send('Erro ao carregar página de agendar');
  }
});

// POST formulário agendamento
router.post('/agendar', protegerRota, async (req, res) => {
  const { servico_id, data_agendada, hora_agendada, observacoes } = req.body;

  try {
    await db.query(
      'INSERT INTO agendamentos (servico_id, data_agendada, hora_agendada, observacoes) VALUES (?, ?, ?, ?)',
      [servico_id, data_agendada, hora_agendada, observacoes]
    );
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao salvar agendamento');
  }
});

// API GET agendamentos em JSON formatado para calendário
router.get('/api/agendamentos', protegerRota, async (req, res) => {
  try {
    const [agendamentos] = await db.query(`
      SELECT a.id, s.nome as title, a.data_agendada, a.hora_agendada
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      ORDER BY a.data_agendada, a.hora_agendada
    `);

    // Formatar dados para front-end (ex: data em yyyy-mm-dd)
    const eventos = agendamentos.map(ag => ({
      id: ag.id,
      title: ag.title,
      date: ag.data_agendada.toISOString().split('T')[0],
      time: ag.hora_agendada ? ag.hora_agendada.slice(0,5) : ''
    }));

    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
  }
});

module.exports = router;