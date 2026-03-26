import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h2>Register</h2>
      {error && <p style={{color:'red'}}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input 
            name="name" 
            placeholder="Full Name" 
            value={formData.name}
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input 
            name="email" 
            placeholder="Email" 
            type="email" 
            value={formData.email}
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input 
            name="password" 
            placeholder="Password" 
            type="password" 
            value={formData.password}
            onChange={handleChange} 
            required 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <select 
            name="role" 
            value={formData.role}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="victim">Victim</option>
            <option value="ngo">NGO</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <input 
            name="phone" 
            placeholder="Phone Number" 
            value={formData.phone}
            onChange={handleChange} 
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {/* Show map only for NGO registration */}
        {formData.role === 'ngo' && (
  <div>
    <h3>Select NGO Location</h3>
    <MapPicker onLocationSelect={handleLocationSelect} />
  </div>
)}

        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </form>
      
      <p style={{ marginTop: '15px' }}>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Register;