import React from 'react';
import {AbsoluteFill, Easing, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import '@fontsource/press-start-2p/400.css';
import {ADAM, Box, FADLI, Look, NAIM, Scene, character, porch, proj, rnd} from './voxel';

/**
 * PROMO 40 s gaya blok voxel (asli): 30 s ringkasan podcast + 10 s iklan lagu "Lima Mit Lagi".
 * Babak (bingkai @30fps): tajuk 0-120 | beranda 120-270 | 01 kerancuan 270-420 | 02 rojak betulkan 420-660
 *                        | 03 media sosial 660-810 | penutup 810-900 | iklan 900-1200
 */
export const PROMO_FRAMES = 1200;
export const CUTS = [120, 270, 420, 660, 810, 900];

const PX = '"Press Start 2P", monospace';
const P = {
	burg: '#552033',
	burg2: '#7A2A44',
	red: '#A64D62',
	cream: '#F5F0EA',
	beige: '#D8C2A5',
	gold: '#E0B65A',
	char: '#252326',
	green: '#4CAF6A',
	sky1: '#2B1424',
	sky2: '#6B2B45',
};

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const r = (f: number, s: number, d: number, e = ease) =>
	interpolate(f, [s, s + d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const bounceIn = (f: number, s: number, d = 14) => {
	const t = Math.max(0, Math.min(1, (f - s) / d));
	if (t === 0) return 0;
	const n = 7.5625,
		k = 2.75;
	let x = t;
	if (x < 1 / k) return n * x * x;
	if (x < 2 / k) return n * (x -= 1.5 / k) * x + 0.75;
	if (x < 2.5 / k) return n * (x -= 2.25 / k) * x + 0.9375;
	return n * (x -= 2.625 / k) * x + 0.984375;
};

/** Teks piksel 3D (bayang bertingkat) */
const PixText: React.FC<{children: React.ReactNode; size: number; color?: string; depth?: number; dark?: string; style?: React.CSSProperties}> = ({
	children,
	size,
	color = P.cream,
	depth = 6,
	dark = '#1A0B12',
	style,
}) => {
	const sh = Array.from({length: depth}, (_, i) => `${i + 1}px ${i + 1}px 0 ${dark}`).join(',');
	return (
		<div style={{fontFamily: PX, fontSize: size, color, textShadow: sh, lineHeight: 1.25, letterSpacing: '0.02em', ...style}}>{children}</div>
	);
};

/** Blok kata 2D dengan bevel */
const Block: React.FC<{text: string; bg: string; fg?: string; size?: number; h?: number; pad?: number; style?: React.CSSProperties}> = ({
	text,
	bg,
	fg = P.cream,
	size = 26,
	h = 86,
	pad = 26,
	style,
}) => (
	<div
		style={{
			height: h,
			padding: `0 ${pad}px`,
			background: bg,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			boxShadow: 'inset -8px -8px 0 rgba(0,0,0,0.32), inset 8px 8px 0 rgba(255,255,255,0.22), 0 10px 0 rgba(0,0,0,0.35)',
			fontFamily: PX,
			fontSize: size,
			color: fg,
			textShadow: '3px 3px 0 rgba(0,0,0,0.45)',
			whiteSpace: 'nowrap',
			...style,
		}}
	>
		{text}
	</div>
);

/** Zarah blok pecah */
const Burst: React.FC<{f: number; at: number; x: number; y: number; colors: string[]; n?: number; seed?: number; size?: number}> = ({
	f,
	at,
	x,
	y,
	colors,
	n = 14,
	seed = 1,
	size = 18,
}) => {
	const t = (f - at) / 30;
	if (t < 0 || t > 1.1) return null;
	return (
		<>
			{Array.from({length: n}).map((_, i) => {
				const a = rnd(seed * 31 + i) * Math.PI * 2;
				const v = 260 + rnd(seed * 17 + i) * 420;
				const px = x + Math.cos(a) * v * t;
				const py = y + Math.sin(a) * v * t * 0.8 + 900 * t * t;
				const s = size * (0.6 + rnd(seed + i * 3) * 0.8);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: px - s / 2,
							top: py - s / 2,
							width: s,
							height: s,
							background: colors[i % colors.length],
							opacity: 1 - t,
							transform: `rotate(${t * 360 * (rnd(i) - 0.5)}deg)`,
							boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3)',
						}}
					/>
				);
			})}
		</>
	);
};

