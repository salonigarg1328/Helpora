import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyAcceptedReports } from '../services/api';

const NgoHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getMyAcceptedReports();
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
          <h1 className="section-title">NGO Response History</h1>
          <p>Review incidents your team accepted and resolved.</p>
        </div>
        <div className="inline-actions">
          <Link to="/ngo-dashboard" className="btn btn-secondary">Back to Dashboard</Link>
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
        <h2 className="section-title panel-title">Response Timeline</h2>
        {loading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p>No accepted or resolved reports yet.</p>
        ) : (
          <ul className="report-list">
            {history.map((report) => (
              <li key={report._id} className="report-card">
                <p><strong>Victim:</strong> {report.victim?.name || 'Unknown victim'}{report.victim?.phone ? ` (${report.victim.phone})` : ''}</p>
                <p><strong>Type:</strong> {report.disasterType}</p>
                <p><strong>Status:</strong> {report.status}</p>
                <p><strong>Created:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                {report.neededResources?.length > 0 && (
                  <p><strong>Needed Resources:</strong> {report.neededResources.map((n) => `${n.resourceType} (${n.quantity})`).join(', ')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default NgoHistory;
