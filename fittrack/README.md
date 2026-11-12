# FitTrack — Sistema de Gestão de Academia
### Projeto Polyglot Persistence

Sistema para academias gerenciarem alunos, planos, fichas de treino e performance — demonstrando o uso estratégico de três bancos de dados diferentes com base na natureza de cada dado.

---

## Arquitetura

```
FE (React) ←→ BE (Node.js/Express) ←→ PostgreSQL  (Alunos, Planos, Matrículas)
                                   ←→ MongoDB      (Fichas de treino)
                                   ←→ Redis        (Check-ins, Cargas)
```

---

## Tema escolhido

Sistema de gestão de academia com três domínios de dados bem distintos:
- **Cadastro**: dados relacionais fortemente estruturados (aluno tem plano, matrícula vincula ambos)
- **Treinos**: documentos flexíveis e heterogêneos por aluno
- **Performance**: dados de alta frequência, baixa latência, sem relacionamentos

---

## Justificativa dos bancos

### PostgreSQL (RDB)
Alunos, planos e matrículas possuem relacionamentos explícitos e requerem integridade referencial. A estrutura é fixa e bem definida — nomes, e-mails, CPFs, datas. Transações ACID garantem que uma matrícula nunca referencie um aluno ou plano inexistente. Um banco NoSQL resolveria mal esse problema pois a consistência e os joins são o centro da operação.

### MongoDB (DB1 — Document Storage)
Cada ficha de treino é estruturalmente única: um aluno pode ter 3 exercícios simples, outro 12 com campos completamente diferentes (tempo, carga, observações, variações). Forçar isso em SQL exigiria dezenas de colunas nulas ou uma modelagem complexa com tabelas de exercícios. O MongoDB armazena cada ficha como um documento JSON que evolui livremente, sem necessidade de migrations.

### Redis (DB2 — Key-Value Store)
Check-ins e histórico de carga são dados de altíssima frequência: registra-se uma entrada a cada visita, e consultas de evolução precisam ser instantâneas. O Redis responde em microssegundos, suporta Sorted Sets para séries temporais ordenadas e funciona como cache para queries pesadas do PostgreSQL. Não há relacionamentos — apenas consultas rápidas por chave.

---

## Como executar

### Pré-requisitos
- Docker e Docker Compose instalados
- Portas 3000, 5173, 5432, 27017, 6379 disponíveis

### Passo a passo

```bash
# 1. Clonar o repositório
git clone https://github.com/seu-usuario/fittrack.git
cd fittrack

# 2. Subir todos os serviços
docker-compose up --build

# Aguardar as mensagens:
# ✅ PostgreSQL conectado
# ✅ MongoDB conectado
# ✅ Redis conectado
# 🚀 FitTrack Backend rodando na porta 3000

# 3. Acessar
# Frontend:  http://localhost:5173
# API:       http://localhost:3000
# Health:    http://localhost:3000/health
```

### Parar e resetar

```bash
# Parar
docker-compose down

# Resetar todos os dados
docker-compose down -v
```

---

## Endpoints da API

### Alunos (PostgreSQL)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/alunos | Listar todos os alunos |
| GET | /api/alunos/:id | Buscar aluno por ID (com cache Redis) |
| POST | /api/alunos | Criar aluno |
| PUT | /api/alunos/:id | Atualizar aluno |
| DELETE | /api/alunos/:id | Remover aluno |
| GET | /api/planos | Listar planos disponíveis |
| POST | /api/matriculas | Matricular aluno em plano |
| GET | /api/matriculas/:aluno_id | Matrícula ativa do aluno |

### Treinos (MongoDB)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | /api/treinos/:aluno_id | Listar fichas do aluno |
| GET | /api/treinos/ficha/:id | Buscar ficha completa |
| POST | /api/treinos | Criar ficha de treino |
| PUT | /api/treinos/:id | Atualizar ficha |
| DELETE | /api/treinos/:id | Remover ficha |

### Performance (Redis)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | /api/performance/checkin/:aluno_id | Registrar entrada (1 por dia) |
| GET | /api/performance/checkins/:aluno_id | Histórico de visitas |
| POST | /api/performance/carga | Registrar carga de exercício |
| GET | /api/performance/carga/:aluno_id/:exercicio | Evolução de carga |
| GET | /api/performance/resumo/:aluno_id | Resumo geral do aluno |

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 18 + Vite + React Router |
| Backend | Node.js 20 + Express 4 |
| Banco Relacional | PostgreSQL 16 (driver: `pg`) |
| Banco Documento | MongoDB 7 (ODM: `mongoose`) |
| Banco Chave-Valor | Redis 7 (cliente: `ioredis`) |
| Infraestrutura | Docker + Docker Compose |
| Proxy | Nginx (frontend) |

---

## Decisões de performance

- **Índices PostgreSQL**: `alunos.email`, `matriculas.aluno_id`, `matriculas.ativo`
- **Índice MongoDB**: `treinos.aluno_id`
- **Cache Redis**: busca de aluno por ID tem TTL de 5 minutos; invalidado em updates
- **Pipeline Redis**: check-in e remoção de histórico antigo em uma única round-trip
- **Sorted Sets**: histórico de check-ins e cargas usa `ZRANGEBYSCORE` em O(log N)
