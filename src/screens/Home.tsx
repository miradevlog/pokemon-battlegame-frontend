import { Link } from "react-router-dom";
import "./Home.css"; 

export default function Home() {
  return (
    <div className="home-screen">
      
      <h1 className="home-title">Pokémon Battler</h1>
      <p className="home-subtitle">Gotta catch 'em, gotta fight 'em!</p>

      <div className="home-menu">
        <Link to="/play" className="menu-btn btn-play">
          PLAY
        </Link>
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