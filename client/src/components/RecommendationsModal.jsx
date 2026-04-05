import React from 'react';

const RecommendationsModal = ({ report, recommendations, onClose }) => {
  if (!recommendations) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div className="modal-content" style={{
        background: 'white', padding: '20px', borderRadius: '8px',
        maxWidth: '500px', width: '90%', maxHeight: '80%', overflow: 'auto'
      }}>
        <h3>Recommended NGOs for Report #{report._id}</h3>
        {recommendations.length === 0 ? (
          <p>No nearby NGOs found.</p>
        ) : (
          <ul>
            {recommendations.map(rec => (
              <li key={rec.ngo.id} style={{ marginBottom: '15px', borderBottom: '1px solid #eee', padding: '10px' }}>
                <strong>{rec.ngo.name}</strong><br />
                Distance: {rec.distance.toFixed(2)} km<br />
                Resource Score: {rec.resourceScore}<br />
                Combined Score: {rec.totalScore.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
        <button onClick={onClose} style={{ marginTop: '10px' }}>Close</button>
      </div>
    </div>
  );
};

export default RecommendationsModal;