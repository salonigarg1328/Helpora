import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getNearbyReports,
  acceptReport,
  resolveReport,
  getRecommendations,
  getMyResources,
} from '../services/api';
import socket from '../services/socket';
import ResourceManager from '../components/ResourceManager';
import ReportsMap from '../components/ReportsMap';
import RecommendationsModal from '../components/RecommendationsModal';

const NgoDashboard = () => {
  const [reports, setReports] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const userName = localStorage.getItem('userName');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [reportsRes, resourcesRes] = await Promise.all([
        getNearbyReports(28.7041, 77.1025, 50),
        getMyResources(),
      ]);
      setReports(reportsRes.data);
      setResources(resourcesRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    socket.on('new-report', (newReport) => {
      setReports((prev) => [newReport, ...prev]);
      toast.success('New report received!');
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
      toast('Report accepted by another NGO', { icon: 'ℹ️' });
    });

    socket.on('report-resolved', (data) => {
      setReports((prev) =>
        prev.map((r) =>
          r._id === data.reportId ? { ...r, status: 'resolved' } : r
        )
      );
      toast.success('Report resolved');
    });

    socket.on('resources-updated', (data) => {
      console.log('resources-updated received:', data);
      if (String(data.ngoId) === String(localStorage.getItem('userId'))) {
        getMyResources().then(res => setResources(res.data));
        toast.success('Resources updated');
      }
    });

    socket.on('low-stock', (data) => {
      if (String(data.ngoId) === String(localStorage.getItem('userId'))) {
        const alertMsg = data.alerts.map(a => `${a.resourceType} (${a.quantity} left)`).join(', ');
        toast.error(`⚠️ Low stock: ${alertMsg}`);
      }
    });

    return () => {
      socket.off('new-report');
      socket.off('report-accepted');
      socket.off('report-resolved');
      socket.off('resources-updated');
      socket.off('low-stock');
    };
  }, []);

  const handleAccept = async (id) => {
    try {
      await acceptReport(id);
    } catch (err) {
      toast.error('Error accepting report');
    }
  };

  const handleResolve = async (id) => {
    try {
      await resolveReport(id);
    } catch (err) {
      toast.error('Error resolving report');
    }
  };

  const fetchRecommendations = async (reportId) => {
    try {
      const res = await getRecommendations(reportId);
      setRecommendations(res.data);
      setSelectedReport(reportId);
      setShowModal(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load recommendations');
    }
  };

  const computeMatch = (report) => {
    const needed = report.neededResources || [];
    if (needed.length === 0) return { matched: [], percentage: 0, hasMatch: false };

    const availableMap = new Map(resources.map(r => [r.resourceType, r.quantity]));
    const matched = needed.filter(need => (availableMap.get(need.resourceType) || 0) >= need.quantity);
    const matchedTypes = matched.map(m => m.resourceType);
    const percentage = (matched.length / needed.length) * 100;
    return { matched: matchedTypes, percentage, hasMatch: matched.length > 0 };
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-page container">
      <header className="dashboard-header">
        <div>
          <h1 className="section-title">Welcome, {userName || 'NGO'} </h1>
          <p>Track nearby reports, accept assignments, and manage inventory in one place.</p>
        </div>
        <div className="inline-actions">
          <Link to="/ngo-dashboard/history" className="btn btn-secondary">View History</Link>
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
        <h2 className="section-title panel-title">Nearby Reports</h2>
        {reports.length === 0 ? (
          <p>No reports found nearby.</p>
        ) : (
          <div className="dashboard-split">
            <div>
              <ReportsMap reports={reports} onReportSelect={setSelectedReportId} />
            </div>
            <div>
              <ul className="report-list">
                {reports.map((report) => {
                  const { matched, percentage, hasMatch } = computeMatch(report);
                  return (
                    <li
                      key={report._id}
                      className={`report-card ${selectedReportId === report._id ? 'report-card-active' : ''}`}
                      onClick={() => setSelectedReportId(report._id)}
                    >
                      <p><strong>Type:</strong> {report.disasterType} {report.isSOS ? '🚨 SOS' : ''}</p>
                      <p><strong>Description:</strong> {report.description || 'No description'}</p>
                      <p>
                        <strong>Location:</strong> {report.location.coordinates[0].toFixed(4)},{' '}
                        {report.location.coordinates[1].toFixed(4)}
                      </p>
                      <p><strong>Urgency:</strong> {report.urgencyLevel}</p>
                      <p><strong>Status:</strong> {report.status}</p>

                      {report.neededResources && report.neededResources.length > 0 && (
                        <p>
                          <strong>Needs:</strong>{' '}
                          {report.neededResources.map(n => `${n.resourceType} (${n.quantity})`).join(', ')}
                        </p>
                      )}
                      {hasMatch && (
                        <p className="match-badge">
                          🟢 <strong>Match:</strong> {matched.join(', ')} ({percentage.toFixed(0)}%)
                        </p>
                      )}

                      <div className="inline-actions">
                        {report.status === 'pending' && (
                          <>
                            <button
                              className="btn btn-primary"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleAccept(report._id);
                              }}
                            >
                              Accept
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={(event) => {
                                event.stopPropagation();
                                fetchRecommendations(report._id);
                              }}
                            >
                              View Recommendations
                            </button>
                          </>
                        )}
                        {report.status === 'accepted' && report.assignedNgo === localStorage.getItem('userId') && (
                          <button
                            className="btn btn-secondary"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleResolve(report._id);
                            }}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section className="panel panel-pad section-gap-top">
        <ResourceManager
          onResourceUpdate={() => getMyResources().then(res => setResources(res.data))}
        />
      </section>

      {showModal && (
        <RecommendationsModal
          report={{ _id: selectedReport }}
          recommendations={recommendations}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default NgoDashboard;