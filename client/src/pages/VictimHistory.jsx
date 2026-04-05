import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyReports } from '../services/api';

const VictimHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getMyReports();
        setHistory(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="dashboard-page container">
      <header className="dashboard-header">
        <div>
          <h1 className="section-title">Victim History</h1>
          <p>Track your submitted reports and their latest status.</p>
        </div>
        <div className="inline-actions">
          <Link to="/victim-dashboard" className="btn btn-secondary">Back to Dashboard</Link>
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
        </div>
      </header>

      <section className="panel panel-pad">
        <h2 className="section-title panel-title">Report Timeline</h2>
        {loading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p>No previous requests yet.</p>
        ) : (
          <ul className="report-list">
            {history.map((report) => (
              <li key={report._id} className="report-card">
                <p><strong>Type:</strong> {report.disasterType} {report.isSOS ? '🚨 SOS' : ''}</p>
                <p><strong>Description:</strong> {report.description || 'No description'}</p>
                <p><strong>Status:</strong> {report.status}</p>
                <p><strong>Submitted:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                {report.assignedNgo?.name && (
                  <p><strong>Accepted by:</strong> {report.assignedNgo.name}</p>
                )}
                {report.neededResources?.length > 0 && (
                  <p><strong>Needed:</strong> {report.neededResources.map((n) => `${n.resourceType} (${n.quantity})`).join(', ')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default VictimHistory;
