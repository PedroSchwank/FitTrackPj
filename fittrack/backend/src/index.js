require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectPostgres } = require('./db/postgres');
const { connectMongo } = require('./db/mongo');
const { connectRedis } = require('./db/redis');
const errorHandler = require('./middlewares/errorHandler');

const alunosRoutes = require('./routes/alunos.routes');
const treinosRoutes = require('./routes/treinos.routes');
const performanceRoutes = require('./routes/performance.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());


app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));


app.use('/api', alunosRoutes);
app.use('/api', treinosRoutes);
app.use('/api', performanceRoutes);


app.use(errorHandler);

async function start() {
  try {
    await connectPostgres();
    await connectMongo();
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`\n FitTrack Backend rodando na porta ${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/health\n`);
    });
  } catch (err) {
    console.error('❌ Falha ao conectar bancos de dados:', err);
    process.exit(1);
  }
}

start();
