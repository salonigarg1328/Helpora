import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNearbyReports, acceptReport, resolveReport } from '../services/api';
import socket from '../services/socket';
import ResourceManager from '../components/ResourceManager';

const NgoDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const userName = localStorage.getItem('userName'); // get the stored name
  const navigate = useNavigate();

  const fetchReports = async () => {
    try {
      const res = await getNearbyReports(28.7041, 77.1025, 50);
      setReports(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    socket.on('new-report', (newReport) => {
      setReports((prev) => [newReport, ...prev]);
    });

    socket.on('report-accepted', (data) => {
      console.log('✅ report-accepted received:', data);
      setReports((prev) =>
        prev.map((r) =>
          r._id === data.reportId
            ? { ...r, status: 'accepted', assignedNgo: data.assignedNgo }
            : r
        )
      );
    });

    socket.on('report-resolved', (data) => {
      setReports((prev) =>
        prev.map((r) =>
          r._id === data.reportId ? { ...r, status: 'resolved' } : r
        )
      );
    });

    return () => {
      socket.off('new-report');
      socket.off('report-accepted');
      socket.off('report-resolved');
    };
  }, []);

  const handleAccept = async (id) => {
    try {
      await acceptReport(id);
    } catch (err) {
      alert('Error accepting report');
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveReport(id);
    } catch (err) {
      alert('Error resolving report');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="dashboard-page container">
      <header className="dashboard-header">
        <div>
          <h1 className="section-title">Welcome, {userName || 'NGO'} </h1>
          <p>Track nearby reports, accept assignments, and manage inventory in one place.</p>
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
        <h2 className="section-title" style={{ fontSize: '1.2rem' }}>Nearby Reports</h2>
        {reports.length === 0 ? (
          <p>No reports found nearby.</p>
        ) : (
          <ul className="report-list">
            {reports.map((report) => {
              console.log('Report assignedNgo:', report.assignedNgo, ' | userId:', localStorage.getItem('userId'));
              return (
                <li key={report._id} className="report-card">
                  <p><strong>Type:</strong> {report.disasterType} {report.isSOS && '🚨 SOS'}</p>
                  <p><strong>Description:</strong> {report.description || 'No description'}</p>
                  <p>
                    <strong>Location:</strong> {report.location.coordinates[0].toFixed(4)},{' '}
                    {report.location.coordinates[1].toFixed(4)}
                  </p>
                  <p><strong>Urgency:</strong> {report.urgencyLevel}</p>
                  <p><strong>Status:</strong> {report.status}</p>

                  <div className="inline-actions">
                    {report.status === 'pending' && (
                      <button className="btn btn-primary" onClick={() => handleAccept(report._id)}>Accept</button>
                    )}

                    {report.status === 'accepted' && report.assignedNgo === localStorage.getItem('userId') && (
                      <button className="btn btn-secondary" onClick={() => handleResolve(report._id)}>Resolve</button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="panel" style={{ marginTop: '1rem', padding: '1rem' }}>
        <ResourceManager />
      </section>
    </div>
  );
};

export default NgoDashboard;