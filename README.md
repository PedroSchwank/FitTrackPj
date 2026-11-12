# FitTrackPj

## Projeto Polyglot Persistence

Sistema para academias gerenciarem alunos, planos, fichas de treino e performance, demonstrando o uso estratégico de múltiplos bancos de dados com base na natureza de cada tipo de informação.

---

# Integrantes

- Pedro de Oliveira Schwank — RA: 22.125.074-9
- Leonardo Guadagni — RA: 22.125.081-4
- Felipe Franco Falcon — RA: 22.125.073-1

---

# Objetivo Acadêmico

Este projeto tem como objetivo demonstrar a aplicação prática do conceito de **Polyglot Persistence**, utilizando diferentes modelos de banco de dados de acordo com a necessidade de cada domínio da aplicação.

A proposta busca evidenciar como diferentes tecnologias de armazenamento podem coexistir em um mesmo sistema, explorando vantagens específicas de bancos relacionais e não relacionais.

---

# Arquitetura

```text
FE (React) ←→ BE (Node.js/Express) ←→ PostgreSQL  (Alunos, Planos, Matrículas)
                                   ←→ MongoDB      (Fichas de treino)
                                   ←→ Redis        (Check-ins, Performance)
```

---

# Tema Escolhido

O sistema desenvolvido é uma plataforma de gestão de academia com três domínios principais:

- Cadastro de alunos e planos;
- Gerenciamento de fichas de treino;
- Controle de performance e check-ins.

Cada domínio possui características diferentes de armazenamento, justificando o uso de múltiplos bancos de dados.

---

# Estrutura do Sistema

## Frontend (FE)

O frontend foi desenvolvido utilizando **React + Vite**, sendo responsável pela interface do usuário e consumo da API REST do backend.

Funções do frontend:

- Cadastro de alunos;
- Gerenciamento de planos;
- Visualização de treinos;
- Registro de check-ins;
- Consulta de performance.

---

## Backend (BE)

O backend foi desenvolvido em **Node.js utilizando Express**.

Ele centraliza:

- regras de negócio;
- comunicação entre frontend e bancos de dados;
- validações;
- operações CRUD;
- gerenciamento de cache e performance.

O backend integra os três bancos de dados do sistema:

- PostgreSQL → dados relacionais;
- MongoDB → dados documentais;
- Redis → cache e dados temporais/de alta frequência.

---

# Bancos de Dados Utilizados

## PostgreSQL (Banco Relacional — RDB)

Responsável pelo armazenamento de:

- alunos;
- planos;
- matrículas.

### Justificativa

Esses dados possuem relacionamentos explícitos e exigem integridade referencial.

Exemplo:

- um aluno possui um plano;
- uma matrícula depende da existência do aluno e do plano.

O PostgreSQL foi escolhido por oferecer:

- transações ACID;
- consistência;
- suporte a relacionamentos;
- consultas SQL robustas.

---

## MongoDB (Banco NoSQL — Document Storage)

Responsável pelo armazenamento de:

- fichas de treino.

### Justificativa

Cada ficha de treino possui estrutura variável.

Exemplos:

- alguns alunos possuem exercícios simples;
- outros possuem séries complexas com observações, tempo, carga e variações.

O MongoDB foi escolhido por permitir:

- documentos flexíveis em JSON;
- fácil evolução da estrutura;
- ausência de migrations complexas;
- melhor adaptação a dados heterogêneos.

---

## Redis (Banco NoSQL — Key-Value Store)

Responsável pelo armazenamento de:

- check-ins;
- histórico de cargas;
- cache de consultas.

### Justificativa

Os dados de performance possuem:

- alta frequência de escrita;
- necessidade de baixa latência;
- consultas rápidas por chave.

O Redis foi escolhido por oferecer:

- acesso extremamente rápido em memória;
- suporte a estruturas como Sorted Sets;
- excelente desempenho para cache e séries temporais.

MongoDB e Redis foram escolhidos como bancos **NoSQL distintos**, atendendo ao requisito de Polyglot Persistence do projeto.

---

# Operações CRUD

O backend permite operações completas de CRUD para os principais módulos do sistema:

## Alunos

- Criar aluno
- Buscar aluno
- Atualizar aluno
- Remover aluno

## Planos

- Criar plano
- Buscar planos
- Atualizar plano
- Remover plano

## Treinos

- Criar ficha
- Buscar ficha
- Atualizar ficha
- Remover ficha

## Performance

- Registrar check-ins
- Registrar cargas
- Consultar evolução

---

# Endpoints da API

## Alunos (PostgreSQL)

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/alunos | Listar todos os alunos |
| GET | /api/alunos/:id | Buscar aluno por ID |
| POST | /api/alunos | Criar aluno |
| PUT | /api/alunos/:id | Atualizar aluno |
| DELETE | /api/alunos/:id | Remover aluno |

---

## Planos e Matrículas

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/planos | Listar planos |
| POST | /api/matriculas | Matricular aluno |
| GET | /api/matriculas/:aluno_id | Buscar matrícula ativa |

---

## Treinos (MongoDB)

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/treinos/:aluno_id | Listar fichas |
| GET | /api/treinos/ficha/:id | Buscar ficha |
| POST | /api/treinos | Criar ficha |
| PUT | /api/treinos/:id | Atualizar ficha |
| DELETE | /api/treinos/:id | Remover ficha |

---

## Performance (Redis)

| Método | Rota | Descrição |
|---|---|---|
| POST | /api/performance/checkin/:aluno_id | Registrar check-in |
| GET | /api/performance/checkins/:aluno_id | Histórico de visitas |
| POST | /api/performance/carga | Registrar carga |
| GET | /api/performance/carga/:aluno_id/:exercicio | Evolução de carga |
| GET | /api/performance/resumo/:aluno_id | Resumo geral |

---

# Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 + Vite |
| Backend | Node.js 20 + Express 4 |
| Banco Relacional | PostgreSQL 16 |
| Banco Documento | MongoDB 7 |
| Banco Chave-Valor | Redis 7 |
| Infraestrutura | Docker + Docker Compose |

---

# Decisões de Performance

## PostgreSQL

Índices utilizados:

- alunos.email
- matriculas.aluno_id
- matriculas.ativo

---

## MongoDB

Índice utilizado:

- treinos.aluno_id

---

## Redis

- Cache de busca de aluno por ID com TTL de 5 minutos;
- Uso de Sorted Sets para histórico temporal;
- Pipeline Redis para otimização de múltiplas operações.

---

# Como Executar o Projeto

## Pré-requisitos

- Docker instalado;
- Docker Compose instalado;
- Portas disponíveis:
  - 3000
  - 5173
  - 5432
  - 27017
  - 6379

---

# Passo a Passo

## 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/fittrack.git
cd fittrack
```

---

## 2. Subir os serviços

```bash
docker-compose up --build
```

Aguardar as mensagens:

```bash
✅ PostgreSQL conectado
✅ MongoDB conectado
✅ Redis conectado
🚀 FitTrack Backend rodando na porta 3000
```

---

## 3. Acessar o sistema

```text
Frontend: http://localhost:5173
API:      http://localhost:3000
Health:   http://localhost:3000/health
```

---

# Parar o Projeto

```bash
docker-compose down
```

---

# Resetar Todos os Dados

```bash
docker-compose down -v
```

---

# Conclusão

O projeto demonstra a aplicação do conceito de Polyglot Persistence através da integração de múltiplos bancos de dados especializados em um único sistema.

Cada tecnologia foi utilizada de acordo com as características dos dados armazenados, permitindo maior flexibilidade, desempenho e escalabilidade para a aplicação.

