import React, { useState, useEffect } from 'react';
import { getUnverifiedNgos, verifyNgo, getStats } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await verifyNgo(id);
      setNgos(ngos.filter(ngo => ngo._id !== id));
      setMessage('NGO verified successfully');
      // Refresh stats
      const statsRes = await getStats();
      setStats(statsRes.data);
    } catch (err) {
      setMessage('Verification failed');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      {message && <p>{message}</p>}

      <h2>System Statistics</h2>
      {stats && (
        <ul>
          <li>Total Reports: {stats.totalReports}</li>
          <li>Pending Reports: {stats.pendingReports}</li>
          <li>Total NGOs: {stats.totalNgos}</li>
          <li>Pending NGOs: {stats.pendingNgos}</li>
          <li>Total Victims: {stats.totalVictims}</li>
        </ul>
      )}

      <h2>Unverified NGOs</h2>
      {ngos.length === 0 ? (
        <p>No pending NGOs.</p>
      ) : (
        <ul>
          {ngos.map(ngo => (
            <li key={ngo._id}>
              {ngo.name} ({ngo.email}) – {ngo.phone}
              <button onClick={() => handleVerify(ngo._id)}>Verify</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;