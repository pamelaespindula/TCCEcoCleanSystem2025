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

// POST formulário agendamento (ATUALIZADO COM NOVOS CAMPOS)
router.post('/agendar', protegerRota, async (req, res) => {
  const { servico_id, data_agendada, hora_agendada, observacoes, nome_cliente, empresa, telefone } = req.body;

  try {
    await db.query(
      `INSERT INTO agendamentos 
       (servico_id, data_agendada, hora_agendada, observacoes, nome_cliente, empresa, telefone, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')`,
      [servico_id, data_agendada, hora_agendada, observacoes, nome_cliente, empresa, telefone]
    );
    res.redirect('/atendimentos');
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao salvar agendamento');
  }
});

// API GET agendamentos em JSON formatado para calendário (ATUALIZADO)
router.get('/api/agendamentos', protegerRota, async (req, res) => {
  try {
    const [agendamentos] = await db.query(`
      SELECT a.id, s.nome as title, a.data_agendada, a.hora_agendada, a.nome_cliente
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      ORDER BY a.data_agendada, a.hora_agendada
    `);

    const eventos = agendamentos.map(ag => ({
      id: ag.id,
      title: ag.title,
      date: ag.data_agendada.toISOString().split('T')[0],
      time: ag.hora_agendada ? ag.hora_agendada.slice(0,5) : '',
      cliente: ag.nome_cliente
    }));

    res.json(eventos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
  }
});

// ROTA PARA ATUALIZAR AGENDAMENTO (ALTERAR)
router.put('/alterar', protegerRota, async (req, res) => {
  const { id, data_agendada, hora_agendada, observacoes } = req.body;
  
  try {
    await db.query(
      'UPDATE agendamentos SET data_agendada = ?, hora_agendada = ?, observacoes = ? WHERE id = ?',
      [data_agendada, hora_agendada, observacoes, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar agendamento' });
  }
});

// ROTA PARA EXCLUIR AGENDAMENTO
router.delete('/:id', protegerRota, async (req, res) => {
  const { id } = req.params;
  
  try {
    await db.query('DELETE FROM agendamentos WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao excluir agendamento' });
  }
});

// ROTA PARA BUSCAR DETALHES DO AGENDAMENTO (ATUALIZADA)
router.get('/:id', protegerRota, async (req, res) => {
  const { id } = req.params;
  
  try {
    const [agendamentos] = await db.query(`
      SELECT a.*, s.nome as nome_servico 
      FROM agendamentos a 
      JOIN servicos s ON a.servico_id = s.id 
      WHERE a.id = ?
    `, [id]);
    
    if (agendamentos.length === 0) {
      return res.status(404).json({ message: 'Agendamento não encontrado' });
    }
    
    res.json(agendamentos[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erro ao buscar agendamento' });
  }
});

// ROTA PARA ATUALIZAR STATUS (CONCLUÍDO/PENDENTE)
router.put('/:id', protegerRota, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    await db.query('UPDATE agendamentos SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
  }
});

module.exports = router;