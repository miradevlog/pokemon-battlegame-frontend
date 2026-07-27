import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Register from "./screens/Register";
import GameRun from "./screens/GameRun";
import Roster from "./screens/Roster";
import Leaderboard from "./screens/Leaderboard";
import PokemonDetails from "./screens/PokemonDetails";

function App() {
  return (
    <div>
      <NavBar />
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:id" element={<PokemonDetails />} />
        <Route path="/roster" element={
            <ProtectedRoute>
              <Roster />
            </ProtectedRoute>
          }
        />
        <Route path="/leaderboard" element={
            <ProtectedRoute>
              <Leaderboard />
            </ProtectedRoute>
          }
        />

        <Route path="/play" element={
            <ProtectedRoute>
              <GameRun />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;