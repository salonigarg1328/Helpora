import React from 'react';
import { Link, Navigate } from 'react-router-dom';

const LandingPage = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('userRole');
  if (token && role === 'victim') return <Navigate to="/victim-dashboard" />;
  if (token && role === 'ngo') return <Navigate to="/ngo-dashboard" />;
  if (token && role === 'admin') return <Navigate to="/admin-dashboard" />;

  const features = [
    {
      title: 'Live Emergency Alerts',
      description: 'Victim requests are delivered to nearby NGOs instantly so teams can respond faster.',
      icon: '⚡',
    },
    {
      title: 'Location Intelligence',
      description: 'Geospatial matching prioritizes support based on distance and urgency in real time.',
      icon: '📍',
    },
    {
      title: 'Critical SOS Routing',
      description: 'One tap elevates incident priority and highlights cases needing immediate intervention.',
      icon: '🚨',
    },
    {
      title: 'NGO Resource Visibility',
      description: 'Track and update food, water, shelter, and medical capacity from a single dashboard.',
      icon: '📦',
    },
    {
      title: 'Verified Ecosystem',
      description: 'Admin verification protects data access and ensures trusted humanitarian responders.',
      icon: '✅',
    },
    {
      title: 'Actionable Dashboards',
      description: 'Separate role-based workspaces for victims, NGOs, and administrators.',
      icon: '📊',
    },
  ];

  return (
    <div>
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand" aria-label="Helpora home">
            <span className="brand-mark">H+</span>
            <span>Helpora</span>
          </Link>
          <div className="actions">
            <Link to="/login" className="btn btn-secondary">Login</Link>
            <Link to="/register" className="btn btn-primary">Join Helpora</Link>
          </div>
        </div>
      </header>

      <main className="container">
        <section className="landing-hero">
          <div className="hero-grid">
            <div>
              <span className="chip">Disaster Response Network</span>
              <h1 className="hero-title">
                Fast relief coordination for <span>victims and NGOs</span>
              </h1>
              <p className="hero-copy">
                Helpora helps communities report emergencies, route SOS calls to nearby NGOs,
                and monitor response progress in one place. Built for speed, accountability, and real-time action.
              </p>
              <div className="hero-actions">
                <Link to="/register" className="btn btn-primary">Create Account</Link>
                <Link to="/login" className="btn btn-secondary">Open Dashboard</Link>
              </div>
              <div className="metrics">
                <div className="metric">
                  <p>Role-based portals</p>
                  <strong>3</strong>
                </div>
                <div className="metric">
                  <p>Priority levels</p>
                  <strong>Real-time</strong>
                </div>
                <div className="metric">
                  <p>Core mission</p>
                  <strong>Save response time</strong>
                </div>
              </div>
            </div>
            <div className="hero-media">
              <img
                src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Emergency relief support team"
              />
            </div>
          </div>
        </section>

        <section>
          <h2 className="section-title">How Helpora makes response smarter</h2>
          <div className="feature-grid">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
          <div className="cta-block">
            <h2>Build response readiness with your team</h2>
            <p>
              Register your account to report emergencies, verify NGO readiness,
              and coordinate relief delivery from one platform.
            </p>
            <Link to="/register" className="btn btn-secondary">Get Started Today</Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>&copy; 2026 Helpora. Resilient communities start with connected responders.</p>
      </footer>
    </div>
  );
};

// Simple card component for features
const FeatureCard = ({ title, description, icon }) => (
  <article className="feature-card">
    <span style={{ fontSize: '1.6rem' }}>{icon}</span>
    <h3>{title}</h3>
    <p>{description}</p>
  </article>
);

export default LandingPage;