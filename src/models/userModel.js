const db = require('../../config/db');

const UserModel = {
  // Busca usuário por email ou usuário (campo identificador)
  async buscarPorUsuario(identificador) {
    const [rows] = await db.query(
      'SELECT * FROM usuarios WHERE usuario = ? LIMIT 1',
      [identificador]
    );
    return rows[0];
  }
};

module.exports = UserModel;