/** Latar langit piksel + awan blok */
const Sky: React.FC<{f: number; dim?: number}> = ({f, dim = 0}) => (
	<AbsoluteFill style={{background: `linear-gradient(180deg, ${P.sky1} 0%, ${P.sky2} 70%, #A0525F 100%)`}}>
		{Array.from({length: 7}).map((_, i) => {
			const w = 160 + rnd(i) * 220;
			const x = ((rnd(i + 9) * 2200 + f * (0.6 + rnd(i + 3))) % 2400) - 300;
			const y = 60 + rnd(i + 5) * 380;
			return (
				<div key={i} style={{position: 'absolute', left: x, top: y, opacity: 0.16}}>
					<div style={{width: w, height: 40, background: P.cream}} />
					<div style={{width: w * 0.6, height: 40, background: P.cream, marginLeft: w * 0.2, marginTop: -80}} />
				</div>
			);
		})}
		{/* bintang piksel */}
		{Array.from({length: 40}).map((_, i) => (
			<div
				key={'s' + i}
				style={{
					position: 'absolute',
					left: rnd(i * 7) * 1920,
					top: rnd(i * 11) * 600,
					width: 6,
					height: 6,
					background: P.gold,
					opacity: 0.25 + 0.35 * Math.abs(Math.sin(f * 0.08 + i)),
				}}
			/>
		))}
		<AbsoluteFill style={{background: `rgba(20,8,14,${dim})`}} />
	</AbsoluteFill>
);

const FX = 105,
	FY = 40; // titik fokus kamera (sekitar watak)

