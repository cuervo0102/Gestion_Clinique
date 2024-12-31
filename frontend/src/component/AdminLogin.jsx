import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../login.css';

const LoginAdmin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8080/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.userId) {
          localStorage.setItem('userId', data.userId);
          navigate('/patient_case');
        } else {
          setError('Invalid response from server');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error - please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-background">
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="login-container">
          <h2 className="text-center font-pacifico mb-4">Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control custom-input"
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-control custom-input"
                required
              />
            </div>
            {error && (
              <div className="alert alert-danger">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`btn custom-btn w-100`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
