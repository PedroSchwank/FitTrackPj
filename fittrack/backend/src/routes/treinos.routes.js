const express = require('express');
const router = express.Router();
const c = require('../controllers/treinos.controller');

router.get('/treinos/:aluno_id', c.listarTreinos);
router.get('/treinos/ficha/:id', c.buscarTreino);
router.post('/treinos', c.criarTreino);
router.put('/treinos/:id', c.atualizarTreino);
router.delete('/treinos/:id', c.deletarTreino);

module.exports = router;
