import React from 'react';
import {C, CUES, F, TOTAL, useT} from './lib';

// *teks* = kata kunci (tebal, warna aksen)
const render = (s: string) =>
	s.split(/(\*[^*]+\*)/g).map((part, i) =>
		part.startsWith('*') && part.endsWith('*') ? (
			<span key={i} style={{color: C.gold, fontWeight: 800}}>
				{part.slice(1, -1)}
			</span>
		) : (
			<span key={i}>{part}</span>
		),
	);

export const Subtitles: React.FC = () => {
	const t = useT();
	if (t > TOTAL) return null;
	const cue = CUES.find((c) => t >= c.s && t < c.e);
	if (!cue) return null;
	const a = Math.min(1, (t - cue.s) / 0.12);
	return (
		<div
			style={{
				position: 'absolute',
				left: 180,
				right: 180,
				bottom: 46,
				display: 'flex',
				justifyContent: 'center',
				opacity: a,
			}}
		>
			<div
				style={{
					fontFamily: F.sans,
					fontWeight: 600,
					fontSize: 46,
					lineHeight: 1.28,
					color: C.white,
					textAlign: 'center',
					maxWidth: 1500,
					padding: '10px 26px 12px',
					borderRadius: 14,
					background: 'rgba(6,16,30,0.58)',
					textShadow: '0 2px 6px rgba(0,0,0,0.55)',
					display: '-webkit-box',
					WebkitLineClamp: 2,
					WebkitBoxOrient: 'vertical',
					overflow: 'hidden',
				}}
			>
				{render(cue.t)}
			</div>
		</div>
	);
};
