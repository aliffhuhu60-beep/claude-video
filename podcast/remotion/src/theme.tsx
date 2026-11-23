import React from 'react';
import {Easing, interpolate} from 'remotion';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/montserrat/800.css';
import '@fontsource/montserrat/900.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/fraunces/500.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/500-italic.css';
import '@fontsource/fraunces/600-italic.css';

export const FPS = 30;
export const W = 1920;
export const H = 1080;

/** Palet rasmi BICARA BAHASA */
export const C = {
	burgundy: '#552033',
	cream: '#F5F0EA',
	beige: '#D8C2A5',
	red: '#A64D62',
	charcoal: '#252326',
	gold: '#C6A46A',
	ink: '#1A181B',
	creamSoft: 'rgba(245,240,234,0.78)',
	creamFaint: 'rgba(245,240,234,0.45)',
	glass: 'rgba(37,35,38,0.72)',
	burgGlass: 'rgba(85,32,51,0.86)',
};

export const F = {
	display: '"Montserrat", "Helvetica Neue", Arial, sans-serif',
	sub: '"Poppins", "Montserrat", Arial, sans-serif',
	serif: '"Fraunces", Georgia, serif',
};

export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeIn = Easing.bezier(0.7, 0, 0.84, 0);

/** 0→1 bermula pada bingkai s selama d bingkai (ease out) */
export const rise = (f: number, s: number, d = 18, ease = easeOut) =>
	interpolate(f, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** Masuk pada s, keluar pada e (bingkai) */
export const life = (f: number, s: number, e: number, din = 14, dout = 12) =>
	Math.min(rise(f, s, din), 1 - rise(f, e - dout, dout, easeIn));

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** Teks dengan topeng (mask) - teks naik dari bawah garis */
export const MaskUp: React.FC<{p: number; children: React.ReactNode; style?: React.CSSProperties; dist?: number}> = ({
	p,
	children,
	style,
	dist = 110,
}) => (
	<span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.06em', ...style}}>
		<span
			style={{
				display: 'inline-block',
				transform: `translateY(${(1 - p) * dist}%)`,
				filter: p < 1 ? `blur(${(1 - p) * 6}px)` : undefined,
			}}
		>
			{children}
		</span>
	</span>
);

/** Label kecil huruf besar berjarak */
export const Eyebrow: React.FC<{children: React.ReactNode; color?: string; style?: React.CSSProperties}> = ({
	children,
	color = C.gold,
	style,
}) => (
	<div
		style={{
			fontFamily: F.display,
			fontWeight: 700,
			fontSize: 22,
			letterSpacing: '0.32em',
			textTransform: 'uppercase',
			color,
			...style,
		}}
	>
		{children}
	</div>
);

/** Garisan beranimasi */
export const Line: React.FC<{p: number; w: number; color?: string; h?: number; origin?: string; style?: React.CSSProperties}> = ({
	p,
	w,
	color = C.gold,
	h = 3,
	origin = 'left',
	style,
}) => (
	<div
		style={{
			width: w,
			height: h,
			background: color,
			transform: `scaleX(${p})`,
			transformOrigin: origin,
			borderRadius: h,
			...style,
		}}
	/>
);

/** Butiran filem halus (statik, murah) */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => (
	<div
		style={{
			position: 'absolute',
			inset: 0,
			opacity,
			mixBlendMode: 'overlay',
			backgroundImage:
				"url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
			pointerEvents: 'none',
		}}
	/>
);

/** Sapuan cahaya (light sweep) merentasi elemen induk */
export const Sweep: React.FC<{p: number; angle?: number; width?: number; opacity?: number}> = ({p, angle = 20, width = 26, opacity = 0.55}) => {
	if (p <= 0 || p >= 1) return null;
	const x = lerp(-40, 140, p);
	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				pointerEvents: 'none',
				mixBlendMode: 'screen',
				background: `linear-gradient(${90 + angle}deg, transparent ${x - width}%, rgba(255,240,215,${opacity}) ${x}%, transparent ${x + width}%)`,
			}}
		/>
	);
};
