const bcrypt = require('bcrypt');
const db = require('../../config/db'); 

exports.renderCadastro = (req, res) => {
  res.render('cadastro', { error: null, sucesso: null });
};

exports.cadastrarFuncionario = async (req, res) => {
  const { nome, email, usuario, senha, confirmar_senha } = req.body;

  // Função para renderizar a tela de cadastro com mensagens
  const renderCadastro = (error = null, sucesso = null) => {
    res.render('cadastro', { error, sucesso });
  };

  if (!nome || !email || !usuario || !senha || !confirmar_senha) {
    return renderCadastro('Preencha todos os campos.', null);
  }

  if (senha !== confirmar_senha) {
    return renderCadastro('As senhas não conferem.', null);
  }

  try {
    // Verifica se já existe cadastro com email ou usuario (usa pool direto!)
    const [results] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? OR usuario = ? LIMIT 1',
      [email, usuario]
    );

    if (results.length > 0) {
      return renderCadastro('Já existe um funcionário com este email ou usuário.', null);
    }

    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      'INSERT INTO usuarios (nome, email, usuario, senha) VALUES (?, ?, ?, ?)',
      [nome, email, usuario, hash]
    );

    // Cadastro realizado com sucesso: redireciona para login
    return res.redirect('/login');
  } catch (err) {
    console.error(err);
    return renderCadastro('Erro ao cadastrar funcionário.', null);
  }
};
