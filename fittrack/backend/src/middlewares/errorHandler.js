function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);

  // Erros do Postgres
  if (err.code === '23505') {
    return res.status(409).json({ erro: 'Registro duplicado', detalhe: err.detail });
  }
  if (err.code === '23503') {
    return res.status(400).json({ erro: 'Referência inválida', detalhe: err.detail });
  }

  // Erros do Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({ erro: 'Dados inválidos', detalhe: err.message });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ erro: 'ID inválido' });
  }

  res.status(500).json({ erro: 'Erro interno do servidor' });
}

module.exports = errorHandler;
