import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateReport = () => {
  const [formData, setFormData] = useState({
    disasterType: '',
    description: '',
    coordinates: null,
    urgencyLevel: 'medium',
    isSOS: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setFormData({ ...formData, coordinates: [longitude, latitude] });
        setError('');
      },
      (err) => {
        setError('Unable to get location: ' + err.message);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.coordinates) {
      setError('Please select a location');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // assuming you store token after login
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const body = {
        disasterType: formData.disasterType,
        description: formData.description,
        location: {
          coordinates: formData.coordinates,
        },
        urgencyLevel: formData.urgencyLevel,
        isSOS: formData.isSOS,
        images: [],
      };
      await axios.post('http://localhost:3000/api/reports', body, config);
      alert('Report submitted successfully');
      navigate('/dashboard'); // or wherever
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Create Disaster Report</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Disaster Type:</label>
          <select name="disasterType" value={formData.disasterType} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="flood">Flood</option>
            <option value="earthquake">Earthquake</option>
            <option value="fire">Fire</option>
            <option value="cyclone">Cyclone</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} />
        </div>
        <div>
          <label>Location:</label>
          <button type="button" onClick={getCurrentLocation}>Get Current Location</button>
          {formData.coordinates && (
            <p>Coordinates: {formData.coordinates[0]}, {formData.coordinates[1]}</p>
          )}
        </div>
        <div>
          <label>Urgency:</label>
          <select name="urgencyLevel" value={formData.urgencyLevel} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="isSOS"
              checked={formData.isSOS}
              onChange={(e) => setFormData({ ...formData, isSOS: e.target.checked })}
            />
            This is an SOS emergency
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default CreateReport;