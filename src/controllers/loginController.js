const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel'); 

exports.loginPage = (req, res) => {
  res.render('login', { error: null });
};

exports.login = async (req, res) => {
  const { identificador, senha } = req.body;

  const renderLogin = (error = null) => {
    res.render('login', { error });
  };

  if (!identificador || !senha) {
    return renderLogin('Preencha todos os campos.');
  }

  try {
    const usuario = await UserModel.buscarPorUsuario(identificador);

    if (!usuario) {
      return renderLogin('Usuário não encontrado.');
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return renderLogin('Senha inválida.');
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      usuario: usuario.usuario
    };

    res.redirect('/');
  } catch (err) {
    console.error(err);
    renderLogin('Erro interno. Tente novamente.');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};