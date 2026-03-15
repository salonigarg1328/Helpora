import React, { useEffect, useState } from 'react';
import socket from '../socket';

const NgoDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Listen for new reports
    socket.on('new-report', (report) => {
      setNotifications(prev => [`New ${report.isSOS ? '🚨 SOS' : '📋 report'} from location [${report.location.coordinates}]`, ...prev]);
      // Optionally add to reports list
      setReports(prev => [report, ...prev]);
    });

    // Listen for report accepted (maybe another NGO accepted)
    socket.on('report-accepted', (data) => {
      setNotifications(prev => [`Report ${data.reportId} was accepted by another NGO`, ...prev]);
    });

    // Cleanup on unmount
    return () => {
      socket.off('new-report');
      socket.off('report-accepted');
    };
  }, []);

  return (
    <div>
      <h1>NGO Dashboard</h1>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h2>Nearby Reports</h2>
          {/* You'll later fetch and display reports from your API */}
          <ul>
            {reports.map(r => (
              <li key={r._id}>
                {r.disasterType} - {r.isSOS ? 'SOS' : r.urgencyLevel}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h2>Live Notifications</h2>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {notifications.map((note, i) => (
              <li key={i} style={{ background: '#f0f0f0', margin: '5px', padding: '10px' }}>
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NgoDashboard;