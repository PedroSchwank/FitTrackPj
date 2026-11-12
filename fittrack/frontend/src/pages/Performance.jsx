import { useState, useEffect, useCallback } from 'react';
import { alunosAPI, performanceAPI } from '../services/api';

export default function Performance() {
  const [alunos, setAlunos] = useState([]);
  const [alunoId, setAlunoId] = useState('');
  const [resumo, setResumo] = useState(null);
  const [checkins, setCheckins] = useState(null);
  const [evolucao, setEvolucao] = useState(null);
  const [exercicio, setExercicio] = useState('');
  const [novaExercicio, setNovaExercicio] = useState('');
  const [novaKg, setNovaKg] = useState('');
  const [loadingCheckin, setLoadingCheckin] = useState(false);
  const [loadingCarga, setLoadingCarga] = useState(false);
  const [msgCheckin, setMsgCheckin] = useState('');
  const [msgCarga, setMsgCarga] = useState('');

  useEffect(() => { alunosAPI.listar().then(r => setAlunos(r.data)); }, []);

  const carregarResumo = useCallback(async () => {
    if (!alunoId) return;
    const [r, c] = await Promise.all([
      performanceAPI.resumo(alunoId),
      performanceAPI.checkins(alunoId, 30),
    ]);
    setResumo(r.data);
    setCheckins(c.data);
    setEvolucao(null);
    setExercicio('');
  }, [alunoId]);

  useEffect(() => { carregarResumo(); }, [carregarResumo]);

  async function fazerCheckin() {
    setLoadingCheckin(true); setMsgCheckin('');
    try {
      await performanceAPI.checkin(alunoId);
      setMsgCheckin('✅ Check-in registrado!');
      carregarResumo();
    } catch (err) {
      const msg = err.response?.data?.erro || 'Erro';
      setMsgCheckin(err.response?.status === 409 ? '⚠️ Check-in já realizado hoje' : `❌ ${msg}`);
    } finally {
      setLoadingCheckin(false);
    }
  }

  async function registrarCarga(e) {
    e.preventDefault();
    if (!novaExercicio || !novaKg) return;
    setLoadingCarga(true); setMsgCarga('');
    try {
      await performanceAPI.registrarCarga({ aluno_id: alunoId, exercicio: novaExercicio, kg: parseFloat(novaKg) });
      setMsgCarga(`✅ ${novaKg}kg registrado em ${novaExercicio}`);
      setNovaKg('');
      if (exercicio === novaExercicio) buscarEvolucao(novaExercicio);
      await carregarResumo();
    } catch (err) {
      setMsgCarga('❌ ' + (err.response?.data?.erro || 'Erro'));
    } finally {
      setLoadingCarga(false);
    }
  }

  async function buscarEvolucao(ex) {
    if (!ex) return;
    setExercicio(ex);
    const r = await performanceAPI.evolucaoCarga(alunoId, ex);
    setEvolucao(r.data);
  }

  // Mini gráfico de barras em CSS
  function MiniChart({ dados }) {
    if (!dados || dados.length === 0) return <p style={{ color: 'var(--muted)', fontSize: 13 }}>Nenhum registro ainda</p>;
    const max = Math.max(...dados.map(d => d.kg));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
        {dados.slice(-10).map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)', width: 80, flexShrink: 0 }}>{d.data}</span>
            <div style={{ flex: 1, background: 'var(--bg3)', borderRadius: 4, height: 20, position: 'relative' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${(d.kg / max) * 100}%`,
                background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, width: 50, textAlign: 'right', flexShrink: 0 }}>{d.kg}kg</span>
          </div>
        ))}
      </div>
    );
  }

  // Calendário de check-ins (últimos 30 dias)
  function CheckinCalendar({ checkins }) {
    const hoje = new Date();
    const dias = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(hoje);
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().slice(0, 10);
    });
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 6, marginTop: 12 }}>
        {dias.map(d => (
          <div key={d} title={d} style={{
            width: '100%', paddingBottom: '100%', borderRadius: 4, position: 'relative',
            background: checkins?.includes(d) ? 'var(--green)' : 'var(--bg3)',
            border: d === hoje.toISOString().slice(0, 10) ? '2px solid var(--accent)' : '1px solid var(--border)',
          }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Performance <span className="tag-db tag-redis">Redis</span></h1>
          <p>Check-ins e evolução de cargas — dados de alta frequência com latência mínima</p>
        </div>
      </div>

      {/* Seletor */}
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
        <div className="empty-state"><span>📊</span><p>Selecione um aluno para ver a performance</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Resumo + Check-in */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="card">
              <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 16 }}>RESUMO — ÚLTIMOS 30 DIAS</p>
              <div style={{ display: 'flex', gap: 20, marginBottom: 16 }}>
                <div>
                  <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent2)' }}>{resumo?.checkins_30_dias ?? '—'}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>visitas</p>
                </div>
                <div>
                  <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--green)' }}>{resumo?.exercicios_registrados?.length ?? '—'}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>exercícios</p>
                </div>
              </div>
              <span className={`badge ${resumo?.fez_hoje ? 'badge-green' : 'badge-red'}`}>
                {resumo?.fez_hoje ? '✅ Veio hoje' : '❌ Não veio hoje'}
              </span>
            </div>

            <div className="card">
              <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>CHECK-IN</p>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
                Registra presença no Redis — 1 por dia por aluno
              </p>
              {msgCheckin && <div className="alert" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', marginBottom: 12 }}>{msgCheckin}</div>}
              <button
                className="btn btn-success"
                style={{ width: '100%', padding: '14px' }}
                onClick={fazerCheckin}
                disabled={loadingCheckin}
              >
                {loadingCheckin ? '⏳ Registrando...' : '🏃 Registrar entrada'}
              </button>
            </div>
          </div>

          {/* Calendário de check-ins */}
          <div className="card">
            <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>CALENDÁRIO DE PRESENÇA — 30 DIAS</p>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>Verde = presente · Bordado roxo = hoje</p>
            <CheckinCalendar checkins={checkins?.checkins} />
          </div>

          {/* Registrar carga */}
          <div className="card">
            <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 16 }}>REGISTRAR CARGA</p>
            {msgCarga && <div className="alert" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', marginBottom: 12 }}>{msgCarga}</div>}
            <form onSubmit={registrarCarga} style={{ display: 'grid', gridTemplateColumns: '1fr 120px auto', gap: 12, alignItems: 'end' }}>
              <div className="form-group">
                <label>Exercício</label>
                <input value={novaExercicio} onChange={e => setNovaExercicio(e.target.value)} placeholder="ex: Supino Reto" required />
              </div>
              <div className="form-group">
                <label>Carga (kg)</label>
                <input type="number" min="0" step="0.5" value={novaKg} onChange={e => setNovaKg(e.target.value)} placeholder="80" required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loadingCarga}>
                {loadingCarga ? '...' : 'Registrar'}
              </button>
            </form>
          </div>

          {/* Evolução de carga */}
          {resumo?.exercicios_registrados?.length > 0 && (
            <div className="card">
              <p style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, marginBottom: 16 }}>EVOLUÇÃO DE CARGA</p>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Ver evolução de:</label>
                <select value={exercicio} onChange={e => buscarEvolucao(e.target.value)}>
                  <option value="">— selecione um exercício —</option>
                  {resumo.exercicios_registrados.map(ex => (
                    <option key={ex} value={ex}>{ex.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
              {evolucao && (
                <>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <span className="badge badge-purple">
                      Máximo: {evolucao.maximo_kg}kg
                    </span>
                    <span className="badge badge-amber">
                      {evolucao.evolucao.length} registros
                    </span>
                  </div>
                  <MiniChart dados={evolucao.evolucao} />
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
