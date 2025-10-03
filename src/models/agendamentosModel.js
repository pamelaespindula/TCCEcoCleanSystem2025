const db = require('../../config/db');

const AgendamentoModel = {
  async buscarServicoPorNome(nome) {
    return db.query('SELECT id FROM servicos WHERE nome = ?', [nome]);
  },

  async criar(agendamento) {
    const { servico_id, data_agendada, hora_agendada, quantidade, tamanho, observacoes, status } = agendamento;

    const [result] = await db.query(
      `INSERT INTO agendamentos 
       (servico_id, data_agendada, hora_agendada, quantidade, tamanho, observacoes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        servico_id,
        data_agendada,
        hora_agendada,
        quantidade || 1,
        tamanho || '',
        observacoes || '',
        status || 'pendente'
      ]
    );
    return result.insertId;
  },

  async listarPorData(data) {
    const [rows] = await db.query(
      `SELECT a.*, s.nome as nome_servico 
       FROM agendamentos a 
       JOIN servicos s ON a.servico_id = s.id 
       WHERE a.data_agendada = ?`,
      [data]
    );
    return rows;
  }
};

module.exports = AgendamentoModel;