import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from "../lib/api";
import { getUsername } from "../lib/auth";
import './Roster.css';

interface ServerScore {
  _id: string;
  userId: {
    _id: string;
    username: string;
  };
  score: number;
  roster: string[];
  date: string;
}

export default function Leaderboard() {
  const [leaderboardScores, setLeaderboardScores] = useState<ServerScore[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentUsername = getUsername() || "Trainer";

  useEffect(() => {
    const fetchServerLeaderboard = async () => {
      try {
        setIsLoading(true);

        const data = await api<{ leaderboard?: ServerScore[] }>("/leaderboard", {
          auth: true,
        });

        const scores = data.leaderboard || [];
        const sortedScores = [...scores].sort((a, b) => b.score - a.score);

        setLeaderboardScores(sortedScores);
      } catch (err: any) {
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchServerLeaderboard();
  }, []);

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

          {isLoading && <p className="empty-text">Loading leaderboard...</p>}
          {error && <p className="empty-text" style={{ color: '#ff6b6b' }}>Error: {error}</p>}

          {!isLoading && !error && leaderboardScores.length === 0 ? (
            <p className="empty-text">No leaderboard scores recorded yet.</p>
          ) : (
            <div className="history-list">
              {leaderboardScores.map((item: ServerScore, runIndex: number) => {
                const trainerName = item.userId?.username || currentUsername;

                return (
                  <div key={item._id || runIndex} className={`run-container-box ${runIndex === 0 ? 'top-rank-highlight' : ''}`}>
                    
                    <div className="run-top-meta">
                      <span className="leaderboard-trainer-info">
                        <strong>{trainerName}</strong> 
                        <span style={{ opacity: 0.7, marginLeft: '0.5rem' }}>(Rank #{runIndex + 1})</span>
                      </span>
                      <span>
                        {new Date(item.date).toLocaleDateString()} &bull; <span className="run-result victory">Completed</span>
                      </span>
                    </div>

                    <div className="run-sidepanel-grid">
                      <div className="run-pokemon-box">
                        {(item.roster ?? []).map((pokeName: string, pIndex: number) => {
                          const formattedName = pokeName.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
                          
                          return (
                            <div key={pIndex} className="pokemon-item">
                              <img
                                src={`https://play.pokemonshowdown.com/sprites/dex/${formattedName}.png`}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = `https://play.pokemonshowdown.com/sprites/dex/substitute.png`;
                                }}
                                alt={pokeName}
                                className="roster-sprite"
                              />
                              <span className="pokemon-name">{pokeName}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="run-stats-sidebar">
                        {renderBadges(0)}
                        <div className="roster-score-box">
                          <h3>Score</h3>
                          <div className="score">{item.score}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}