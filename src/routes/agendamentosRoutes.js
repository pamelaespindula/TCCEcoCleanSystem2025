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
    console.error('Erro ao carregar página de agendar:', error);
    res.status(500).send('Erro ao carregar página de agendar');
  }
});

// POST formulário agendamento (ATUALIZADO COM NOVOS CAMPOS)
router.post('/agendar', protegerRota, async (req, res) => {
  const { servico_id, data_agendada, hora_agendada, observacoes, nome_cliente, empresa, telefone } = req.body;

  // VALIDAÇÃO: Verifica se nome_cliente foi enviado
  if (!nome_cliente || nome_cliente.trim() === '') {
    return res.status(400).send('Nome do cliente é obrigatório');
  }

  try {
    await db.query(
      `INSERT INTO agendamentos 
       (servico_id, data_agendada, hora_agendada, observacoes, nome_cliente, empresa, telefone, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')`,
      [servico_id, data_agendada, hora_agendada, observacoes || '', nome_cliente, empresa || '', telefone || '']
    );
    res.redirect('/atendimentos');
  } catch (err) {
    console.error('Erro ao salvar agendamento:', err);
    res.status(500).send('Erro ao salvar agendamento');
  }
});

// GET todos os atendimentos para a página de checklist
router.get('/', protegerRota, async (req, res) => {
  try {
    const [atendimentos] = await db.query(`
      SELECT a.*, s.nome as nome_servico 
      FROM agendamentos a 
      JOIN servicos s ON a.servico_id = s.id 
      ORDER BY a.data_agendada DESC, a.hora_agendada DESC
    `);
    
    res.render('atendimentos', {
      atendimentos,
      usuario: req.session.usuario,
      activePage: 'atendimentos'
    });
  } catch (error) {
    console.error('Erro ao buscar atendimentos:', error);
    res.status(500).send('Erro ao carregar atendimentos');
  }
});

// API GET agendamentos em JSON formatado para calendário (ATUALIZADO COM TODOS OS CAMPOS)
router.get('/api/agendamentos', protegerRota, async (req, res) => {
  try {
    const [agendamentos] = await db.query(`
      SELECT a.id, s.nome as title, a.data_agendada, a.hora_agendada, 
             a.nome_cliente, a.empresa, a.telefone, a.observacoes,
             s.nome as nome_servico
      FROM agendamentos a
      JOIN servicos s ON a.servico_id = s.id
      ORDER BY a.data_agendada, a.hora_agendada
    `);

    const eventos = agendamentos.map(ag => ({
      id: ag.id,
      title: ag.title,
      date: ag.data_agendada.toISOString().split('T')[0],
      time: ag.hora_agendada ? ag.hora_agendada.slice(0,5) : '',
      nome_cliente: ag.nome_cliente,
      empresa: ag.empresa,
      telefone: ag.telefone,
      observacoes: ag.observacoes,
      nome_servico: ag.nome_servico
    }));

    res.json(eventos);
  } catch (error) {
    console.error('Erro ao buscar agendamentos para API:', error);
    res.status(500).json({ erro: 'Erro ao buscar agendamentos' });
  }
});

// ROTA PARA BUSCAR DETALHES DO AGENDAMENTO
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
    console.error('Erro ao buscar agendamento:', error);
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
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ success: false, message: 'Erro ao atualizar status' });
  }
});

// ROTA PARA ALTERAR AGENDAMENTO
router.put('/alterar', protegerRota, async (req, res) => {
  const { id, data_agendada, hora_agendada, observacoes } = req.body;
  
  try {
    await db.query(
      'UPDATE agendamentos SET data_agendada = ?, hora_agendada = ?, observacoes = ? WHERE id = ?',
      [data_agendada, hora_agendada, observacoes, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
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
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ success: false, message: 'Erro ao excluir agendamento' });
  }
});

module.exports = router;