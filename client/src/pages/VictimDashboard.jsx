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
    <div className="dashboard-page container">
      <header className="dashboard-header">
        <div>
          <h1 className="section-title">Victim Dashboard</h1>
          <p>Submit incidents quickly and share exact location for faster support.</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userRole');
            navigate('/login');
          }}
        >
          Logout
        </button>
      </header>

      <section className="panel" style={{ padding: '1rem' }}>
        {notification && (
          <div className="feedback feedback-success" style={{ marginBottom: '1rem' }}>
            {notification}
            <button
              onClick={() => setNotification(null)}
              className="btn btn-secondary"
              style={{ float: 'right', padding: '0.3rem 0.65rem' }}
            >
              Close
            </button>
          </div>
        )}

        <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Create Report</h2>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>Disaster Type</label>
            <select
              className="select"
              value={formData.disasterType}
              onChange={(e) => setFormData({ ...formData, disasterType: e.target.value })}
              required
            >
              <option value="">Select</option>
              <option value="flood">Flood</option>
              <option value="earthquake">Earthquake</option>
              <option value="fire">Fire</option>
              <option value="cyclone">Cyclone</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="field">
            <label>Description</label>
            <textarea
              className="textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="4"
              placeholder="Describe what happened and what support is needed"
            />
          </div>

          <div className="inline-actions">
            <button type="button" className="btn btn-secondary" onClick={getLocation}>
              Get Current Location
            </button>
            {formData.location.coordinates.length > 0 && (
              <span className="chip">
                {formData.location.coordinates[0].toFixed(4)}, {formData.location.coordinates[1].toFixed(4)}
              </span>
            )}
          </div>

          <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={formData.isSOS}
              onChange={(e) => setFormData({ ...formData, isSOS: e.target.checked })}
            />
            Mark this as SOS emergency
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default VictimDashboard;