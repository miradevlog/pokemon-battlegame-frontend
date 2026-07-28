import { Link, useLocation, useNavigate } from "react-router-dom";
import { clearToken, isAuthenticated } from "../lib/auth";

export default function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/") {
    return null;
  }

  const handleLogout = () => {
    clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="absolute top-0 left-0 p-4 z-50 flex items-center gap-2">
      <Link
        to="/"
        className="bg-gray-800/80 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg backdrop-blur-md border border-gray-600 transition-colors shadow-lg flex items-center gap-2"
      >
        <span></span> Home
      </Link>

      {isAuthenticated() && (
        <button
          type="button"
          onClick={handleLogout}
          className="bg-gray-800/80 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg backdrop-blur-md border border-gray-600 transition-colors shadow-lg"
        >
          Logout
        </button>
      )}
    </nav>
  );
}
