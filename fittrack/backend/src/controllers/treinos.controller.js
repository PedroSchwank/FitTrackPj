const { Treino } = require('../db/mongo');

// GET /api/treinos/:aluno_id
async function listarTreinos(req, res) {
  const treinos = await Treino.find(
    { aluno_id: req.params.aluno_id },
    { exercicios: 0 } // não retorna exercícios na listagem
  ).sort({ atualizado_em: -1 });

  res.json(treinos);
}

// GET /api/treinos/ficha/:id
async function buscarTreino(req, res) {
  const treino = await Treino.findById(req.params.id);
  if (!treino) return res.status(404).json({ erro: 'Ficha não encontrada' });
  res.json(treino);
}

// POST /api/treinos
async function criarTreino(req, res) {
  const { aluno_id, nome_treino, exercicios } = req.body;

  if (!aluno_id || !nome_treino) {
    return res.status(400).json({ erro: 'aluno_id e nome_treino são obrigatórios' });
  }

  const treino = new Treino({ aluno_id, nome_treino, exercicios: exercicios || [] });
  await treino.save();
  res.status(201).json(treino);
}

// PUT /api/treinos/:id
async function atualizarTreino(req, res) {
  const { nome_treino, exercicios } = req.body;

  const treino = await Treino.findByIdAndUpdate(
    req.params.id,
    { nome_treino, exercicios, atualizado_em: new Date() },
    { new: true, runValidators: true }
  );

  if (!treino) return res.status(404).json({ erro: 'Ficha não encontrada' });
  res.json(treino);
}

// DELETE /api/treinos/:id
async function deletarTreino(req, res) {
  const treino = await Treino.findByIdAndDelete(req.params.id);
  if (!treino) return res.status(404).json({ erro: 'Ficha não encontrada' });
  res.json({ mensagem: 'Ficha removida com sucesso' });
}

module.exports = { listarTreinos, buscarTreino, criarTreino, atualizarTreino, deletarTreino };
