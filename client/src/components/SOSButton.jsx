import React from 'react';

const SOSButton = ({ active, onToggle, disabled = false }) => {
	return (
		<button
			type="button"
			disabled={disabled}
			onClick={() => onToggle?.(!active)}
			className={`inline-flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left font-semibold transition ${
				active
					? 'border-urgent bg-urgent/10 text-urgent'
					: 'border-slate-200 bg-white text-slate-700 hover:border-urgent/40 hover:bg-urgent/5'
			}`}
		>
			<span>
				{active ? 'SOS emergency enabled' : 'Mark this as SOS emergency'}
			</span>
			<span className={`rounded-full px-3 py-1 text-xs font-bold ${active ? 'bg-urgent text-white' : 'bg-slate-100 text-slate-600'}`}>
				{active ? 'ON' : 'OFF'}
			</span>
		</button>
	);
};

export default SOSButton;
