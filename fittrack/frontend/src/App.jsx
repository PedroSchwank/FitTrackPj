import { Routes, Route, NavLink } from 'react-router-dom';
import Alunos from './pages/Alunos';
import Treinos from './pages/Treinos';
import Performance from './pages/Performance';
import './App.css';

export default function App() {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">💪</span>
          <span className="logo-text">FitTrack</span>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span>👥</span> Alunos
            <span className="tag-db tag-postgres">PostgreSQL</span>
          </NavLink>
          <NavLink to="/treinos" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span>🏋️</span> Treinos
            <span className="tag-db tag-mongo">MongoDB</span>
          </NavLink>
          <NavLink to="/performance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
            <span>📊</span> Performance
            <span className="tag-db tag-redis">Redis</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <p>Polyglot Persistence</p>
          <p>PG · Mongo · Redis</p>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Alunos />} />
          <Route path="/treinos" element={<Treinos />} />
          <Route path="/performance" element={<Performance />} />
        </Routes>
      </main>
    </div>
  );
}
