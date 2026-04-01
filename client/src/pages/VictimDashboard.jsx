import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createReport } from '../services/api';
import socket from '../services/socket'; // 👈 import socket
import MapPicker from '../components/MapPicker';

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

  const handleLocationSelect = (location) => {
    setFormData((prev) => ({
      ...prev,
      location,
    }));
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

      <section className="panel panel-pad">
        {notification && (
          <div className="feedback feedback-success notification-wrap">
            <span>{notification}</span>
            <button onClick={() => setNotification(null)} className="btn btn-secondary btn-sm">
              Dismiss
            </button>
          </div>
        )}

        <h2 className="section-title panel-title">Create Report</h2>
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

          <div className="field">
            <label>Select incident location</label>
            <MapPicker
              onLocationSelect={handleLocationSelect}
              initialCenter={[28.6139, 77.209]}
              initialZoom={6}
            />
            {formData.location.coordinates.length > 0 && (
              <p className="location-coords">
                Coordinates: {formData.location.coordinates[0].toFixed(4)}, {formData.location.coordinates[1].toFixed(4)}
              </p>
            )}
          </div>

          <label className="inline-check">
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