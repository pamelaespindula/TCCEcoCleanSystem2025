const db = require('../../config/db');

const UserModel = {
  // Busca usuário por nome de usuário (identificador)
  async buscarPorUsuario(identificador) {
    try {
      const rows = await db.query(
        'SELECT * FROM usuarios WHERE usuario = ? LIMIT 1',
        [identificador]
      );
      return rows?.[0] || null;
    } catch (error) {
      console.error('Erro ao buscar usuário por nome de usuário:', error);
      return null;
    }
  }
};

module.exports = UserModel;
