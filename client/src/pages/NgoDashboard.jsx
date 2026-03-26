import React, { useState, useEffect } from 'react';
import { getNearbyReports, acceptReport, resolveReport } from '../services/api';
import socket from '../services/socket';

const NgoDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div>
      <h1>NGO Dashboard</h1>
      <h2>Nearby Pending Reports</h2>
      {reports.length === 0 ? (
        <p>No reports found nearby.</p>
      ) : (
        <ul>
          {reports.map((report) => {
            // DEBUG LOG: check assignedNgo vs userId
            console.log('🔍 Report assignedNgo:', report.assignedNgo, ' | userId:', localStorage.getItem('userId'));
            return (
              <li key={report._id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
                <p><strong>Type:</strong> {report.disasterType} {report.isSOS && '🚨 SOS'}</p>
                <p><strong>Description:</strong> {report.description}</p>
                <p><strong>Location:</strong> {report.location.coordinates[0]}, {report.location.coordinates[1]}</p>
                <p><strong>Urgency:</strong> {report.urgencyLevel}</p>
                <p><strong>Status:</strong> {report.status}</p>

                {report.status === 'pending' && (
                  <button onClick={() => handleAccept(report._id)}>Accept</button>
                )}

                {report.status === 'accepted' && report.assignedNgo === localStorage.getItem('userId') && (
                  <button onClick={() => handleResolve(report._id)}>Resolve</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default NgoDashboard;