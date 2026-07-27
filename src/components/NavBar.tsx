import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const location = useLocation();
  if (location.pathname === "/") {
    return null; 
  }

  return (
    <nav className="absolute top-0 left-0 p-4 z-50">
      <Link 
        to="/" 
        className="bg-gray-800/80 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg backdrop-blur-md border border-gray-600 transition-colors shadow-lg flex items-center gap-2"
      >
        <span></span> Home
      </Link>
    </nav>
  );
}