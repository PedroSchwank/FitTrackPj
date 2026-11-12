const express = require('express');
const router = express.Router();
const c = require('../controllers/alunos.controller');

router.get('/alunos', c.listarAlunos);
router.get('/alunos/:id', c.buscarAluno);
router.post('/alunos', c.criarAluno);
router.put('/alunos/:id', c.atualizarAluno);
router.delete('/alunos/:id', c.deletarAluno);

router.get('/planos', c.listarPlanos);

router.post('/matriculas', c.criarMatricula);
router.get('/matriculas/:aluno_id', c.buscarMatricula);

module.exports = router;
