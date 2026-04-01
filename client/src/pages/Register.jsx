import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import MapPicker from '../components/MapPicker'; // or LocationPicker from Option A

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', 
    email: '', 
    password: '', 
    role: 'victim', 
    phone: '',
    location: null // Will be set by map picker
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationSelect = (location) => {
    setFormData({ ...formData, location });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate NGO location
    if (formData.role === 'ngo' && !formData.location) {
      setError('Please select a location on the map for your NGO');
      return;
    }

    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page container">
      <section className="panel auth-card">
        <h1>Create your Helpora account</h1>
        <p className="auth-subtitle">Register as a victim or NGO responder and get real-time disaster support tools.</p>

        <div className="form-grid">
          {error && <p className="feedback feedback-error">{error}</p>}

          <form className="form-grid" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                className="input"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                name="email"
                placeholder="you@example.com"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                name="password"
                placeholder="Create a secure password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="role">Account role</label>
              <select
                id="role"
                className="select"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="victim">Victim</option>
                <option value="ngo">NGO</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="phone">Phone number</label>
              <input
                id="phone"
                className="input"
                name="phone"
                placeholder="Optional"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {formData.role === 'ngo' && (
              <div className="field">
                <label>Select NGO location</label>
                <MapPicker onLocationSelect={handleLocationSelect} />
              </div>
            )}

            <button className="btn btn-primary" type="submit">Register</button>
          </form>

          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Register;