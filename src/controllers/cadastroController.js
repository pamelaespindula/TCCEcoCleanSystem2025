const bcrypt = require('bcrypt');
const db = require('../../config/db');

exports.renderCadastro = (req, res) => {
  res.render('cadastro', { error: null, sucesso: null, nome: '', email: '', usuario: '' });
};

exports.cadastrarFuncionario = async (req, res) => {
  const { nome, email, usuario, senha, confirmar_senha } = req.body;

  const renderCadastro = (error = null, sucesso = null) => {
    res.render('cadastro', {
      error,
      sucesso,
      nome,
      email,
      usuario
    });
  };

  // Validação básica
  if (!nome || !email || !usuario || !senha || !confirmar_senha) {
    return renderCadastro('Preencha todos os campos.', null);
  }

  if (senha !== confirmar_senha) {
    return renderCadastro('As senhas não conferem.', null);
  }

  try {
    // Verifica se já existe email ou usuário
    const [existentes] = await db.query(
      'SELECT * FROM usuarios WHERE email = ? OR usuario = ? LIMIT 1',
      [email, usuario]
    );

    if (existentes.length > 0) {
      const duplicado = existentes[0];
      if (duplicado.email === email && duplicado.usuario === usuario) {
        return renderCadastro('E-mail e usuário já cadastrados.', null);
      } else if (duplicado.email === email) {
        return renderCadastro('E-mail já cadastrado.', null);
      } else {
        return renderCadastro('Usuário já cadastrado.', null);
      }
    }

    // Criptografa a senha
    const hash = await bcrypt.hash(senha, 10);

    // Insere novo usuário
    await db.query(
      'INSERT INTO usuarios (nome, email, usuario, senha) VALUES (?, ?, ?, ?)',
      [nome, email, usuario, hash]
    );

    // Redireciona para login
    return res.redirect('/login');
  } catch (err) {
    console.error('Erro ao cadastrar funcionário:', err);
    return renderCadastro('Erro interno ao cadastrar funcionário.', null);
  }
};
