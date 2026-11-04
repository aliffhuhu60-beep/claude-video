import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {C, SEGS, TOTAL, clamp01, lerp, rise, useT} from './lib';

// Sempadan syot dalam garis masa selepas suntingan (saat).
export const SHOTS = [0, 223.0, 342.6, 444.5, 497.6, 582.3, 828.7, 1013.9, 1160.8, 1195.4, TOTAL];
// Pertukaran lokasi -> peralihan Zoom-through
const LOCATION_CUTS = [223.0, 582.3, 828.7, 1195.4];

// Mod susun atur penyampai
type Mode = 'frame' | 'pull' | 'insert';
export const LAYOUT: {s: number; e: number; m: Mode}[] = [
	{s: 158.0, e: 173.3, m: 'pull'}, // FPK sebagai penghubung
	{s: 213.2, e: 222.7, m: 'frame'}, // soalan utama
	{s: 238.8, e: 255.0, m: 'insert'}, // petikan Furnivall
	{s: 269.5, e: 286.0, m: 'insert'}, // petikan Shamsul Amri
	{s: 335.7, e: 347.4, m: 'insert'}, // dinding tajuk sumber
	{s: 635.3, e: 649.8, m: 'frame'}, // bercampur tetapi tidak bergabung
	{s: 762.4, e: 774.4, m: 'pull'}, // triangulasi bukti
	{s: 780.8, e: 789.8, m: 'insert'}, // al-Hujurat 49:13
	{s: 834.0, e: 839.2, m: 'frame'}, // BINA
	{s: 1107.6, e: 1151.7, m: 'pull'}, // pelan pelaksanaan
];

// Digital Zoom untuk penekanan angka / kata kunci: [masa, tempoh tahan, amaun]
const PUNCH: [number, number, number][] = [
	[358.9, 3.0, 0.07], // 0.701
	[376.9, 3.0, 0.07], // 0.75
	[430.8, 3.0, 0.08], // 58%
	[497.7, 3.0, 0.07], // 8,540
	[535.6, 3.0, 0.07], // 18.52%
	[594.0, 2.2, 0.08], // Jawapannya, tidak
	[1258.4, 12.0, 0.05], // pendirian
];

export const layoutAt = (t: number) => {
	for (const L of LAYOUT) {
		if (t >= L.s - 0.1 && t <= L.e + 0.1) {
			const p = Math.min(rise(t, L.s, 0.7), 1 - rise(t, L.e - 0.7, 0.7));
			return {m: L.m, p};
		}
	}
	return {m: 'full' as const, p: 0};
};

const kenBurns = (t: number) => {
	let k = 0;
	for (; k < SHOTS.length - 1; k++) if (t < SHOTS[k + 1]) break;
	const a = SHOTS[k];
	const b = SHOTS[Math.min(k + 1, SHOTS.length - 1)];
	const p = clamp01((t - a) / Math.max(1, b - a));
	return k % 2 === 0 ? lerp(1.0, 1.055, p) : lerp(1.06, 1.015, p);
};

const punch = (t: number) => {
	let z = 0;
	for (const [s, hold, amt] of PUNCH) {
		const up = rise(t, s, 0.45);
		const down = rise(t, s + hold, 0.9);
		z = Math.max(z, amt * Math.min(up, 1 - down));
	}
	return z;
};

const zoomThrough = (t: number) => {
	for (const c of LOCATION_CUTS) {
		if (t >= c - 0.3 && t < c) {
			const p = (t - (c - 0.3)) / 0.3;
			return {z: 0.35 * p * p, blur: 12 * p};
		}
		if (t >= c && t < c + 0.4) {
			const p = 1 - rise(t, c, 0.4);
			return {z: 0.35 * p, blur: 12 * p};
		}
	}
	return {z: 0, blur: 0};
};

export const Backdrop: React.FC = () => {
	const t = useT();
	// hanya dilukis apabila penyampai tidak memenuhi skrin
	if (layoutAt(t).m === 'full' && t < TOTAL - 0.5) return null;
	return (
	<AbsoluteFill
		style={{
			background: `radial-gradient(1200px 800px at 25% 30%, ${C.navy3} 0%, ${C.navy2} 45%, ${C.navy} 100%)`,
		}}
	>
		<svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.12}}>
			{Array.from({length: 25}).map((_, i) => (
				<line key={'v' + i} x1={i * 80} y1={0} x2={i * 80} y2={1080} stroke="#fff" strokeWidth={1} />
			))}
			{Array.from({length: 14}).map((_, i) => (
				<line key={'h' + i} x1={0} y1={i * 80} x2={1920} y2={i * 80} stroke="#fff" strokeWidth={1} />
			))}
		</svg>
	</AbsoluteFill>
	);
};

export const Presenter: React.FC = () => {
	const t = useT();
	const {m, p} = layoutAt(t);
	const zt = zoomThrough(t);
	const inner = kenBurns(t) * (1 + punch(t)) * (1 + zt.z);

	// susun atur luaran
	let cx = 960,
		cy = 540,
		s = 1,
		radius = 0,
		border = 0,
		blur = zt.blur,
		bright = 1;
	if (m === 'pull') {
		cx = lerp(960, 1440, p);
		cy = lerp(540, 455, p);
		s = lerp(1, 0.44, p);
		radius = 24 * p;
		border = p;
	} else if (m === 'frame') {
		cy = lerp(540, 500, p);
		s = lerp(1, 0.8, p);
		radius = 6 * p;
		border = p;
	} else if (m === 'insert') {
		blur = Math.max(blur, 22 * p);
		bright = lerp(1, 0.42, p);
	}
	// pudar keluar ke Rujukan
	const endFade = 1 - rise(t, TOTAL - 0.2, 0.8);

	return (
		<AbsoluteFill style={{opacity: endFade}}>
			<div
				style={{
					position: 'absolute',
					left: cx - 960 * s,
					top: cy - 540 * s,
					width: 1920 * s,
					height: 1080 * s,
					borderRadius: radius,
					overflow: 'hidden',
					boxShadow: border ? `0 0 0 ${3 * border}px ${C.gold}, 0 12px 28px rgba(0,0,0,${0.5 * border})` : undefined,
				}}
			>
				<div style={{width: 1920, height: 1080, transform: `scale(${s})`, transformOrigin: '0 0'}}>
					<div
						style={{
							width: 1920,
							height: 1080,
							transform: `scale(${inner})`,
							transformOrigin: '53% 38%',
							filter: blur > 0.2 || bright < 0.99 ? `blur(${blur}px) brightness(${bright})` : undefined,
						}}
					>
						{SEGS.map((sg) => (
							<Sequence key={sg.from} from={sg.from} durationInFrames={sg.dur} layout="none">
								<OffthreadVideo src={staticFile('base1080.mp4')} startFrom={sg.src} style={{width: 1920, height: 1080, position: 'absolute', left: 0, top: 0}} />
							</Sequence>
						))}
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
