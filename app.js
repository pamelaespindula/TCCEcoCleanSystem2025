const express = require('express');
const path = require('path');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const db = require('./config/db');

const app = express();

// Middlewares para body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuração EJS e layout
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

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
  res.locals.isLoginPage = req.path === '/login' || req.path === '/cadastro';

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

// Rota login com redirecionamento para dashboard se já logado
app.get('/login', (req, res) => {
  if (req.session && req.session.usuario) {
    return res.redirect('/dashboard');
  }
  res.render('login', { title: 'Login - EcoCleanSystem', activePage: '' });
});

// Recebe login POST - Exemplo básico (ajuste conforme sua lógica)
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  // Valide usuário e senha aqui com db
  const usuarioValido = true; // Substitua pela validação real

  if (usuarioValido) {
    req.session.usuario = { nome: username }; // Armazene dados do usuário na sessão
    return res.redirect('/dashboard');
  } else {
    return res.render('login', { title: 'Login', error: 'Usuário ou senha inválidos' });
  }
});

app.use('/agendamentos', protegerRota, agendamentosRoutes);
app.use('/dashboard', protegerRota, dashboardRoutes);
app.use('/atendimentos', protegerRota, atendimentosRoutes);
app.use('/materiais', protegerRota, materiaisRoutes);

// Redirecionar raiz para dashboard via GET
app.get('/', (req, res) => res.redirect('/dashboard'));

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Middleware 404 - erro simples
app.use((req, res) => {
  res.status(404).send('Página não encontrada.');
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
