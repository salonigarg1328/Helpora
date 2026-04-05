import React from 'react';

const RecommendationsModal = ({ report, recommendations, onClose }) => {
  if (!recommendations) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Ranked Recommendations</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">Recommended NGOs for Report #{report._id}</h3>
          </div>
          <button className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-5 max-h-[65vh] overflow-auto pr-1">
        {recommendations.length === 0 ? (
          <p className="rounded-2xl bg-slate-50 p-4 text-slate-600">No nearby NGOs found.</p>
        ) : (
          <ul className="space-y-3">
            {recommendations.map(rec => (
              <li key={rec.ngo.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <strong className="text-lg text-slate-900">{rec.ngo.name}</strong>
                  <span className="rounded-full bg-secondary/10 px-3 py-1 text-sm font-semibold text-secondary">
                    Score {rec.totalScore.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 grid gap-1 text-sm text-slate-600 sm:grid-cols-3">
                  <span>Distance: {rec.distance.toFixed(2)} km</span>
                  <span>Resource Score: {rec.resourceScore}</span>
                  <span>Combined Score: {rec.totalScore.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        </div>
      </div>
    </div>
  );
};

export default RecommendationsModal;