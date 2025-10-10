const express = require('express');
const router = express.Router();
const db = require('../../config/db');

function protegerRota(req, res, next) {
  if (req.session && req.session.usuario) return next();
  return res.redirect('/login');
}

function normalizeQueryResult(result) {
  // aceita mysql2/promise ([rows, fields]) ou mysql2 (rows) ou outros formatos
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0];
  return Array.isArray(result) ? result : [];
}

// GET página formulário agendar
router.get('/agendar', protegerRota, async (req, res) => {
  try {
    const result = await db.query('SELECT id, nome FROM servicos ORDER BY nome ASC');
    const rows = normalizeQueryResult(result);
    res.render('agendar', {
      servicos: rows,
      usuario: req.session.usuario,
      activePage: 'agendar'
    });
  } catch (error) {
    console.error('Erro ao carregar página de agendar:', error);
    res.render('agendar', {
      servicos: [],
      usuario: req.session.usuario,
      activePage: 'agendar',
      error: 'Erro ao carregar serviços'
    });
  }
});

// POST formulário agendamento
router.post('/agendar', protegerRota, async (req, res) => {
  const { servico_id, data_agendada, hora_agendada, observacoes, nome_cliente, empresa, telefone } = req.body;

  if (!nome_cliente || nome_cliente.trim() === '') {
    return res.status(400).send('Nome do cliente é obrigatório');
  }

  try {
    await db.query(
      `INSERT INTO agendamentos 
       (servico_id, data_agendada, hora_agendada, observacoes, nome_cliente, empresa, telefone, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')`,
      [
        servico_id || null,
        data_agendada || null,
        hora_agendada || null,
        observacoes || '',
        nome_cliente,
        empresa || '',
        telefone || ''
      ]
    );
    return res.redirect('/atendimentos');
  } catch (err) {
    console.error('Erro ao salvar agendamento:', err);
    return res.status(500).send('Erro ao salvar agendamento');
  }
});

// GET atendimentos (lista)
router.get('/', protegerRota, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, s.nome as nome_servico 
      FROM agendamentos a 
      JOIN servicos s ON a.servico_id = s.id 
      ORDER BY a.data_agendada DESC, a.hora_agendada DESC
    `);
    const atendimentos = normalizeQueryResult(result);
    return res.render('atendimentos', {
      atendimentos,
      usuario: req.session.usuario,
      activePage: 'atendimentos'
    });
  } catch (error) {
    console.error('Erro ao buscar atendimentos:', error);
    return res.status(500).send('Erro ao carregar atendimentos');
  }
});

// API agendamentos para calendário
router.get('/api/agendamentos', protegerRota, async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.id, s.nome as title, a.data_agendada, a.hora_agendada, 
             a.nome_cliente, a.empresa, a.telefone, a.observacoes,
             s.nome as nome_servico
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      ORDER BY a.data_agendada, a.hora_agendada
    `);
    const agendamentos = normalizeQueryResult(result);
    const eventos = agendamentos.map(ag => {
      const date = ag.data_agendada instanceof Date
        ? ag.data_agendada.toISOString().split('T')[0]
        : (ag.data_agendada || '');
      const time = ag.hora_agendada ? String(ag.hora_agendada).slice(0,5) : '';
      return {
        id: ag.id,
        title: ag.title,
        date,
        time,
        nome_cliente: ag.nome_cliente,
        empresa: ag.empresa,
        telefone: ag.telefone,
        observacoes: ag.observacoes,
        nome_servico: ag.nome_servico
      };
    });
    return res.json(eventos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos para API:', error);
    return res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
  }
});

// Detalhes do agendamento
router.get('/:id', protegerRota, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT a.*, s.nome as nome_servico 
      FROM agendamentos a 
      JOIN servicos s ON a.servico_id = s.id 
      WHERE a.id = ?
    `, [id]);
    const rows = normalizeQueryResult(result);
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Agendamento não encontrado' });
    return res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar agendamento:', error);
    return res.status(500).json({ message: 'Erro ao buscar agendamento' });
  }
});

// Atualizar status
router.put('/:id', protegerRota, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query('UPDATE agendamentos SET status = ? WHERE id = ?', [status, id]);
    return res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
  }
});

// Alterar agendamento
router.put('/alterar', protegerRota, async (req, res) => {
  const { id, data_agendada, hora_agendada, observacoes } = req.body;
  try {
    await db.query(
      'UPDATE agendamentos SET data_agendada = ?, hora_agendada = ?, observacoes = ? WHERE id = ?',
      [data_agendada || null, hora_agendada || null, observacoes || '', id]
    );
    return res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    return res.status(500).json({ success: false, message: 'Erro ao atualizar agendamento' });
  }
});

// Excluir agendamento
router.delete('/:id', protegerRota, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM agendamentos WHERE id = ?', [id]);
    return res.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    return res.status(500).json({ success: false, message: 'Erro ao excluir agendamento' });
  }
});

module.exports = router;
