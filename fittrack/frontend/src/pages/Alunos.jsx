import { useState, useEffect, useCallback } from 'react';
import { alunosAPI, planosAPI, matriculasAPI } from '../services/api';

export default function Alunos() {
  const [alunos, setAlunos] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'criar' | 'editar' | 'matricula'
  const [selecionado, setSelecionado] = useState(null);
  const [form, setForm] = useState({});
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [ra, rp] = await Promise.all([alunosAPI.listar(), planosAPI.listar()]);
    setAlunos(ra.data);
    setPlanos(rp.data);
    setLoading(false);
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  function abrirCriar() {
    setForm({ nome: '', email: '', cpf: '', telefone: '', data_nascimento: '' });
    setErro(''); setSucesso('');
    setModal('criar');
  }

  function abrirEditar(aluno) {
    setSelecionado(aluno);
    setForm({ nome: aluno.nome, email: aluno.email, telefone: aluno.telefone || '', data_nascimento: aluno.data_nascimento?.slice(0, 10) || '' });
    setErro(''); setSucesso('');
    setModal('editar');
  }

  function abrirMatricula(aluno) {
    setSelecionado(aluno);
    setForm({ plano_id: planos[0]?.id || '' });
    setErro(''); setSucesso('');
    setModal('matricula');
  }

  async function salvarAluno(e) {
    e.preventDefault();
    setSalvando(true); setErro('');
    try {
      if (modal === 'criar') {
        await alunosAPI.criar(form);
        setSucesso('Aluno criado com sucesso!');
      } else {
        await alunosAPI.atualizar(selecionado.id, form);
        setSucesso('Aluno atualizado com sucesso!');
      }
      await carregar();
      setTimeout(() => setModal(null), 800);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  async function salvarMatricula(e) {
    e.preventDefault();
    setSalvando(true); setErro('');
    try {
      await matriculasAPI.criar({ aluno_id: selecionado.id, plano_id: form.plano_id });
      setSucesso('Matrícula realizada!');
      await carregar();
      setTimeout(() => setModal(null), 800);
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao matricular');
    } finally {
      setSalvando(false);
    }
  }

  async function deletar(aluno) {
    if (!confirm(`Remover ${aluno.nome}?`)) return;
    await alunosAPI.deletar(aluno.id);
    carregar();
  }

  const campo = (key, label, tipo = 'text') => (
    <div className="form-group">
      <label>{label}</label>
      <input type={tipo} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Alunos <span className="tag-db tag-postgres">PostgreSQL</span></h1>
          <p>Cadastro, matrículas e planos — banco relacional com integridade referencial</p>
        </div>
        <button className="btn btn-primary" onClick={abrirCriar}>+ Novo aluno</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <div className="spinner" />
        </div>
      ) : alunos.length === 0 ? (
        <div className="empty-state">
          <span>👥</span>
          <p>Nenhum aluno cadastrado ainda</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={abrirCriar}>Cadastrar primeiro aluno</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {alunos.map(a => (
            <div key={a.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#7c6ff722', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--accent2)', flexShrink: 0 }}>
                {a.nome.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600 }}>{a.nome}</p>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>{a.email} · CPF: {a.cpf}</p>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => abrirMatricula(a)}>🎟️ Matricular</button>
                <button className="btn btn-ghost" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => abrirEditar(a)}>✏️ Editar</button>
                <button className="btn btn-danger" style={{ fontSize: 13, padding: '7px 14px' }} onClick={() => deletar(a)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar */}
      {(modal === 'criar' || modal === 'editar') && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{modal === 'criar' ? 'Novo aluno' : 'Editar aluno'}</h2>
              <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setModal(null)}>✕</button>
            </div>
            {erro && <div className="alert alert-error">{erro}</div>}
            {sucesso && <div className="alert alert-success">{sucesso}</div>}
            <form onSubmit={salvarAluno} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-grid form-grid-2">
                {campo('nome', 'Nome completo')}
                {campo('email', 'E-mail', 'email')}
                {campo('cpf', 'CPF')}
                {campo('telefone', 'Telefone')}
                {campo('data_nascimento', 'Data de nascimento', 'date')}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Matrícula */}
      {modal === 'matricula' && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Matricular — {selecionado?.nome}</h2>
              <button className="btn btn-ghost" style={{ padding: '4px 10px' }} onClick={() => setModal(null)}>✕</button>
            </div>
            {erro && <div className="alert alert-error">{erro}</div>}
            {sucesso && <div className="alert alert-success">{sucesso}</div>}
            <form onSubmit={salvarMatricula} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Plano</label>
                <select value={form.plano_id || ''} onChange={e => setForm(f => ({ ...f, plano_id: e.target.value }))}>
                  {planos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} — R$ {parseFloat(p.preco).toFixed(2)} ({p.duracao_dias} dias)
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={salvando}>
                  {salvando ? 'Matriculando...' : 'Confirmar matrícula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
