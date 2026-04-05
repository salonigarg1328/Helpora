import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { forgotPassword } from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await forgotPassword({ email });
      setMessage('Password reset link sent! Check your email (or console).');
      toast.success('Reset link generated');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page container">
      <section className="panel auth-card auth-card-compact">
        <h1>Forgot password</h1>
        <p className="auth-subtitle">Enter your account email and we will send a reset link.</p>

        <div className="form-grid">
          {message && <p className="feedback feedback-success">{message}</p>}
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
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
          <p>
            <Link to="/login">Back to Login</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default ForgotPassword;