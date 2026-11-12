const { pool } = require('../db/postgres');
const { redis } = require('../db/redis');

const CACHE_TTL = 300; // 5 minutos

// GET /api/alunos
async function listarAlunos(req, res) {
  const result = await pool.query(
    'SELECT * FROM alunos ORDER BY criado_em DESC'
  );
  res.json(result.rows);
}

// GET /api/alunos/:id
async function buscarAluno(req, res) {
  const { id } = req.params;

  // Tenta cache Redis primeiro
  const cached = await redis.get(`cache:aluno:${id}`);
  if (cached) {
    return res.json({ ...JSON.parse(cached), _cache: true });
  }

  const result = await pool.query(
    `SELECT a.*, 
      m.id as matricula_id, m.inicio, m.fim, m.ativo,
      p.nome as plano_nome, p.preco as plano_preco
     FROM alunos a
     LEFT JOIN matriculas m ON m.aluno_id = a.id AND m.ativo = true
     LEFT JOIN planos p ON p.id = m.plano_id
     WHERE a.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  const aluno = result.rows[0];
  await redis.setex(`cache:aluno:${id}`, CACHE_TTL, JSON.stringify(aluno));
  res.json(aluno);
}

// POST /api/alunos
async function criarAluno(req, res) {
  const { nome, email, cpf, telefone, data_nascimento } = req.body;

  if (!nome || !email || !cpf) {
    return res.status(400).json({ erro: 'nome, email e cpf são obrigatórios' });
  }

  const result = await pool.query(
    `INSERT INTO alunos (nome, email, cpf, telefone, data_nascimento)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [nome, email, cpf, telefone || null, data_nascimento || null]
  );

  res.status(201).json(result.rows[0]);
}

// PUT /api/alunos/:id
async function atualizarAluno(req, res) {
  const { id } = req.params;
  const { nome, email, telefone, data_nascimento } = req.body;

  const result = await pool.query(
    `UPDATE alunos SET
       nome = COALESCE($1, nome),
       email = COALESCE($2, email),
       telefone = COALESCE($3, telefone),
       data_nascimento = COALESCE($4, data_nascimento)
     WHERE id = $5 RETURNING *`,
    [nome, email, telefone, data_nascimento, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  // Invalida cache
  await redis.del(`cache:aluno:${id}`);
  res.json(result.rows[0]);
}

// DELETE /api/alunos/:id
async function deletarAluno(req, res) {
  const { id } = req.params;

  const result = await pool.query(
    'DELETE FROM alunos WHERE id = $1 RETURNING id',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ erro: 'Aluno não encontrado' });
  }

  await redis.del(`cache:aluno:${id}`);
  res.json({ mensagem: 'Aluno removido com sucesso' });
}

// GET /api/planos
async function listarPlanos(req, res) {
  const result = await pool.query('SELECT * FROM planos ORDER BY preco');
  res.json(result.rows);
}

// POST /api/matriculas
async function criarMatricula(req, res) {
  const { aluno_id, plano_id } = req.body;

  if (!aluno_id || !plano_id) {
    return res.status(400).json({ erro: 'aluno_id e plano_id são obrigatórios' });
  }

  // Busca duração do plano
  const plano = await pool.query('SELECT * FROM planos WHERE id = $1', [plano_id]);
  if (plano.rows.length === 0) {
    return res.status(404).json({ erro: 'Plano não encontrado' });
  }

  const { duracao_dias } = plano.rows[0];
  const inicio = new Date();
  const fim = new Date();
  fim.setDate(fim.getDate() + duracao_dias);

  // Desativa matrículas anteriores
  await pool.query(
    'UPDATE matriculas SET ativo = false WHERE aluno_id = $1 AND ativo = true',
    [aluno_id]
  );

  const result = await pool.query(
    `INSERT INTO matriculas (aluno_id, plano_id, inicio, fim, ativo)
     VALUES ($1, $2, $3, $4, true) RETURNING *`,
    [aluno_id, plano_id, inicio, fim]
  );

  await redis.del(`cache:aluno:${aluno_id}`);
  res.status(201).json(result.rows[0]);
}

// GET /api/matriculas/:aluno_id
async function buscarMatricula(req, res) {
  const { aluno_id } = req.params;
  const result = await pool.query(
    `SELECT m.*, p.nome as plano_nome, p.preco, p.duracao_dias
     FROM matriculas m
     JOIN planos p ON p.id = m.plano_id
     WHERE m.aluno_id = $1 AND m.ativo = true`,
    [aluno_id]
  );
  res.json(result.rows[0] || null);
}

module.exports = {
  listarAlunos,
  buscarAluno,
  criarAluno,
  atualizarAluno,
  deletarAluno,
  listarPlanos,
  criarMatricula,
  buscarMatricula,
};
