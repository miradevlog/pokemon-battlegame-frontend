import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  trainerName?: string;
  date?: string;
  result?: string;
  roster: Pokemon[];
  badges: number;
}

export default function Leaderboard() {
  const [leaderboardRuns, setLeaderboardRuns] = useState<RunData[]>([]);
  
  const currentUsername = localStorage.getItem("username") || localStorage.getItem("user") || "Trainer";

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const savedHistory = localStorage.getItem("pastPokemonRuns");
        if (savedHistory) {
          const parsedHistory: RunData[] = JSON.parse(savedHistory);
          
          const runsWithUser = parsedHistory.map(run => ({
            ...run,
            trainerName: run.trainerName || currentUsername
          }));

          const sortedBestRuns = runsWithUser.sort((a, b) => calculateScore(b.roster) - calculateScore(a.roster));
          setLeaderboardRuns(sortedBestRuns);
        }
      } catch (err) {
        console.error("Failed to load leaderboard", err);
      }
    };

    fetchLeaderboard();
  }, [currentUsername]);

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
        <header className="roster-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="roster-main-title">Server Leaderboard</h1>
          <Link to="/roster" className="back-btn" style={{ textDecoration: 'none' }}>
            View My Roster →
          </Link>
        </header>

        <div className="roster-section">
          <h2 className="section-title">Top Server Runs & Rosters</h2>
          {leaderboardRuns.length === 0 ? (
            <p className="empty-text">No leaderboard runs recorded yet. Complete a run to make the board!</p>
          ) : (
            <div className="history-list">
              {leaderboardRuns.map((run, runIndex) => (
                <div key={runIndex} className={`run-container-box ${runIndex === 0 ? 'top-rank-highlight' : ''}`}>
                  
                  <div className="run-top-meta">
                    <span className="leaderboard-trainer-info">
                      <strong>{run.trainerName || currentUsername}</strong> 
                      <span style={{ opacity: 0.7, marginLeft: '0.5rem' }}>(Rank #{runIndex + 1})</span>
                    </span>
                    <span>
                      {run.date || 'Unknown'} &bull; <span className={`run-result ${run.result === 'Victory' ? 'victory' : 'defeat'}`}>{run.result || 'Completed'}</span>
                    </span>
                  </div>

                  <div className="run-sidepanel-grid">
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