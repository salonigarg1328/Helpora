import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReport } from '../services/api';
import socket from '../services/socket'; // 👈 import socket

const VictimDashboard = () => {
  const [formData, setFormData] = useState({
    disasterType: '',
    description: '',
    location: { coordinates: [] },
    isSOS: false,
  });
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null); // for displaying messages
  const navigate = useNavigate();

  // 👇 Listen for report‑accepted events
  useEffect(() => {
    socket.on('report-accepted', (data) => {
      console.log('✅ Report accepted:', data);
      setNotification(`Your report ${data.reportId} was accepted by an NGO.`);
      // You can also update a list of your reports if you maintain one
    });

    // Cleanup on unmount
    return () => {
      socket.off('report-accepted');
    };
  }, []);

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setFormData({
          ...formData,
          location: { coordinates: [longitude, latitude] },
        });
      },
      (err) => alert('Location error: ' + err.message)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createReport(formData);
      alert('Report submitted');
      setFormData({ disasterType: '', description: '', location: { coordinates: [] }, isSOS: false });
    } catch (err) {
      alert('Error: ' + err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Victim Dashboard</h1>
      <button onClick={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login');
      }}>Logout</button>

      {/* 👇 Notification banner */}
      {notification && (
        <div style={{
          backgroundColor: '#d4edda',
          color: '#155724',
          padding: '10px',
          borderRadius: '4px',
          margin: '10px 0'
        }}>
          {notification}
          <button
            onClick={() => setNotification(null)}
            style={{ float: 'right', border: 'none', background: 'none', cursor: 'pointer' }}
          >×</button>
        </div>
      )}

      <h2>Create Report</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Disaster Type:</label>
          <select
            value={formData.disasterType}
            onChange={(e) => setFormData({...formData, disasterType: e.target.value})}
            required
            style={{ width: '100%', padding: '8px' }}
          >
            <option value="">Select</option>
            <option value="flood">Flood</option>
            <option value="earthquake">Earthquake</option>
            <option value="fire">Fire</option>
            <option value="cyclone">Cyclone</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Description:</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows="3"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <button type="button" onClick={getLocation} style={{ padding: '8px' }}>
            Get Current Location
          </button>
          {formData.location.coordinates.length > 0 && (
            <p style={{ marginTop: '5px' }}>
              Coordinates: {formData.location.coordinates[0].toFixed(4)}, {formData.location.coordinates[1].toFixed(4)}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              checked={formData.isSOS}
              onChange={(e) => setFormData({...formData, isSOS: e.target.checked})}
            />
            This is an SOS emergency
          </label>
        </div>

        <button type="submit" disabled={loading} style={{ padding: '10px 20px' }}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
};

export default VictimDashboard;