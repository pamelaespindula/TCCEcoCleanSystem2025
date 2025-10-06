const express = require('express');
const path = require('path');
const session = require('express-session');
const db = require('./config/db');

const app = express();

// Middlewares para body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuração EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configurar sessão
app.use(session({
  secret: 'segredo_super_secreto',
  resave: false,
  saveUninitialized: false,
}));

// Middleware para proteger rotas privadas
function protegerRota(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  if (req.path === '/login' || req.path === '/logout' || req.path.startsWith('/cadastro')) {
    return next();
  }
  return res.redirect('/login');
}

// Rotas importadas
const cadastroRoutes = require('./src/routes/cadastroRoutes');
const loginRoutes = require('./src/routes/loginRoutes');
const agendamentosRoutes = require('./src/routes/agendamentosRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const atendimentosRoutes = require('./src/routes/atendimentosRoutes');
const materiaisRoutes = require('./src/routes/materiaisRoutes');

// Variáveis globais para views
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.isLoginPage = req.path === '/login' || req.path.startsWith('/cadastro');

  if (req.path === '/' || req.path.startsWith('/dashboard')) {
    res.locals.activePage = 'dashboard';
  } else if (req.path.startsWith('/agendamentos')) {
    res.locals.activePage = 'agendar';
  } else if (req.path.startsWith('/atendimentos')) {
    res.locals.activePage = 'atendimentos';
  } else if (req.path.startsWith('/materiais')) {
    res.locals.activePage = 'materiais';
  } else {
    res.locals.activePage = '';
  }
  res.locals.title = 'EcoCleanSystem';
  next();
});

// Rotas públicas
app.use('/cadastro', cadastroRoutes);
app.use('/', loginRoutes);

// ========== ROTAS AJAX PARA ATENDIMENTOS ==========

// Rota AJAX para buscar detalhes do atendimento (modal)
app.get('/atendimentos/:id', protegerRota, async (req, res) => {
  const id = req.params.id;
  try {
    const atendimento = await db.getAtendimentoById(id);
    if (!atendimento) return res.status(404).json({ error: 'Atendimento não encontrado' });
    res.json(atendimento);
  } catch (error) {
    console.error('Erro ao buscar atendimento:', error);
    res.status(500).json({ error: 'Erro ao buscar atendimento' });
  }
});

// Rota AJAX para alterar atendimento
app.put('/atendimentos/alterar', protegerRota, async (req, res) => {
  try {
    const { id, data_agendada, hora_agendada, observacoes } = req.body;
    
    const atendimento = await db.getAtendimentoById(id);
    if (!atendimento) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    const affectedRows = await db.atualizarAtendimento(id, {
      data_agendada,
      hora_agendada, 
      observacoes
    });
    
    if (affectedRows > 0) {
      res.json({ message: 'Agendamento atualizado com sucesso' });
    } else {
      res.status(500).json({ error: 'Nenhuma alteração foi feita' });
    }
  } catch (error) {
    console.error('Erro ao atualizar atendimento:', error);
    res.status(500).json({ error: 'Erro ao atualizar atendimento' });
  }
});

// Rota AJAX para excluir atendimento
app.delete('/atendimentos/:id', protegerRota, async (req, res) => {
  try {
    const id = req.params.id;
    
    const atendimento = await db.getAtendimentoById(id);
    if (!atendimento) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }
    
    const affectedRows = await db.excluirAtendimento(id);
    
    if (affectedRows > 0) {
      res.json({ message: 'Atendimento excluído com sucesso' });
    } else {
      res.status(500).json({ error: 'Nenhum atendimento foi excluído' });
    }
  } catch (error) {
    console.error('Erro ao excluir atendimento:', error);
    res.status(500).json({ error: 'Erro ao excluir atendimento' });
  }
});

// Rota AJAX para marcar como concluído/pendente (checkbox)
app.put('/atendimentos/:id', protegerRota, async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    
    const atendimento = await db.getAtendimentoById(id);
    if (!atendimento) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    const affectedRows = await db.atualizarStatusAtendimento(id, status);
    
    if (affectedRows > 0) {
      res.json({ message: 'Status atualizado com sucesso' });
    } else {
      res.status(500).json({ error: 'Nenhuma alteração foi feita' });
    }
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
});

// ========== FIM DAS ROTAS AJAX ==========

// Rotas protegidas
app.use('/agendamentos', protegerRota, agendamentosRoutes);
app.use('/dashboard', protegerRota, dashboardRoutes);
app.use('/atendimentos', protegerRota, atendimentosRoutes);
app.use('/materiais', protegerRota, materiaisRoutes);

// Redirecionar raiz para dashboard ou login conforme sessão
app.get('/', (req, res) => {
  if (req.session && req.session.usuario) {
    res.redirect('/dashboard');
  } else {
    res.redirect('/login');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Middleware 404 - Página não encontrada
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});