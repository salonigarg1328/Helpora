import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getUnverifiedNgos, verifyNgo, getStats } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, ngosRes] = await Promise.all([getStats(), getUnverifiedNgos()]);
      setStats(statsRes.data);
      setNgos(ngosRes.data);
    } catch (err) {
      console.error(err);
      setMessage('Failed to load data');
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyNgo(id);
      setNgos(ngos.filter(ngo => ngo._id !== id));
      setMessage('NGO verified successfully');
      toast.success('NGO verified successfully');
      // Refresh stats
      const statsRes = await getStats();
      setStats(statsRes.data);
    } catch (err) {
      setMessage('Verification failed');
      toast.error('Verification failed');
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page container">
      <header className="dashboard-header">
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p>Monitor platform health and verify NGO registrations.</p>
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

      {message && (
        <p className={message.includes('failed') ? 'feedback feedback-error' : 'feedback feedback-success'}>
          {message}
        </p>
      )}

      <section className="panel panel-pad section-gap-bottom">
        <h2 className="section-title panel-title">System Statistics</h2>
        {stats && (
          <div className="stats-grid">
            <div className="stat-item"><span>Total Reports</span><strong>{stats.totalReports}</strong></div>
            <div className="stat-item"><span>Pending Reports</span><strong>{stats.pendingReports}</strong></div>
            <div className="stat-item"><span>Total NGOs</span><strong>{stats.totalNgos}</strong></div>
            <div className="stat-item"><span>Pending NGOs</span><strong>{stats.pendingNgos}</strong></div>
            <div className="stat-item"><span>Total Victims</span><strong>{stats.totalVictims}</strong></div>
          </div>
        )}
      </section>

      <section className="panel panel-pad">
        <h2 className="section-title panel-title">Unverified NGOs</h2>
        {ngos.length === 0 ? (
          <p>No pending NGOs.</p>
        ) : (
          <ul className="report-list">
            {ngos.map((ngo) => (
              <li key={ngo._id} className="report-card">
                <p><strong>{ngo.name}</strong></p>
                <p>{ngo.email}</p>
                <p>{ngo.phone || 'No phone provided'}</p>
                <div className="inline-actions">
                  <button className="btn btn-primary" onClick={() => handleVerify(ngo._id)}>
                    Verify NGO
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;