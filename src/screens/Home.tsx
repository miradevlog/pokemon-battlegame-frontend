import { Link, useNavigate } from "react-router-dom";
import "./Home.css"; 

export default function Home() {
  const navigate = useNavigate();
  const hasActiveRun = !!localStorage.getItem("activePokemonRun");

  const startNewRun = () => {
    localStorage.removeItem("activePokemonRun");
    navigate("/play");
  };

  return (
    <div className="home-screen">
      
      <h1 className="home-title">Pokémon Battler</h1>
      <p className="home-subtitle">Gotta catch 'em, gotta fight 'em!</p>

      <div className="home-menu">
        {hasActiveRun ? (
          <>
            <Link to="/play" className="menu-btn btn-play" style={{ marginBottom: '10px' }}>
              CONTINUE RUN
            </Link>
            <button 
              onClick={startNewRun} 
              className="menu-btn btn-play" 
              style={{ background: '#ff9800', cursor: 'pointer', border: 'none', fontFamily: 'inherit' }}
            >
              NEW RUN
            </button>
          </>
        ) : (
          <Link to="/play" className="menu-btn btn-play">
            PLAY
          </Link>
        )}
        <Link to="/roster" className="menu-btn btn-roster">
          My Roster
        </Link>
        <Link to="/leaderboard" className="menu-btn btn-leaderboard">
          Leaderboard
        </Link>
      </div>

      <hr className="home-divider" />

      <div className="auth-menu">
        <Link to="/login" className="menu-btn btn-auth">
          Login
        </Link>
        <Link to="/register" className="menu-btn btn-auth">
          Register
        </Link>
      </div>

    </div>
  );
}