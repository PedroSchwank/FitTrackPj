import { useState, useEffect, useCallback } from 'react';
import { alunosAPI, treinosAPI } from '../services/api';

const GRUPOS = ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Glúteos', 'Abdômen', 'Cardio'];

const exercicioVazio = () => ({ nome: '', grupo_muscular: 'Peito', series: 3, repeticoes: 10, descanso_seg: 60, observacoes: '' });

export default function Treinos() {
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState('');
  const [treinos, setTreinos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
  const [selecionado, setSelecionado] = useState(null);
  const [form, setForm] = useState({ nome_treino: '', exercicios: [exercicioVazio()] });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    alunosAPI.listar().then(r => setAlunos(r.data));
  }, []);

  const carregarTreinos = useCallback(async () => {
    if (!alunoId) return;
    setLoading(true);
    const r = await treinosAPI.listar(alunoId);
    setTreinos(r.data);
    setLoading(false);
  }, [alunoId]);

  useEffect(() => { carregarTreinos(); }, [carregarTreinos]);

  function abrirCriar() {
    setForm({ nome_treino: '', exercicios: [exercicioVazio()] });
    setErro(''); setSucesso('');
    setModal('criar');
  }

  async function abrirEditar(id) {
    const r = await treinosAPI.buscar(id);
    setSelecionado(r.data);
    setForm({ nome_treino: r.data.nome_treino, exercicios: r.data.exercicios });
    setErro(''); setSucesso('');
    setModal('editar');
  }

  function setExercicio(i, key, val) {
    setForm(f => {
      const exs = [...f.exercicios];
      exs[i] = { ...exs[i], [key]: val };
      return { ...f, exercicios: exs };
    });
  }

  function addExercicio() {
    setForm(f => ({ ...f, exercicios: [...f.exercicios, exercicioVazio()] }));
  }

  function removeExercicio(i) {
    setForm(f => ({ ...f, exercicios: f.exercicios.filter((_, idx) => idx !== i) }));
  }

  async function salvar(e) {
    e.preventDefault();
    if (!alunoId) return setErro('Selecione um aluno antes');
    setSalvando(true); setErro('');
    try {
      if (modal === 'criar') {
        await treinosAPI.criar({ aluno_id: alunoId, ...form });
        setSucesso('Ficha criada!');
      } else {
        await treinosAPI.atualizar(selecionado._id, form);
        setSucesso('Ficha atualizada!');
      }
      await carregarTreinos();
      setTimeout(() => setModal(null), 700);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  async function deletar(id) {
    if (!confirm('Remover esta ficha?')) return;
    await treinosAPI.deletar(id);
    carregarTreinos();
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Treinos <span className="tag-db tag-mongo">MongoDB</span></h1>
          <p>Fichas personalizadas por aluno — schema flexível, sem migrations</p>
        </div>
        <button className="btn btn-primary" onClick={abrirCriar} disabled={!alunoId}>+ Nova ficha</button>
      </div>

      {/* Seletor de aluno */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="form-group">
          <label>Selecionar aluno</label>
          <select value={alunoId} onChange={e => setAlunoId(e.target.value)}>
            <option value="">— escolha um aluno —</option>
            {alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </div>
      </div>

      {!alunoId ? (
        <div className="empty-state"><span>🏋️</span><p>Selecione um aluno para ver as fichas</p></div>
      ) : loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : treinos.length === 0 ? (
        <div className="empty-state">
          <span>📋</span>
          <p>Nenhuma ficha criada ainda</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={abrirCriar}>Criar primeira ficha</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {treinos.map(t => (
            <div key={t._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600 }}>{t.nome_treino}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                  Atualizado em {new Date(t.atualizado_em).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => abrirEditar(t._id)}>✏️ Editar</button>
                <button className="btn btn-danger" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => deletar(t._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {(modal === 'criar' || modal === 'editar') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 680 }}>
            <div className="modal-header">
              <h2>{modal === 'criar' ? 'Nova ficha de treino' : 'Editar ficha'}</h2>
              <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setModal(null)}>✕</button>
            </div>
            {erro && <div className="alert alert-error">{erro}</div>}
            {sucesso && <div className="alert alert-success">{sucesso}</div>}
            <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="form-group">
                <label>Nome da ficha</label>
                <input value={form.nome_treino} onChange={e => setForm(f => ({ ...f, nome_treino: e.target.value }))} placeholder="ex: Treino A — Peito e Tríceps" required />
              </div>

              <div>
                <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>
                  EXERCÍCIOS ({form.exercicios.length})
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {form.exercicios.map((ex, i) => (
                    <div key={i} className="card" style={{ background: 'var(--bg3)', borderStyle: 'dashed' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent2)' }}>#{i + 1}</p>
                        {form.exercicios.length > 1 && (
                          <button type="button" className="btn btn-danger" style={{ fontSize: 12, padding: '3px 10px' }} onClick={() => removeExercicio(i)}>remover</button>
                        )}
                      </div>
                      <div className="form-grid form-grid-2" style={{ gap: 12 }}>
                        <div className="form-group">
                          <label>Nome do exercício</label>
                          <input value={ex.nome} onChange={e => setExercicio(i, 'nome', e.target.value)} placeholder="ex: Supino Reto" required />
                        </div>
                        <div className="form-group">
                          <label>Grupo muscular</label>
                          <select value={ex.grupo_muscular} onChange={e => setExercicio(i, 'grupo_muscular', e.target.value)}>
                            {GRUPOS.map(g => <option key={g}>{g}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Séries</label>
                          <input type="number" min="1" value={ex.series} onChange={e => setExercicio(i, 'series', +e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Repetições</label>
                          <input type="number" min="1" value={ex.repeticoes} onChange={e => setExercicio(i, 'repeticoes', +e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Descanso (segundos)</label>
                          <input type="number" min="0" value={ex.descanso_seg} onChange={e => setExercicio(i, 'descanso_seg', +e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>Observações</label>
                          <input value={ex.observacoes} onChange={e => setExercicio(i, 'observacoes', e.target.value)} placeholder="opcional" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-ghost" style={{ marginTop: 12, width: '100%' }} onClick={addExercicio}>
                  + Adicionar exercício
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar ficha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
