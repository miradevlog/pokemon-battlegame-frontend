import { useEffect, useState } from 'react';
import './Roster.css';

interface Pokemon {
  id: number;
  name: string;
  currentHP?: number;
  maxHP?: number;
  stats: {
    hp: number;
    level?: number;
    exp?: number;
    [key: string]: any;
  };
}

interface RunData {
  date?: string;
  result?: string;
  roster: Pokemon[];
  badges: number;
}

export default function Roster() {
  const [activeRun, setActiveRun] = useState<RunData | null>(null);
  const [pastRuns, setPastRuns] = useState<RunData[]>([]);

  useEffect(() => {
    const savedSession = localStorage.getItem("activePokemonRun");
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        setActiveRun(parsedSession);
      } catch (err) {
        console.error("Failed to parse active run", err);
      }
    }

    const savedHistory = localStorage.getItem("pastPokemonRuns");
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setPastRuns(parsedHistory);
      } catch (err) {
        console.error("Failed to parse past runs history", err);
      }
    }
  }, []);

  const calculateScore = (roster: Pokemon[]) => {
    return roster.reduce((total, p) => total + (p.stats.exp || 0), 0);
  };

  const renderBadges = (badgeCount: number) => {
    return (
      <div className="roster-badges-group">
        <h3>Badges</h3>
        <div className="roster-badge-icons">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className={`badge-icon ${i < badgeCount ? 'active' : 'inactive'}`}
            >
              ◆
            </span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="roster-screen">
      <main className="roster-main-content">
        <header className="roster-header">
          <h1 className="roster-main-title">Trainer Rosters</h1>
        </header>

        {/* SECTION 1: Current Run */}
        <div className="roster-section">
          <h2 className="section-title">Current Run</h2>
          {!activeRun || activeRun.roster.length === 0 ? (
            <p className="empty-text">No active run found. Start a new game from the Main Menu!</p>
          ) : (
            <div className="run-container-box">
              <div className="run-top-meta">
                <span className="run-result active">In Progress</span>
              </div>

              <div className="run-sidepanel-grid">
                {/* Pokémon Roster Box (Left side) */}
                <div className="run-pokemon-box">
                  {activeRun.roster.map((p, index) => (
                    <div key={index} className="pokemon-item">
                      <img
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                        alt={p.name}
                        className="roster-sprite"
                      />
                      <span className="pokemon-name">{p.name}</span>
                      <span className="pokemon-level">Lv. {p.stats.level || 5}</span>
                      <span className="pokemon-exp">XP: {p.stats.exp || 0}</span>
                      <span className="pokemon-hp">HP: {p.currentHP ?? p.stats.hp} / {p.maxHP ?? p.stats.hp}</span>
                    </div>
                  ))}
                </div>

                {/* Badges & Score Sidebar (Right side) */}
                <div className="run-stats-sidebar">
                  {renderBadges(activeRun.badges || 0)}
                  <div className="roster-score-box">
                    <h3>Score</h3>
                    <div className="score">{calculateScore(activeRun.roster)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: Past Runs */}
        <div className="roster-section">
          <h2 className="section-title">Past Runs</h2>
          {pastRuns.length === 0 ? (
            <p className="empty-text">No past runs recorded yet.</p>
          ) : (
            <div className="history-list">
              {pastRuns.map((run, runIndex) => (
                <div key={runIndex} className="run-container-box">
                  <div className="run-top-meta">
                    <span>{run.date || 'Unknown'}</span>
                    <span className="run-result defeat">{run.result || 'Defeat'}</span>
                  </div>

                  <div className="run-sidepanel-grid">
                    {/* Pokémon Roster Box (Left side) */}
                    <div className="run-pokemon-box">
                      {run.roster.map((p, pIndex) => (
                        <div key={pIndex} className="pokemon-item">
                          <img
                            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`}
                            alt={p.name}
                            className="roster-sprite"
                          />
                          <span className="pokemon-name">{p.name}</span>
                          <span className="pokemon-level">Lv. {p.stats.level || 5}</span>
                          <span className="pokemon-exp">XP: {p.stats.exp || 0}</span>
                          <span className="pokemon-hp">HP: {p.currentHP ?? 0}</span>
                        </div>
                      ))}
                    </div>

                    {/* Badges & Score Sidebar (Right side) */}
                    <div className="run-stats-sidebar">
                      {renderBadges(run.badges || 0)}
                      <div className="roster-score-box">
                        <h3>Score</h3>
                        <div className="score">{calculateScore(run.roster)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}