const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Pool de conexões do MySQL criado.');

// === FUNÇÃO QUERY PARA COMPATIBILIDADE COM SEU CÓDIGO EXISTENTE ===
async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return [rows];
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
}

// === FUNÇÕES PARA AGENDAMENTOS (ATENDIMENTOS) ===

// Buscar agendamento por ID
async function getAtendimentoById(id) {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, s.nome as nome_servico 
       FROM agendamentos a 
       JOIN servicos s ON a.servico_id = s.id 
       WHERE a.id = ?`,
      [id]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Erro ao buscar agendamento por ID:', error);
    throw error;
  }
}

// Atualizar agendamento
async function atualizarAtendimento(id, dados) {
  try {
    const [result] = await pool.execute(
      'UPDATE agendamentos SET data_agendada = ?, hora_agendada = ?, observacoes = ? WHERE id = ?',
      [dados.data_agendada, dados.hora_agendada, dados.observacoes, id]
    );
    return result.affectedRows;
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    throw error;
  }
}

// Excluir agendamento
async function excluirAtendimento(id) {
  try {
    const [result] = await pool.execute(
      'DELETE FROM agendamentos WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    throw error;
  }
}

// Atualizar apenas o status
async function atualizarStatusAtendimento(id, status) {
  try {
    const [result] = await pool.execute(
      'UPDATE agendamentos SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  } catch (error) {
    console.error('Erro ao atualizar status do agendamento:', error);
    throw error;
  }
}

// Buscar todos os agendamentos
async function getAtendimentos() {
  try {
    const [rows] = await pool.execute(
      `SELECT a.*, s.nome as nome_servico 
       FROM agendamentos a 
       JOIN servicos s ON a.servico_id = s.id 
       ORDER BY a.data_agendada, a.hora_agendada`
    );
    return rows;
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    throw error;
  }
}

// Buscar usuário por email
async function getUserByEmail(email) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw error;
  }
}

// Buscar usuário por usuário (para login)
async function getUserByUsuario(usuario) {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE usuario = ? LIMIT 1',
      [usuario]
    );
    return rows[0] || null;
  } catch (error) {
    console.error('Erro ao buscar usuário por nome de usuário:', error);
    throw error;
  }
}

// Criar novo usuário
async function createUser(userData) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, email, usuario, senha) VALUES (?, ?, ?, ?)',
      [userData.nome, userData.email, userData.usuario, userData.senha]
    );
    return result.insertId;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
}

// Criar novo agendamento
async function createAgendamento(agendamentoData) {
  try {
    const [result] = await pool.execute(
      'INSERT INTO agendamentos (servico_id, data_agendada, hora_agendada, observacoes, status) VALUES (?, ?, ?, ?, ?)',
      [
        agendamentoData.servico_id,
        agendamentoData.data_agendada,
        agendamentoData.hora_agendada,
        agendamentoData.observacoes || '',
        'pendente'
      ]
    );
    return result.insertId;
  } catch (error) {
    console.error('Erro ao criar agendamento:', error);
    throw error;
  }
}

// Exportar TODAS as funções
module.exports = {
  pool,
  query,
  getAtendimentoById,
  atualizarAtendimento,
  excluirAtendimento,
  atualizarStatusAtendimento,
  getAtendimentos,
  getUserByEmail,
  getUserByUsuario,
  createUser,
  createAgendamento
};