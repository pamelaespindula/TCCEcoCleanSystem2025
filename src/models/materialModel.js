const db = require('../../config/db');

const MaterialModel = {
  async listarTodos() {
    const [rows] = await db.query('SELECT * FROM materiais ORDER BY nome ASC');
    return rows;
  },

  async criar({ nome, quantidade }) {
    const [result] = await db.query(
      'INSERT INTO materiais (nome, quantidade) VALUES (?, ?)',
      [nome, quantidade]
    );
    return result.insertId;
  },

  async atualizar(id, { nome, quantidade }) {
    await db.query(
      'UPDATE materiais SET nome = ?, quantidade = ? WHERE id = ?',
      [nome, quantidade, id]
    );
  },

  async deletar(id) {
    await db.query('DELETE FROM materiais WHERE id = ?', [id]);
  }
};

module.exports = MaterialModel;
