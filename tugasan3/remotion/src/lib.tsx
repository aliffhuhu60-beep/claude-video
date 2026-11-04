import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import data from './cues.json';
import remap from './remap.json';

export const FPS = 30;
export const TOTAL: number = data.total; // tempoh rakaman selepas suntingan (saat)
export const REF_DUR = 21; // tempoh paparan Rujukan di hujung (3 halaman x 7 s)

export const C = {
	navy: '#0A1B2E',
	navy2: '#10294A',
	navy3: '#173A63',
	white: '#FFFFFF',
	soft: 'rgba(255,255,255,0.78)',
	faint: 'rgba(255,255,255,0.5)',
	gold: '#F5C443',
	gold2: '#E0A526',
	glass: 'rgba(9,24,42,0.78)',
	glassLine: 'rgba(255,255,255,0.18)',
	paper: '#F6F1E6',
	ink: '#14243A',
	red: '#E0664A',
};

export const F = {
	serif: '"Fraunces", Georgia, serif',
	sans: '"Inter", "Helvetica Neue", Arial, sans-serif',
};

type Cue = {s: number; e: number; t: string; i: number};
export const CUES: Cue[] = data.cues as Cue[];
const byIdx = new Map<number, Cue>();
CUES.forEach((c) => byIdx.set(c.i, c));
/** Masa mula (saat, garis masa baharu) bagi segmen ucapan i. */
export const S = (i: number): number => {
	const c = byIdx.get(i);
	if (!c) throw new Error('Tiada segmen ' + i);
	return c.s;
};
/** Masa tamat segmen ucapan i. */
export const E = (i: number): number => {
	const c = byIdx.get(i);
	if (!c) throw new Error('Tiada segmen ' + i);
	return c.e;
};

// Jeda senyap yang panjang dirapatkan: setiap segmen [mulaAsal, tamatAsal) dalam bingkai garis masa asal.
// Grafik dan sarikata kekal ditulis dalam masa asal; useT() menukar bingkai baharu kepada masa asal.
export type Seg = {from: number; dur: number; src: number};
export const SEGS: Seg[] = (() => {
	let acc = 0;
	return (remap.segments as number[][]).map(([a, b]) => {
		const s = {from: acc, dur: b - a, src: a};
		acc += b - a;
		return s;
	});
})();
export const SPEECH_FRAMES = SEGS[SEGS.length - 1].from + SEGS[SEGS.length - 1].dur;
export const toOld = (f: number): number => {
	if (f >= SPEECH_FRAMES) return TOTAL + (f - SPEECH_FRAMES) / FPS;
	let lo = 0,
		hi = SEGS.length - 1;
	while (lo < hi) {
		const mid = (lo + hi + 1) >> 1;
		if (SEGS[mid].from <= f) lo = mid;
		else hi = mid - 1;
	}
	const sg = SEGS[lo];
	return (sg.src + (f - sg.from)) / FPS;
};

export const useT = () => {
	const f = useCurrentFrame();
	return toOld(f);
};

const ease = Easing.bezier(0.22, 1, 0.36, 1);
/** 0→1 bermula pada saat s, selama d saat. */
export const rise = (t: number, s: number, d = 0.55) =>
	interpolate(t, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
/** Masuk pada s, keluar sebelum e. */
export const life = (t: number, s: number, e: number, d = 0.5) =>
	Math.min(rise(t, s, d), 1 - rise(t, e - d, d));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Komponen dipaparkan hanya dalam tetingkap masa [s, e]. */
export const Win: React.FC<{s: number; e: number; children: (t: number, v: number) => React.ReactNode; d?: number}> = ({
	s,
	e,
	children,
	d = 0.5,
}) => {
	const t = useT();
	if (t < s - 0.05 || t > e + 0.05) return null;
	return <>{children(t, life(t, s, e, d))}</>;
};

/** Teks kiraan nombor (animasi nombor meningkat). */
export const countText = (p: number, to: number, decimals: number, from = 0) => {
	const v = lerp(from, to, p);
	const s = v.toFixed(decimals);
	if (decimals === 0) return Math.round(v).toLocaleString('en-US');
	return s;
};

export const Glass: React.FC<{style?: React.CSSProperties; children: React.ReactNode}> = ({style, children}) => (
	<div
		style={{
			background: C.glass,
			border: `1px solid ${C.glassLine}`,
			borderRadius: 18,
			boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
			color: C.white,
			fontFamily: F.sans,
			...style,
		}}
	>
		{children}
	</div>
);

export const Eyebrow: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({
	children,
	color = C.gold,
	style,
}) => (
	<div
		style={{
			fontFamily: F.sans,
			fontWeight: 700,
			fontSize: 20,
			letterSpacing: '0.16em',
			textTransform: 'uppercase',
			color,
			...style,
		}}
	>
		{children}
	</div>
);

export const Source: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
	<div style={{fontFamily: F.sans, fontSize: 17, color: C.faint, marginTop: 14, ...style}}>Sumber: {children}</div>
);

