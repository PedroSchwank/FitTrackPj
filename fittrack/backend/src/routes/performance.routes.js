const express = require('express');
const router = express.Router();
const c = require('../controllers/performance.controller');

router.post('/performance/checkin/:aluno_id', c.registrarCheckin);
router.get('/performance/checkins/:aluno_id', c.listarCheckins);
router.post('/performance/carga', c.registrarCarga);
router.get('/performance/carga/:aluno_id/:exercicio', c.buscarEvolucaoCarga);
router.get('/performance/resumo/:aluno_id', c.resumoAluno);

module.exports = router;
