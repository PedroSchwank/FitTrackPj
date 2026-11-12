-- FitTrack - Schema PostgreSQL

CREATE TABLE IF NOT EXISTS planos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco NUMERIC(8,2) NOT NULL,
  duracao_dias INT NOT NULL,
  descricao TEXT,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alunos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  cpf VARCHAR(14) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  data_nascimento DATE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matriculas (
  id SERIAL PRIMARY KEY,
  aluno_id INT REFERENCES alunos(id) ON DELETE CASCADE,
  plano_id INT REFERENCES planos(id),
  inicio DATE NOT NULL,
  fim DATE NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_ativo ON matriculas(ativo);
CREATE INDEX IF NOT EXISTS idx_alunos_email ON alunos(email);

-- Dados iniciais - planos
INSERT INTO planos (nome, preco, duracao_dias, descricao) VALUES
  ('Mensal', 99.90, 30, 'Acesso completo por 30 dias'),
  ('Trimestral', 249.90, 90, 'Acesso completo por 90 dias com desconto'),
  ('Semestral', 449.90, 180, 'Acesso completo por 6 meses com melhor custo-benefício')
ON CONFLICT DO NOTHING;