/** Dunia beranda dengan tiga watak */
const Porch: React.FC<{f: number; talk?: Look | null; wave?: boolean; zoom?: number; panX?: number; tags?: number; tagAt?: number[]}> = ({
	f,
	talk = null,
	wave = false,
	zoom = 1,
	panX = 0,
	tags = 0,
	tagAt,
}) => {
	const boxes: Box[] = [
		...porch(),
		...character(ADAM, 3.0, 2.55, f, {talk: talk === ADAM, wave, bounce: wave ? 0.15 : 0, seed: 1}),
		...character(FADLI, 5.25, 2.55, f, {talk: talk === FADLI, wave, bounce: wave ? 0.15 : 0, seed: 2}),
		...character(NAIM, 7.5, 2.55, f, {talk: talk === NAIM, wave, bounce: wave ? 0.15 : 0, seed: 3}),
	];
	const heads: [Look, number, number][] = [
		[ADAM, 3.0, 2.55],
		[FADLI, 5.25, 2.55],
		[NAIM, 7.5, 2.55],
	];
	return (
		<AbsoluteFill>
			<svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
				<g transform={`translate(${960 - FX * zoom + panX},${560 - FY * zoom}) scale(${zoom})`}>
					<Scene boxes={boxes} />
				</g>
			</svg>
			{/* tag nama terapung */}
			{heads.map(([L, x, y], i) => {
				const p = bounceIn(f, tagAt ? tagAt[i] : tags + i * 8, 16);
				if (tags <= 0 || p <= 0) return null;
				const [sx, sy] = proj(x + 0.6, y + 0.35, 4.2);
				const role = L === NAIM ? 'HOS' : L === FADLI ? 'PANEL 1' : 'PANEL 2';
				return (
					<div
						key={L.name}
						style={{
							position: 'absolute',
							left: 960 - FX * zoom + panX + sx * zoom,
							top: 560 - FY * zoom + sy * zoom - 20,
							transform: `translate(-50%, -100%) scale(${p})`,
							transformOrigin: 'bottom center',
							textAlign: 'center',
						}}
					>
						<div style={{background: 'rgba(20,10,16,0.72)', padding: '10px 14px', fontFamily: PX, fontSize: 22, color: P.cream}}>{L.name}</div>
						<div style={{fontFamily: PX, fontSize: 12, color: P.gold, marginTop: 6, textShadow: '2px 2px 0 #000'}}>{role}</div>
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

/** Belon cakap piksel */
const Bubble: React.FC<{text: string; x: number; y: number; p: number; side?: 'l' | 'r'; size?: number}> = ({text, x, y, p, side = 'l', size = 22}) =>
	p <= 0 ? null : (
		<div style={{position: 'absolute', left: x, top: y, transform: `scale(${p})`, transformOrigin: side === 'l' ? 'bottom left' : 'bottom right'}}>
			<div
				style={{
					background: P.cream,
					color: P.char,
					fontFamily: PX,
					fontSize: size,
					lineHeight: 1.5,
					padding: '18px 22px',
					boxShadow: `0 0 0 6px ${P.char}, 8px 8px 0 6px rgba(0,0,0,0.35)`,
					maxWidth: 620,
				}}
			>
				{text}
			</div>
			<div style={{width: 24, height: 24, background: P.cream, marginLeft: side === 'l' ? 30 : 'auto', marginRight: side === 'r' ? 30 : 0, boxShadow: `6px 6px 0 0 ${P.char}`}} />
		</div>
	);

/** Sepanduk tajuk segmen */
const Banner: React.FC<{f: number; n: string; title: string}> = ({f, n, title}) => {
	const p = r(f, 4, 14);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: 56, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - p) * -200}px)`}}>
			<div style={{display: 'flex', alignItems: 'stretch'}}>
				<Block text={n} bg={P.gold} fg={P.char} size={34} h={96} pad={30} />
				<Block text={title} bg={P.burg} size={30} h={96} pad={34} />
			</div>
		</div>
	);
};

/* ============================================================ BABAK */
const S1Title: React.FC<{f: number}> = ({f}) => {
	const row1 = 'BICARA'.split('');
	const row2 = 'BAHASA'.split('');
	const slam = 64;
	const shake = f >= slam && f < slam + 12 ? Math.sin(f * 3) * (slam + 12 - f) * 1.6 : 0;
	const main = bounceIn(f, slam - 8, 14);
	return (
		<AbsoluteFill style={{transform: `translate(${shake}px, ${shake * 0.6}px)`}}>
			<Sky f={f} />
			{/* tanah blok */}
			<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 150, display: 'flex'}}>
				{Array.from({length: 22}).map((_, i) => (
					<div key={i} style={{width: 90, height: 150, background: i % 2 ? P.burg : P.burg2, boxShadow: 'inset -8px -8px 0 rgba(0,0,0,0.3), inset 8px 8px 0 rgba(255,255,255,0.12)'}} />
				))}
			</div>
			<AbsoluteFill style={{alignItems: 'center', top: 120}}>
				{[row1, row2].map((row, ri) => (
					<div key={ri} style={{display: 'flex', gap: 14, marginTop: ri ? 16 : 0}}>
						{row.map((ch, i) => {
							const at = 4 + (ri * 6 + i) * 3;
							const p = bounceIn(f, at, 16);
							return (
								<div key={i} style={{transform: `translateY(${(1 - p) * -900}px)`}}>
									<Block text={ch} bg={ri ? P.beige : P.cream} fg={P.burg} size={64} h={118} pad={30} />
								</div>
							);
						})}
					</div>
				))}
			</AbsoluteFill>
			{main > 0 ? (
				<AbsoluteFill style={{alignItems: 'center', top: 470}}>
					<div style={{transform: `scale(${0.3 + 0.7 * main}) rotate(${(1 - main) * -8}deg)`, display: 'flex', alignItems: 'baseline', gap: 28}}>
						<PixText size={96} color="#E8657E" depth={10}>
							ROJAK
						</PixText>
						<PixText size={44} color={P.gold} depth={6}>
							ATAU
						</PixText>
						<PixText size={96} color={P.cream} depth={10}>
							RANCU?
						</PixText>
					</div>
					<div style={{marginTop: 34, opacity: r(f, 84, 12)}}>
						<PixText size={22} color={P.beige} depth={3}>
							ISU KERANCUAN BAHASA DALAM BAHASA MELAYU
						</PixText>
					</div>
				</AbsoluteFill>
			) : null}
			<Burst f={f} at={slam} x={960} y={560} colors={[P.red, P.gold, P.cream, P.burg2]} n={26} seed={5} size={26} />
		</AbsoluteFill>
	);
};

const S2Porch: React.FC<{f: number}> = ({f}) => {
	const z = interpolate(f, [0, 150], [2.0, 2.3]);
	return (
		<AbsoluteFill>
			<Sky f={f + 120} />
			<Porch f={f} talk={f > 18 && f < 116 ? NAIM : null} zoom={z} panX={-120} tags={1} tagAt={[100, 80, 18]} />
			<Bubble text="SAYA NAIM. BERSAMA SAYA, FADLI DAN ADAM!" x={1240} y={110} p={bounceIn(f, 14, 12)} side="l" size={22} />
			<div style={{position: 'absolute', left: 60, bottom: 50, opacity: r(f, 6, 12)}}>
				<Block text="BORAK BERANDA" bg={P.burg} size={24} h={74} />
			</div>
		</AbsoluteFill>
	);
};

const S3Kerancuan: React.FC<{f: number}> = ({f}) => {
	const ms = ['BOLEH', 'HANTAR', 'TUGASAN'];
	const en = ['YOU', 'SUBMIT', 'DEADLINE'];
	const mix = r(f, 64, 20, Easing.bezier(0.65, 0, 0.35, 1));
	const pop = bounceIn(f, 92, 14);
	return (
		<AbsoluteFill>
			<Sky f={f + 270} dim={0.25} />
			<Banner f={f} n="01" title="APA ITU KERANCUAN BAHASA?" />
			{/* dua lajur blok jatuh ke mangkuk */}
			{[ms, en].map((col, ci) =>
				col.map((w, i) => {
					const p = bounceIn(f, 14 + i * 6 + ci * 3, 14);
					const sx = ci ? 1380 : 300;
					const sy = 250 + i * 120;
					const tx = 960 - 100 + (rnd(i + ci * 5) - 0.5) * 220;
					const ty = 640 + (rnd(i * 3 + ci) - 0.5) * 60;
					const x = sx + (tx - sx) * mix;
					const y = sy * p + (ty - sy) * mix - (1 - p) * 600;
					return (
						<div key={ci + w} style={{position: 'absolute', left: x, top: y, transform: `rotate(${mix * (rnd(i + ci) - 0.5) * 50}deg) scale(${1 - mix * 0.35})`, opacity: 1 - r(f, 88, 6)}}>
							<Block text={w} bg={ci ? '#3E5C7A' : P.burg} size={30} h={90} />
						</div>
					);
				}),
			)}
			{/* label lajur */}
			<div style={{position: 'absolute', left: 300, top: 200, opacity: 1 - mix}}>
				<PixText size={20} color={P.beige} depth={3}>
					BAHASA MELAYU
				</PixText>
			</div>
			<div style={{position: 'absolute', left: 1380, top: 200, opacity: 1 - mix}}>
				<PixText size={20} color="#A9C6E2" depth={3}>
					BAHASA ASING
				</PixText>
			</div>
			{/* mangkuk blok */}
			<div style={{position: 'absolute', left: 660, top: 700, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
				<div style={{display: 'flex'}}>
					{Array.from({length: 10}).map((_, i) => (
						<div key={i} style={{width: 60, height: 60, background: i === 0 || i === 9 ? P.beige : 'transparent', boxShadow: i === 0 || i === 9 ? 'inset -6px -6px 0 rgba(0,0,0,0.3)' : undefined}} />
					))}
				</div>
				<div style={{display: 'flex'}}>
					{Array.from({length: 10}).map((_, i) => (
						<div key={i} style={{width: 60, height: 60, background: P.beige, boxShadow: 'inset -6px -6px 0 rgba(0,0,0,0.3), inset 6px 6px 0 rgba(255,255,255,0.25)'}} />
					))}
				</div>
			</div>
			<Burst f={f} at={90} x={960} y={680} colors={['#3E5C7A', P.burg, P.gold, P.cream]} n={24} seed={8} />
			{pop > 0 ? (
				<AbsoluteFill style={{alignItems: 'center', top: 300}}>
					<div style={{transform: `scale(${pop})`}}>
						<PixText size={120} color="#E8657E" depth={12}>
							ROJAK!
						</PixText>
					</div>
					<div style={{marginTop: 40, opacity: r(f, 104, 10), display: 'flex', gap: 18, alignItems: 'center'}}>
						<Block text="CAMPUR ADUK" bg={P.burg2} size={22} h={72} />
						<PixText size={30} color={P.gold} depth={3}>
							+
						</PixText>
						<Block text="TAK IKUT SISTEM" bg={P.burg2} size={22} h={72} />
						<PixText size={30} color={P.gold} depth={3}>
							=
						</PixText>
						<Block text="RANCU" bg={P.gold} fg={P.char} size={26} h={72} />
					</div>
				</AbsoluteFill>
			) : null}
		</AbsoluteFill>
	);
};

type Fix = {bad: string; good: string | null};
const EX1: Fix[] = [
	{bad: 'BOLEH TAK', good: 'BOLEHKAH'},
	{bad: 'YOU', good: 'AWAK'},
	{bad: 'SUBMIT', good: 'MENGHANTAR'},
	{bad: 'ASSIGNMENT TU', good: 'TUGASAN ITU'},
	{bad: 'BEFORE DEADLINE?', good: 'SEBELUM TARIKH AKHIR?'},
];
const EX2: Fix[] = [
	{bad: 'BANYAK', good: 'RAMAI'},
	{bad: 'PELAJAR-PELAJAR', good: 'PELAJAR'},
	{bad: 'DATANG KE MAJLIS ITU.', good: null},
];

const FixRow: React.FC<{f: number; items: Fix[]; start: number; y: number; step: number; seed: number; drops?: number[]; hitsAt?: number[]}> = ({f, items, start, y, step, seed, drops, hitsAt}) => {
	const hits = hitsAt ?? items.map((it, i) => (it.good ? start + 26 + i * step : -1));
	// anggaran pusat setiap blok (fon piksel ≈ 1 em per aksara)
	const wid = items.map((it) => 52 + it.bad.length * 26);
	const tot = wid.reduce((a, b) => a + b, 0) + 14 * (items.length - 1);
	let acc = 960 - tot / 2;
	const cx = wid.map((w) => {
		const c = acc + w / 2;
		acc += w + 14;
		return c;
	});
	return (
		<>
			<div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14, rowGap: 18, padding: '0 80px'}}>
				{items.map((it, i) => {
					const inP = bounceIn(f, drops ? drops[i] : start + i * 3, 12);
					const fixed = it.good && f >= hits[i];
					const pop = fixed ? bounceIn(f, hits[i], 10) : 1;
					return (
						<div key={i} style={{transform: `translateY(${(1 - inP) * -500}px) scale(${fixed ? 0.6 + 0.4 * pop : 1})`}}>
							<Block
								text={fixed ? (it.good as string) : it.bad}
								bg={fixed ? '#2F7D4F' : it.good ? '#8E2F3F' : '#5A4A50'}
								size={26}
								h={88}
								style={!fixed && it.good ? {outline: `6px solid ${f % 16 < 8 ? '#FF6B6B' : 'transparent'}`, outlineOffset: -6} : undefined}
							/>
						</div>
					);
				})}
			</div>
			{/* tukul */}
			{items.map((it, i) => {
				if (!it.good) return null;
				const t = f - (hits[i] - 10);
				if (t < 0 || t > 16) return null;
				const ang = interpolate(t, [0, 10, 16], [-70, 10, -30]);
				return (
					<div key={'h' + i} style={{position: 'absolute', left: cx[i] - 40, top: y - 196, transform: `rotate(${ang}deg)`, transformOrigin: '40px 190px'}}>
						<div style={{width: 120, height: 60, background: '#8A8F98', boxShadow: 'inset -8px -8px 0 rgba(0,0,0,0.35), inset 8px 8px 0 rgba(255,255,255,0.3)', marginLeft: -20}} />
						<div style={{width: 26, height: 140, background: '#8B5A2B', marginLeft: 27, boxShadow: 'inset -6px 0 0 rgba(0,0,0,0.3)'}} />
					</div>
				);
			})}
			{items.map((it, i) =>
				it.good ? <Burst key={'b' + i} f={f} at={hits[i]} x={cx[i]} y={y + 44} colors={['#8E2F3F', '#FF6B6B', P.cream]} n={12} seed={seed + i} /> : null,
			)}
		</>
	);
};

const S4Betulkan: React.FC<{f: number}> = ({f}) => {
	const sc1 = bounceIn(f, 228, 12);
	return (
		<AbsoluteFill>
			<Sky f={f + 420} dim={0.3} />
			<Banner f={f} n="02" title="CABARAN ROJAK BETULKAN" />
			<div style={{position: 'absolute', left: 0, right: 0, top: 580, display: 'flex', justifyContent: 'center', opacity: r(f, 6, 10)}}>
				<PixText size={22} color={P.gold} depth={3}>
					{f < 138 ? 'FADLI: AYAT ROJAK...' : 'ADAM: VERSI BAKU!'}
				</PixText>
			</div>
			<FixRow f={f} items={EX1} start={8} y={420} step={18} seed={20} drops={[8, 38, 55, 70, 103]} hitsAt={[142, 150, 160, 180, 211]} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 690, display: 'flex', justifyContent: 'center'}}>
				{sc1 > 0 ? (
					<div style={{transform: `scale(${sc1})`}}>
						<Block text="BAKU +1" bg={P.gold} fg={P.char} size={30} h={86} />
					</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};

const Phone: React.FC<{f: number}> = ({f}) => {
	const msgs = ['BTW, KAT MANA?', 'JOM SHOPPING!', 'OK NANTI MEETING'];
	return (
		<div style={{position: 'absolute', left: 180, top: 230, width: 380, height: 640, background: '#1C1A1E', boxShadow: `0 0 0 12px #3A363C, 14px 14px 0 12px rgba(0,0,0,0.4)`}}>
			<div style={{position: 'absolute', inset: 22, background: '#E9E2D6', overflow: 'hidden'}}>
				<div style={{height: 56, background: P.burg, fontFamily: PX, fontSize: 16, color: P.cream, display: 'flex', alignItems: 'center', paddingLeft: 18}}>@ SEMBANG</div>
				{msgs.map((m, i) => {
					const p = bounceIn(f, 18 + i * 14, 10);
					return (
						<div key={i} style={{margin: '20px 16px 0', display: 'flex', justifyContent: i % 2 ? 'flex-end' : 'flex-start', transform: `scale(${p})`}}>
							<div style={{background: i % 2 ? '#6FA88A' : '#FFFFFF', fontFamily: PX, fontSize: 15, lineHeight: 1.5, padding: '12px 14px', color: P.char, boxShadow: '4px 4px 0 rgba(0,0,0,0.25)'}}>{m}</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

const S5Medsos: React.FC<{f: number}> = ({f}) => {
	const fly = ['BTW', 'KAT', 'SHOPPING'];
	const fixes: [string, string][] = [
		['KAT', 'DI'],
		['SHOPPING', 'MEMBELI-BELAH'],
		['BTW', 'ELAK DALAM TULISAN RASMI'],
	];
	return (
		<AbsoluteFill>
			<Sky f={f + 660} dim={0.3} />
			<Banner f={f} n="03" title="MEDIA SOSIAL > PENULISAN MURID" />
			<Phone f={f} />
			{/* kata terbang ke buku */}
			{fly.map((w, i) => {
				const s = 60 + i * 8;
				const t = Math.max(0, Math.min(1, (f - s) / 22));
				if (t <= 0 || t >= 1) return null;
				const x = 560 + (1240 - 560) * t;
				const y = 420 + i * 70 - Math.sin(t * Math.PI) * 220;
				return (
					<div key={w} style={{position: 'absolute', left: x, top: y, transform: `rotate(${t * 360}deg)`}}>
						<Block text={w} bg="#3E5C7A" size={20} h={64} />
					</div>
				);
			})}
			{/* buku latihan */}
			<div style={{position: 'absolute', left: 1180, top: 250, width: 620, height: 600, background: P.cream, boxShadow: `0 0 0 10px ${P.burg}, 14px 14px 0 10px rgba(0,0,0,0.4)`}}>
				<div style={{height: 70, background: P.red, fontFamily: PX, fontSize: 20, color: P.cream, display: 'flex', alignItems: 'center', paddingLeft: 24}}>KARANGAN MURID</div>
				{[0, 1, 2, 3, 4, 5, 6].map((k) => (
					<div key={k} style={{position: 'absolute', left: 24, right: 24, top: 120 + k * 64, height: 3, background: 'rgba(85,32,51,0.15)'}} />
				))}
				{fixes.map(([a, b], i) => {
					const at = 92 + i * 12;
					const p = bounceIn(f, at, 12);
					const ok = f >= at + 14;
					return (
						<div key={a} style={{position: 'absolute', left: 30, top: 130 + i * 128, transform: `scale(${p})`, transformOrigin: 'left center'}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
								<Block text={a} bg="#8E2F3F" size={18} h={58} pad={16} style={{textDecoration: 'line-through'}} />
								<PixText size={22} color={P.burg} depth={0}>
									{'>'}
								</PixText>
								{ok ? <Block text={b} bg="#2F7D4F" size={b.length > 14 ? 13 : 18} h={58} pad={14} /> : null}
							</div>
						</div>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: 1180, top: 880, opacity: r(f, 100, 10)}}>
				<Block text="CONTOH ILUSTRASI" bg={P.gold} fg={P.char} size={16} h={52} />
			</div>
			{[0, 1, 2].map((i) => (
				<Burst key={i} f={f} at={92 + i * 12 + 14} x={1500} y={290 + i * 128} colors={[P.green, P.gold, P.cream]} n={10} seed={60 + i} size={14} />
			))}
		</AbsoluteFill>
	);
};

const S6Outro: React.FC<{f: number}> = ({f}) => (
	<AbsoluteFill>
		<Sky f={f + 810} />
		<Porch f={f + 150} wave talk={f > 4 && f < 92 ? FADLI : null} zoom={interpolate(f, [0, 90], [1.75, 1.9])} panX={-430} />
		<AbsoluteFill style={{background: 'linear-gradient(90deg, transparent 40%, rgba(30,12,20,0.75) 62%)'}} />
		<div style={{position: 'absolute', right: 80, top: 210, width: 760, textAlign: 'right'}}>
			<div style={{transform: `translateX(${(1 - r(f, 2, 14)) * 400}px)`}}>
				<PixText size={30} color={P.cream} depth={5}>
					BAHASA MENCERMINKAN
				</PixText>
				<PixText size={30} color={P.cream} depth={5}>
					PEMIKIRAN.
				</PixText>
			</div>
			<div style={{marginTop: 50, display: 'flex', justifyContent: 'flex-end', gap: 14, opacity: r(f, 22, 10)}}>
				{['NAIM', 'FADLI', 'ADAM'].map((n, i) => (
					<div key={n} style={{transform: `scale(${bounceIn(f, 22 + i * 6, 12)})`}}>
						<Block text={n} bg={[P.burg, P.red, P.burg2][i]} size={22} h={70} />
					</div>
				))}
			</div>
			<div style={{marginTop: 34, opacity: r(f, 44, 10)}}>
				<PixText size={16} color={P.gold} depth={3}>
					BICARA BAHASA · BMMB3233 · TUTORIAL M13
				</PixText>
			</div>
		</div>
	</AbsoluteFill>
);

const S7Ad: React.FC<{f: number}> = ({f}) => {
	const inP = bounceIn(f, 4, 16);
	return (
		<AbsoluteFill style={{background: P.char}}>
			{/* corak blok latar */}
			{Array.from({length: 12 * 7}).map((_, i) => {
				const cx = i % 12,
					cy = Math.floor(i / 12);
				const v = Math.sin(f * 0.12 + cx * 0.7 + cy * 0.5);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: cx * 160,
							top: cy * 160,
							width: 160,
							height: 160,
							background: v > 0.6 ? P.burg2 : (cx + cy) % 2 ? P.burg : '#45192A',
							boxShadow: 'inset -10px -10px 0 rgba(0,0,0,0.25), inset 10px 10px 0 rgba(255,255,255,0.05)',
						}}
					/>
				);
			})}
			<AbsoluteFill style={{background: 'rgba(20,8,14,0.35)'}} />
			{/* label IKLAN */}
			<div style={{position: 'absolute', left: 90, top: 70, display: 'flex', gap: 16, alignItems: 'center', transform: `translateY(${(1 - inP) * -200}px)`}}>
				<Block text="IKLAN" bg={P.gold} fg={P.char} size={26} h={74} />
				<PixText size={18} color={P.beige} depth={3}>
					REHAT SEBENTAR
				</PixText>
			</div>
			{/* bingkai video blok */}
			<div
				style={{
					position: 'absolute',
					left: 140,
					top: 190,
					width: 720,
					height: 720,
					background: P.beige,
					padding: 26,
					boxShadow: 'inset -14px -14px 0 rgba(0,0,0,0.3), inset 14px 14px 0 rgba(255,255,255,0.35), 18px 18px 0 rgba(0,0,0,0.4)',
					transform: `scale(${inP})`,
				}}
			>
				<div style={{width: '100%', height: '100%', overflow: 'hidden', background: '#000'}}>
					<OffthreadVideo src={staticFile('suno.mp4')} startFrom={Math.round(71.6 * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%'}} />
				</div>
			</div>
			{/* tajuk lagu */}
			<div style={{position: 'absolute', left: 960, top: 250}}>
				<div style={{opacity: r(f, 14, 10)}}>
					<PixText size={18} color={P.gold} depth={3}>
						LAGU ORIGINAL · SEDANG DIMAINKAN
					</PixText>
				</div>
				<div style={{marginTop: 36, display: 'flex', flexDirection: 'column', gap: 12}}>
					{['LIMA', 'MIT', 'LAGI'].map((w, i) => (
						<div key={w} style={{transform: `translateX(${(1 - bounceIn(f, 16 + i * 6, 14)) * 900}px)`}}>
							<PixText size={92} color={i === 2 ? '#E8657E' : P.cream} depth={10}>
								{w}
							</PixText>
						</div>
					))}
				</div>
				{/* equaliser blok */}
				<div style={{display: 'flex', gap: 10, alignItems: 'flex-end', height: 150, marginTop: 40}}>
					{Array.from({length: 14}).map((_, i) => {
						const n = Math.max(1, Math.round(1 + 5 * Math.abs(Math.sin(f * 0.33 + i * 0.8) * Math.cos(f * 0.11 + i * 0.4))));
						return (
							<div key={i} style={{display: 'flex', flexDirection: 'column-reverse', gap: 4}}>
								{Array.from({length: n}).map((_, k) => (
									<div key={k} style={{width: 46, height: 20, background: k > 3 ? '#E8657E' : k > 1 ? P.gold : P.green}} />
								))}
							</div>
						);
					})}
				</div>
			</div>
			{/* bar kemajuan blok */}
			<div style={{position: 'absolute', left: 0, bottom: 0, display: 'flex'}}>
				{Array.from({length: 24}).map((_, i) => (
					<div key={i} style={{width: 80, height: 22, background: i / 24 < f / 300 ? P.gold : 'rgba(255,255,255,0.1)', boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.3)'}} />
				))}
			</div>
		</AbsoluteFill>
	);
};


/** Sari kata piksel bagi klip suara sebenar (masa dalam bingkai promo) */
export const VOX: {a: number; b: number; who: string; t: string}[] = [
	{a: 0, b: 67, who: 'NAIM', t: 'Selamat datang ke Bicara Bahasa.'},
	{a: 65, b: 118, who: 'NAIM', t: 'Rojak atau rancu?'},
	{a: 276, b: 372, who: 'NAIM', t: 'Apa sebenarnya yang dimaksudkan dengan kerancuan bahasa?'},
	{a: 373, b: 410, who: 'ADAM', t: '...bercampur aduk...'},
	{a: 429, b: 560, who: 'FADLI', t: 'Boleh tak you submit assignment tu before deadline?'},
	{a: 561, b: 669, who: 'ADAM', t: 'Bolehkah awak menghantar tugasan itu sebelum tarikh akhir?'},
	{a: 678, b: 777, who: 'FADLI', t: 'Aku pernah juga hampir tulis BTW...'},
	{a: 778, b: 795, who: 'FADLI', t: 'By the way.'},
	{a: 810, b: 897, who: 'FADLI', t: 'Roti canai boleh rojak dengan kuah.'},
];
const WHO_C: Record<string, string> = {NAIM: '#A64D62', FADLI: '#7A1F2E', ADAM: '#3A3A44'};

const PixSubs: React.FC<{f: number}> = ({f}) => {
	const c = VOX.find((v) => f >= v.a && f < v.b);
	if (!c) return null;
	const p = bounceIn(f, c.a, 8);
	return (
		<div style={{position: 'absolute', left: 0, right: 0, bottom: 34, display: 'flex', justifyContent: 'center'}}>
			<div style={{display: 'flex', alignItems: 'stretch', transform: `scale(${0.85 + 0.15 * p})`, opacity: p, boxShadow: '8px 8px 0 rgba(0,0,0,0.45)'}}>
				<div style={{background: WHO_C[c.who], color: P.cream, fontFamily: PX, fontSize: 20, padding: '16px 18px', display: 'flex', alignItems: 'center'}}>{c.who}</div>
				<div style={{background: 'rgba(20,10,16,0.88)', color: P.cream, fontFamily: PX, fontSize: 22, lineHeight: 1.5, padding: '16px 22px', maxWidth: 1400}}>{c.t}</div>
			</div>
		</div>
	);
};

/** Peralihan sapuan blok pada setiap potongan */
const BlockWipe: React.FC<{f: number}> = ({f}) => {
	const c = CUTS.find((t) => Math.abs(f - t) <= 14);
	if (c === undefined) return null;
	const g = f - c; // -14..14
	const cols = 16,
		rows = 9,
		s = 120;
	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			{Array.from({length: cols * rows}).map((_, i) => {
				const x = i % cols,
					y = Math.floor(i / cols);
				const delay = (x + y) * 0.45;
				const k = g < 0 ? Math.max(0, Math.min(1, (g + 14 - delay * 0.5) / 6)) : Math.max(0, Math.min(1, 1 - (g - delay * 0.5) / 6));
				return k > 0 ? (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: x * s + (s * (1 - k)) / 2,
							top: y * s + (s * (1 - k)) / 2,
							width: s * k + 1,
							height: s * k + 1,
							background: (x + y) % 2 ? P.burg : P.burg2,
						}}
					/>
				) : null;
			})}
		</AbsoluteFill>
	);
};

export const Promo: React.FC = () => {
	const f = useCurrentFrame();
	const S: [number, number, React.FC<{f: number}>][] = [
		[0, 120, S1Title],
		[120, 150, S2Porch],
		[270, 150, S3Kerancuan],
		[420, 240, S4Betulkan],
		[660, 150, S5Medsos],
		[810, 90, S6Outro],
		[900, 300, S7Ad],
	];
	return (
		<AbsoluteFill style={{background: P.char, imageRendering: 'pixelated'}}>
			{S.map(([a, d, C]) => (
				<Sequence key={a} from={a} durationInFrames={d}>
					<C f={Math.max(0, f - a)} />
				</Sequence>
			))}
			<PixSubs f={f} />
			<BlockWipe f={f} />
		</AbsoluteFill>
	);
};
