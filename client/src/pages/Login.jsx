import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { login } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      const user = res.data;
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('userId', user._id);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userRole', user.role);
      toast.success('Welcome back');

      if (user.role === 'victim') {
        navigate('/victim-dashboard');
      } else if (user.role === 'ngo') {
        navigate('/ngo-dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
    }
  };

  return (
    <div className="auth-page container">
      <section className="panel auth-card">
        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue supporting disaster response operations.</p>
        <div className="form-grid">
          {error && <p className="feedback feedback-error">{error}</p>}
          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-primary" type="submit">Login</button>
          </form>
          <p>
            <Link to="/forgot-password">Forgot password?</Link>
          </p>
          <p>
            New here? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Login;