/** Ikon garis ringkas (SVG) */
export const Icon: React.FC<{name: string; size?: number; color?: string}> = ({name, size = 34, color = C.gold}) => {
	const p = {fill: 'none', stroke: color, strokeWidth: 2.2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	const shapes: Record<string, React.ReactNode> = {
		school: (
			<>
				<path d="M4 20 L16 12 L28 20" {...p} />
				<rect x="7" y="19" width="18" height="10" {...p} />
				<path d="M14 29 v-5 h4 v5" {...p} />
			</>
		),
		teacher: (
			<>
				<circle cx="11" cy="10" r="4" {...p} />
				<path d="M4 28 v-5 a7 7 0 0 1 14 0 v5" {...p} />
				<rect x="18" y="6" width="11" height="9" {...p} />
			</>
		),
		phone: (
			<>
				<rect x="9" y="3" width="14" height="26" rx="3" {...p} />
				<path d="M14 25 h4" {...p} />
			</>
		),
		check: <path d="M6 17 L13 24 L27 8" {...p} strokeWidth={3} />,
		users: (
			<>
				<circle cx="11" cy="11" r="4" {...p} />
				<circle cx="22" cy="12" r="3.4" {...p} />
				<path d="M3 27 a8 8 0 0 1 16 0" {...p} />
				<path d="M17 27 a6 6 0 0 1 12 0" {...p} />
			</>
		),
		heart: <path d="M16 27 C6 20 4 15 6 10 a5 5 0 0 1 10 0 a5 5 0 0 1 10 0 c2 5 0 10 -10 17z" {...p} />,
		hand: <path d="M10 28 v-12 a2 2 0 0 1 4 0 v-6 a2 2 0 0 1 4 0 v6 a2 2 0 0 1 4 0 v3 a2 2 0 0 1 4 0 v4 c0 5 -3 8 -8 8 h-4" {...p} />,
		lock: (
			<>
				<rect x="7" y="14" width="18" height="13" rx="2" {...p} />
				<path d="M11 14 v-4 a5 5 0 0 1 10 0 v4" {...p} />
			</>
		),
		book: (
			<>
				<path d="M4 7 h9 a3 3 0 0 1 3 3 v18 a3 3 0 0 0 -3 -3 h-9z" {...p} />
				<path d="M28 7 h-9 a3 3 0 0 0 -3 3 v18 a3 3 0 0 1 3 -3 h9z" {...p} />
			</>
		),
		chart: (
			<>
				<path d="M4 28 h24" {...p} />
				<rect x="7" y="16" width="4" height="12" {...p} />
				<rect x="14" y="10" width="4" height="18" {...p} />
				<rect x="21" y="5" width="4" height="23" {...p} />
			</>
		),
		network: (
			<>
				<circle cx="8" cy="8" r="3" {...p} />
				<circle cx="24" cy="9" r="3" {...p} />
				<circle cx="16" cy="24" r="3" {...p} />
				<path d="M10.5 9.5 L21 9 M9.5 10.5 L14.5 21.5 M22.5 11.5 L17.5 21.5" {...p} />
			</>
		),
		home: (
			<>
				<path d="M4 15 L16 5 L28 15" {...p} />
				<path d="M7 13 v15 h18 v-15" {...p} />
			</>
		),
		search: (
			<>
				<circle cx="14" cy="14" r="8" {...p} />
				<path d="M20 20 L28 28" {...p} />
			</>
		),
		chat: (
			<>
				<path d="M4 7 h24 v14 h-12 l-6 6 v-6 h-6z" {...p} />
			</>
		),
		up: <path d="M16 27 V6 M8 13 L16 5 L24 13" {...p} strokeWidth={3} />,
		down: <path d="M16 5 V26 M8 19 L16 27 L24 19" {...p} strokeWidth={3} />,
	};
	return (
		<svg width={size} height={size} viewBox="0 0 32 32">
			{shapes[name] ?? null}
		</svg>
	);
};
