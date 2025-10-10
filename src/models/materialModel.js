// src/models/materialModel.js
const db = require('../../config/db');

function normalizeQueryResult(result) {
  if (Array.isArray(result) && Array.isArray(result[0])) return result[0];
  if (Array.isArray(result)) return result;
  return result;
}

module.exports = {
  async listarTodos() {
    const result = await db.query('SELECT id, nome, quantidade FROM materiais ORDER BY nome ASC');
    return normalizeQueryResult(result);
  },

  async buscarPorId(id) {
    const result = await db.query('SELECT id, nome, quantidade FROM materiais WHERE id = ?', [id]);
    const rows = normalizeQueryResult(result);
    return Array.isArray(rows) ? rows[0] : rows;
  },

  async criar({ nome, quantidade = 0 }) {
    const qtd = Number.isFinite(Number(quantidade)) ? Number(quantidade) : 0;
    const result = await db.query(
      'INSERT INTO materiais (nome, quantidade) VALUES (?, ?)',
      [String(nome).trim(), qtd]
    );
    if (Array.isArray(result) && result[0] && result[0].insertId) return result[0].insertId;
    if (result && result.insertId) return result.insertId;
    return null;
  },

  async atualizar(id, { nome, quantidade = 0 }) {
    const qtd = Number.isFinite(Number(quantidade)) ? Number(quantidade) : 0;
    await db.query('UPDATE materiais SET nome = ?, quantidade = ? WHERE id = ?', [String(nome).trim(), qtd, id]);
    return true;
  },

  async deletar(id) {
    await db.query('DELETE FROM materiais WHERE id = ?', [id]);
    return true;
  }
};
