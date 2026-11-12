import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// ── Alunos (PostgreSQL) ──────────────────────────────
export const alunosAPI = {
  listar: () => api.get('/alunos'),
  buscar: (id) => api.get(`/alunos/${id}`),
  criar: (data) => api.post('/alunos', data),
  atualizar: (id, data) => api.put(`/alunos/${id}`, data),
  deletar: (id) => api.delete(`/alunos/${id}`),
};

export const planosAPI = {
  listar: () => api.get('/planos'),
};

export const matriculasAPI = {
  criar: (data) => api.post('/matriculas', data),
  buscar: (aluno_id) => api.get(`/matriculas/${aluno_id}`),
};

// ── Treinos (MongoDB) ────────────────────────────────
export const treinosAPI = {
  listar: (aluno_id) => api.get(`/treinos/${aluno_id}`),
  buscar: (id) => api.get(`/treinos/ficha/${id}`),
  criar: (data) => api.post('/treinos', data),
  atualizar: (id, data) => api.put(`/treinos/${id}`, data),
  deletar: (id) => api.delete(`/treinos/${id}`),
};

// ── Performance (Redis) ──────────────────────────────
export const performanceAPI = {
  checkin: (aluno_id) => api.post(`/performance/checkin/${aluno_id}`),
  checkins: (aluno_id, dias = 30) => api.get(`/performance/checkins/${aluno_id}?dias=${dias}`),
  registrarCarga: (data) => api.post('/performance/carga', data),
  evolucaoCarga: (aluno_id, exercicio) => api.get(`/performance/carga/${aluno_id}/${exercicio}`),
  resumo: (aluno_id) => api.get(`/performance/resumo/${aluno_id}`),
};
