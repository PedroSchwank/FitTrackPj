const mongoose = require('mongoose');

const TreinoSchema = new mongoose.Schema({
  aluno_id: { type: String, required: true, index: true },
  nome_treino: { type: String, required: true },
  exercicios: [
    {
      nome: { type: String, required: true },
      grupo_muscular: String,
      series: Number,
      repeticoes: Number,
      descanso_seg: Number,
      observacoes: String,
    },
  ],
  criado_em: { type: Date, default: Date.now },
  atualizado_em: { type: Date, default: Date.now },
});

TreinoSchema.pre('save', function (next) {
  this.atualizado_em = new Date();
  next();
});

const Treino = mongoose.model('Treino', TreinoSchema);

async function connectMongo() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB conectado');
}

module.exports = { Treino, connectMongo };
