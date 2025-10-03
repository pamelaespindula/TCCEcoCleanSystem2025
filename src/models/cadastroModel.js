const db = require('../../config/db');

const CadastroModel = {
  async criar(cadastro) {
    const [result] = await db.query(
      `INSERT INTO usuarios (nome, email, usuario, senha)
       VALUES (?, ?, ?, ?)`,
      [cadastro.nome, cadastro.email, cadastro.usuario, cadastro.senha]
    );
    return result.insertId;
  }
};

module.exports = CadastroModel;
