DROP DATABASE IF EXISTS ecoclean;
CREATE DATABASE ecoclean;
USE ecoclean;

-- TABELA DE USUÁRIOS (apenas administradores/dono)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  tipo ENUM('admin') DEFAULT 'admin'
);

-- TABELA DE SERVIÇOS (cadastro do que a equipe realiza)
CREATE TABLE servicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL,
  tipo VARCHAR(80),
  materiais VARCHAR(80),
  duracao TIME
);

-- Popular tabela servicos com valores iniciais
INSERT INTO servicos (nome, descricao, valor, tipo, materiais, duracao) VALUES
('Limpeza de vidro', 'Limpeza completa de vidros em geral', 59.90, 'Limpeza', 'Produtos de limpeza', '01:00:00'),
('Limpeza de ACM', 'Limpeza e manutenção de ACM', 79.90, 'Limpeza', 'Produtos de limpeza', '01:30:00'),
('Limpeza de placa solar', 'Limpeza e recuperação de eficiência', 99.90, 'Limpeza', 'Produtos de limpeza', '02:00:00'),
('Restauração de ACM', 'Recuperação e polimento de ACM danificado', 120.00, 'Restauração', 'Produtos específicos', '03:00:00');

-- TABELA DE AGENDAMENTOS (gerenciamento interno de serviços)
CREATE TABLE agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  servico_id INT NOT NULL,
  data_agendada DATE NOT NULL,
  hora_agendada TIME NOT NULL,
  status ENUM('pendente','em execução','concluído') DEFAULT 'pendente',
  quantidade INT,
  tamanho VARCHAR(45),
  observacoes VARCHAR(255),
  imagem VARCHAR(255),
  FOREIGN KEY (servico_id) REFERENCES servicos(id)
);

-- TABELA DE MATERIAIS (controle dos itens usados)
CREATE TABLE materiais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  quantidade INT NOT NULL,
  descricao VARCHAR(255)
);

-- TABELA DE USO DE MATERIAIS NOS SERVIÇOS
CREATE TABLE servico_materiais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  servico_id INT NOT NULL,
  material_id INT NOT NULL,
  quantidade_usada INT NOT NULL,
  FOREIGN KEY (servico_id) REFERENCES servicos(id),
  FOREIGN KEY (material_id) REFERENCES materiais(id)
);