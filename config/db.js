// db.js
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// Criar pool de conexões
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'ecoclean_user',
  password: process.env.DB_PASSWORD || '', // CORRIGIDO: era DB_PASS
  database: process.env.DB_NAME || 'ecoclean_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

console.log('Pool de conexões do MySQL criado com sucesso.');

// === Função genérica de query ===
async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
}

// === Funções de agendamentos ===
async function getAtendimentoById(id) {
  const sql = `
    SELECT a.*, s.nome AS nome_servico
    FROM agendamentos a
    JOIN servicos s ON a.servico_id = s.id
    WHERE a.id = ?
  `;
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function atualizarAtendimento(id, dados) {
  const sql = `
    UPDATE agendamentos
    SET data_agendada = ?, hora_agendada = ?, observacoes = ?
    WHERE id = ?
  `;
  const result = await query(sql, [
    dados.data_agendada,
    dados.hora_agendada,
    dados.observacoes,
    id
  ]);
  return result.affectedRows;
}

async function excluirAtendimento(id) {
  const sql = `DELETE FROM agendamentos WHERE id = ?`;
  const result = await query(sql, [id]);
  return result.affectedRows;
}

async function atualizarStatusAtendimento(id, status) {
  const sql = `UPDATE agendamentos SET status = ? WHERE id = ?`;
  const result = await query(sql, [status, id]);
  return result.affectedRows;
}

async function getAtendimentos() {
  const sql = `
    SELECT a.*, s.nome AS nome_servico
    FROM agendamentos a
    JOIN servicos s ON a.servico_id = s.id
    ORDER BY a.data_agendada, a.hora_agendada
  `;
  return await query(sql);
}

async function createAgendamento(data) {
  const sql = `
    INSERT INTO agendamentos (servico_id, data_agendada, hora_agendada, observacoes, status)
    VALUES (?, ?, ?, ?, ?)
  `;
  const result = await query(sql, [
    data.servico_id,
    data.data_agendada,
    data.hora_agendada,
    data.observacoes || '',
    'pendente'
  ]);
  return result.insertId;
}

// === Funções de usuários ===
async function getUserByEmail(email) {
  const sql = `SELECT * FROM usuarios WHERE email = ?`;
  const rows = await query(sql, [email]);
  return rows[0] || null;
}

async function getUserByUsuario(usuario) {
  const sql = `SELECT * FROM usuarios WHERE usuario = ? LIMIT 1`;
  const rows = await query(sql, [usuario]);
  return rows[0] || null;
}

async function createUser(data) {
  const sql = `
    INSERT INTO usuarios (nome, email, usuario, senha)
    VALUES (?, ?, ?, ?)
  `;
  const result = await query(sql, [
    data.nome,
    data.email,
    data.usuario,
    data.senha
  ]);
  return result.insertId;
}

// === Exportar tudo ===
module.exports = {
  pool,
  query,
  getAtendimentoById,
  atualizarAtendimento,
  excluirAtendimento,
  atualizarStatusAtendimento,
  getAtendimentos,
  createAgendamento,
  getUserByEmail,
  getUserByUsuario,
  createUser
};
