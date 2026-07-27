import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav>
      <Link to="/">Home</Link>{' | '}
      <Link to="/roster">My Roster</Link>{' | '}
      <Link to="/leaderboard">Leaderboard</Link>{' | '}
      <Link to="/play">Play</Link>{' | '}
      <Link to="/login">Login</Link>{' | '}
      <Link to="/register">Register</Link>
    </nav>
  );
}
