import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { setToken, setUsername } from "../lib/auth";
import "./Login.css";

interface LoginResponse {
  token: string;
  user: { id: string; username: string; email: string };
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await api<LoginResponse>("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      setToken(data.token);
      setUsername(data.user.username);

      navigate("/");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <h2 className="login-title">Trainer Login</h2>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ash@pallettown.com"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Enter World"}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{" "}
          <Link to="/register" className="login-link">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}