const { redis } = require('../db/redis');

// POST /api/performance/checkin/:aluno_id
async function registrarCheckin(req, res) {
  const { aluno_id } = req.params;
  const agora = Date.now();
  const hoje = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Evita check-in duplo no mesmo dia
  const jaFez = await redis.get(`checkin:${aluno_id}:${hoje}`);
  if (jaFez) {
    return res.status(409).json({ erro: 'Check-in já realizado hoje', ja_fez: true });
  }

  const pipeline = redis.pipeline();
  pipeline.setex(`checkin:${aluno_id}:${hoje}`, 86400, agora); // expira em 24h
  pipeline.zadd(`checkins:${aluno_id}`, agora, hoje);
  pipeline.zremrangebyrank(`checkins:${aluno_id}`, 0, -91); // mantém últimos 90
  await pipeline.exec();

  res.status(201).json({ mensagem: 'Check-in registrado', data: hoje, timestamp: agora });
}

// GET /api/performance/checkins/:aluno_id
async function listarCheckins(req, res) {
  const { aluno_id } = req.params;
  const dias = parseInt(req.query.dias) || 30;
  const desde = Date.now() - dias * 24 * 60 * 60 * 1000;

  const datas = await redis.zrangebyscore(`checkins:${aluno_id}`, desde, '+inf');
  const hoje = new Date().toISOString().slice(0, 10);
  const fezHoje = await redis.exists(`checkin:${aluno_id}:${hoje}`);

  res.json({ total: datas.length, fez_hoje: fezHoje === 1, checkins: datas });
}

// POST /api/performance/carga
async function registrarCarga(req, res) {
  const { aluno_id, exercicio, kg } = req.body;

  if (!aluno_id || !exercicio || kg === undefined) {
    return res.status(400).json({ erro: 'aluno_id, exercicio e kg são obrigatórios' });
  }

  const agora = Date.now();
  const chave = `carga:${aluno_id}:${exercicio.toLowerCase().replace(/\s+/g, '_')}`;

  // score = timestamp (para ordenação cronológica), value = "timestamp:kg"
  await redis.zadd(chave, agora, `${agora}:${kg}`);
  await redis.zremrangebyrank(chave, 0, -51); // mantém últimos 50 registros

  res.status(201).json({ mensagem: 'Carga registrada', exercicio, kg, timestamp: agora });
}

// GET /api/performance/carga/:aluno_id/:exercicio
async function buscarEvolucaoCarga(req, res) {
  const { aluno_id, exercicio } = req.params;
  const chave = `carga:${aluno_id}:${exercicio.toLowerCase().replace(/\s+/g, '_')}`;

  const registros = await redis.zrange(chave, 0, -1, 'WITHSCORES');

  const evolucao = [];
  for (let i = 0; i < registros.length; i += 2) {
    const [ts, kg] = registros[i].split(':');
    evolucao.push({
      data: new Date(parseInt(ts)).toISOString().slice(0, 10),
      kg: parseFloat(kg),
      timestamp: parseInt(ts),
    });
  }

  const maximo = evolucao.length > 0 ? Math.max(...evolucao.map((r) => r.kg)) : 0;

  res.json({ exercicio, maximo_kg: maximo, evolucao });
}

// GET /api/performance/resumo/:aluno_id
async function resumoAluno(req, res) {
  const { aluno_id } = req.params;

  const [checkins30, fezHoje] = await Promise.all([
    redis.zrangebyscore(`checkins:${aluno_id}`, Date.now() - 30 * 86400000, '+inf'),
    redis.exists(`checkin:${aluno_id}:${new Date().toISOString().slice(0, 10)}`),
  ]);

  // Lista todos os exercícios registrados para o aluno
  const chaves = await redis.keys(`carga:${aluno_id}:*`);
  const exercicios = chaves.map((k) => k.split(`carga:${aluno_id}:`)[1]);

  res.json({
    checkins_30_dias: checkins30.length,
    fez_hoje: fezHoje === 1,
    exercicios_registrados: exercicios,
  });
}

module.exports = { registrarCheckin, listarCheckins, registrarCarga, buscarEvolucaoCarga, resumoAluno };
