import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import ProtectedRoute from './components/ProtectedRoute';
import GameRun from './screens/GameRun';
import Home from './screens/Home';
import PokemonDetails from './screens/PokemonDetails';
import Placeholder from './screens/Placeholder';

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/register" element={<Placeholder title="Register" />} />
        <Route path="/login" element={<Placeholder title="Login" />} />
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:id" element={<PokemonDetails />} />
        <Route
          path="/roster"
          element={
            <ProtectedRoute>
              <Placeholder title="My Roster" />
            </ProtectedRoute>
          }
        />
        <Route path="/leaderboard" element={<Placeholder title="Leaderboard" />} />
        <Route
          path="/play"
          element={
            <ProtectedRoute>
              <GameRun />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
