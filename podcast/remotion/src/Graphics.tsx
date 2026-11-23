import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, Eyebrow, F, Line, MaskUp, clamp01, easeIn, easeInOut, easeOut, lerp, rise} from './theme';
import {Gfx, TL} from './timeline';

/** Pecah teks "*kata*" kepada token {t, hl} */
const toks = (s: string) =>
	s
		.split(/(\*[^*]+\*)/g)
		.filter(Boolean)
		.map((p) => (p.startsWith('*') && p.endsWith('*') ? {t: p.slice(1, -1), hl: true} : {t: p, hl: false}));

/** Keluar lembut untuk semua grafik */
const outOf = (g: number, dur: number, d = 14) => rise(g, dur - d, d, easeIn);

/* ---------------------------------------------------------------- WORD ART */
const Kerancuan: React.FC<{g: number; dur: number}> = ({g, dur}) => {
	const o = outOf(g, dur);
	return (
		<div style={{opacity: 1 - o, transform: `translateY(${-o * 20}px)`}}>
			<Eyebrow style={{opacity: rise(g, 0, 14)}}>Kata kunci</Eyebrow>
			<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 92, lineHeight: 0.98, color: C.cream, marginTop: 10, textShadow: '0 6px 24px rgba(0,0,0,0.45)'}}>
				<MaskUp p={rise(g, 2, 18)}>KERANCUAN</MaskUp>
				<br />
				<MaskUp p={rise(g, 8, 18)}>
					<span style={{color: C.beige}}>BAHASA</span>
				</MaskUp>
			</div>
			<Line p={rise(g, 14, 22, easeInOut)} w={300} color={C.red} h={6} style={{marginTop: 12}} />
		</div>
	);
};

const Rojak: React.FC<{g: number; dur: number}> = ({g, dur}) => {
	const o = outOf(g, dur);
	const L = ['R', 'O', 'J', 'A', 'K'];
	const cols = [C.red, C.cream, C.gold, C.beige, C.red];
	const rot = [-8, 5, -4, 7, -6];
	const dy = [0, -14, 10, -6, 8];
	return (
		<div style={{opacity: 1 - o}}>
			<Eyebrow style={{opacity: rise(g, 0, 14)}}>Bahasa</Eyebrow>
			<div style={{display: 'flex', marginTop: 6}}>
				{L.map((ch, k) => {
					const p = rise(g, 2 + k * 3, 16);
					return (
						<span
							key={k}
							style={{
								display: 'inline-block',
								fontFamily: F.display,
								fontWeight: 900,
								fontSize: 140,
								lineHeight: 1,
								color: cols[k],
								marginLeft: k ? -26 : 0,
								transform: `translateY(${dy[k] + (1 - p) * 80}px) rotate(${rot[k] * p}deg) scale(${lerp(0.6, 1, p)})`,
								opacity: p,
								textShadow: `4px 4px 0 ${C.burgundy}, 0 10px 30px rgba(0,0,0,0.4)`,
								mixBlendMode: 'normal',
							}}
						>
							{ch}
						</span>
					);
				})}
			</div>
		</div>
	);
};

const Sintaksis: React.FC<{g: number; dur: number}> = ({g, dur}) => {
	const o = outOf(g, dur);
	// blok perkataan bersepah -> tersusun menjadi ayat
	const W = [
		{w: 'Subjek', c: C.red},
		{w: '+', c: 'transparent'},
		{w: 'Predikat', c: C.burgundy},
		{w: '=', c: 'transparent'},
		{w: 'AYAT', c: C.gold},
	];
	const scatter = [
		[-60, -90, -14],
		[0, 0, 0],
		[40, 80, 10],
		[0, 0, 0],
		[90, -60, 18],
	];
	const p = rise(g, 18, 28, easeInOut);
	return (
		<div style={{opacity: 1 - o}}>
			<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 84, color: C.cream, letterSpacing: lerp(0.4, 0.08, rise(g, 0, 26)) + 'em', textShadow: '0 6px 24px rgba(0,0,0,0.45)'}}>
				<MaskUp p={rise(g, 0, 18)}>SINTAKSIS</MaskUp>
			</div>
			<div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 18}}>
				{W.map((x, k) => {
					const [sx, sy, r] = scatter[k];
					const a = rise(g, 6 + k * 3, 14);
					const op = x.c === 'transparent' ? p : a;
					return (
						<div
							key={k}
							style={{
								fontFamily: F.display,
								fontWeight: 800,
								fontSize: x.c === 'transparent' ? 40 : 30,
								color: x.c === 'transparent' ? C.cream : x.w === 'AYAT' ? C.charcoal : C.cream,
								background: x.c,
								padding: x.c === 'transparent' ? 0 : '10px 18px',
								borderRadius: 10,
								opacity: op,
								transform: `translate(${sx * (1 - p)}px, ${sy * (1 - p)}px) rotate(${r * (1 - p)}deg)`,
								boxShadow: x.c === 'transparent' ? undefined : '0 8px 20px rgba(0,0,0,0.3)',
							}}
						>
							{x.w}
						</div>
					);
				})}
			</div>
		</div>
	);
};

const Baku: React.FC<{g: number; dur: number}> = ({g, dur}) => {
	const o = outOf(g, dur);
	const grid = rise(g, 0, 20, easeInOut);
	return (
		<div style={{opacity: 1 - o, position: 'relative', padding: '18px 26px', background: 'rgba(245,240,234,0.94)', borderRadius: 6, boxShadow: '0 16px 40px rgba(0,0,0,0.35)', clipPath: `inset(0 ${(1 - grid) * 100}% 0 0)`}}>
			{/* garis grid kemas */}
			{[0, 1, 2].map((k) => (
				<div key={k} style={{position: 'absolute', left: 0, right: 0, top: 22 + k * 44, height: 1, background: 'rgba(85,32,51,0.18)'}} />
			))}
			<Eyebrow color={C.red} style={{fontSize: 18}}>
				Ragam rasmi
			</Eyebrow>
			<div style={{fontFamily: F.serif, fontWeight: 600, fontSize: 78, color: C.burgundy, lineHeight: 1.05, marginTop: 6, display: 'flex', alignItems: 'center', gap: 18}}>
				<MaskUp p={rise(g, 8, 18)}>Bahasa Baku</MaskUp>
				<svg width="54" height="54" viewBox="0 0 54 54" style={{opacity: rise(g, 20, 10)}}>
					<circle cx="27" cy="27" r="24" fill={C.gold} />
					<path d="M15 28 L24 37 L40 19" stroke={C.charcoal} strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="40" strokeDashoffset={40 * (1 - rise(g, 22, 14))} />
				</svg>
			</div>
		</div>
	);
};

const MedSos: React.FC<{g: number; dur: number}> = ({g, dur}) => {
	const o = outOf(g, dur);
	const icons = ['chat', 'heart', 'hash', 'at', 'share'];
	return (
		<div style={{opacity: 1 - o}}>
			<div style={{display: 'flex', gap: 16, marginBottom: 14}}>
				{icons.map((ic, k) => {
					const p = rise(g, k * 4, 16);
					const fl = Math.sin((g + k * 9) / 14) * 6;
					return (
						<div
							key={ic}
							style={{
								width: 66,
								height: 66,
								borderRadius: 18,
								background: k % 2 ? C.red : C.burgundy,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								transform: `translateY(${(1 - p) * 40 + fl}px) scale(${p})`,
								boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
							}}
						>
							<Icon name={ic} />
						</div>
					);
				})}
			</div>
			<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 76, color: C.cream, lineHeight: 1, textShadow: '0 6px 24px rgba(0,0,0,0.45)'}}>
				<MaskUp p={rise(g, 10, 18)}>MEDIA</MaskUp> <MaskUp p={rise(g, 14, 18)}>
					<span style={{color: C.gold}}>SOSIAL</span>
				</MaskUp>
			</div>
		</div>
	);
};

export const Icon: React.FC<{name: string; size?: number; color?: string}> = ({name, size = 34, color = C.cream}) => {
	const s = {fill: 'none', stroke: color, strokeWidth: 2.4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
	return (
		<svg width={size} height={size} viewBox="0 0 24 24">
			{name === 'chat' && <path {...s} d="M4 5h16v11H9l-5 4z" />}
			{name === 'heart' && <path {...s} d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />}
			{name === 'hash' && <path {...s} d="M9 4 7 20M17 4l-2 16M4 9h16M3 15h16" />}
			{name === 'at' && (
				<g {...s}>
					<circle cx="12" cy="12" r="4" />
					<path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1" />
				</g>
			)}
			{name === 'share' && <path {...s} d="M14 5l6 6-6 6M20 11H9a5 5 0 0 0-5 5v3" />}
			{name === 'talk' && (
				<g {...s}>
					<path d="M3 6h11v7H8l-4 3z" />
					<path d="M14 9h7v7l-3-2h-4" />
				</g>
			)}
			{name === 'phone' && (
				<g {...s}>
					<rect x="7" y="2.5" width="10" height="19" rx="2" />
					<path d="M11 18.5h2" />
				</g>
			)}
			{name === 'pen' && <path {...s} d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" />}
		</svg>
	);
};

/* ---------------------------------------------------------------- KAD AKADEMIK (sebelah kanan, split screen) */
const Paper: React.FC<{p: number; o: number; children: React.ReactNode; style?: React.CSSProperties}> = ({p, o, children, style}) => (
	<div
		style={{
			background: C.cream,
			borderRadius: 18,
			padding: '40px 46px',
			boxShadow: '0 30px 70px rgba(0,0,0,0.45)',
			clipPath: `inset(0 0 ${(1 - p) * 100}% 0 round 18px)`,
			transform: `translateY(${(1 - p) * 30 - o * 20}px)`,
			opacity: 1 - o,
			position: 'relative',
			overflow: 'hidden',
			...style,
		}}
	>
		<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 10, background: C.burgundy}} />
		{children}
	</div>
);

const Definition: React.FC<{g: number; dur: number; d: any}> = ({g, dur, d}) => {
	const p = rise(g, 8, 22, easeInOut);
	const o = outOf(g, dur, 16);
	const lines: string[] = d.lines;
	return (
		<Paper p={p} o={o}>
			<Eyebrow color={C.red}>Definisi</Eyebrow>
			<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.burgundy, lineHeight: 1.02, marginTop: 12}}>
				<MaskUp p={rise(g, 14, 18)}>KERANCUAN</MaskUp>
				<br />
				<MaskUp p={rise(g, 18, 18)}>BAHASA</MaskUp>
			</div>
			<Line p={rise(g, 22, 22, easeInOut)} w={160} color={C.gold} h={4} style={{marginTop: 18}} />
			<div style={{marginTop: 22, fontFamily: F.sub, fontWeight: 500, fontSize: 34, lineHeight: 1.45, color: C.charcoal}}>
				{lines.map((l, k) => (
					<div key={k} style={{opacity: rise(g, 30 + k * (d.step ?? 24), 16), transform: `translateY(${(1 - rise(g, 30 + k * (d.step ?? 24), 16)) * 12}px)`}}>
						{toks(l).map((t, j) =>
							t.hl ? (
								<span key={j} style={{color: C.burgundy, fontWeight: 700, background: `linear-gradient(transparent 62%, rgba(198,164,106,0.45) 62%)`}}>
									{t.t}
								</span>
							) : (
								<span key={j}>{t.t}</span>
							),
						)}
					</div>
				))}
			</div>
		</Paper>
	);
};

const Compare: React.FC<{g: number; dur: number; d: any}> = ({g, dur, d}) => {
	const o = outOf(g, dur, 16);
	const items: {title: string; body: string; ex?: string; at: number}[] = d.items;
	return (
		<div style={{display: 'flex', flexDirection: 'column', gap: 26, opacity: 1 - o}}>
			<Eyebrow color={C.gold} style={{opacity: rise(g, 0, 14)}}>
				Banding beza
			</Eyebrow>
			{items.map((it, k) => {
				const p = rise(g, it.at, 22, easeInOut);
				const dark = k === 1;
				return (
					<div
						key={k}
						style={{
							background: dark ? C.burgundy : C.cream,
							color: dark ? C.cream : C.charcoal,
							borderRadius: 16,
							padding: '28px 36px',
							boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
							clipPath: `inset(0 ${(1 - p) * 100}% 0 0 round 16px)`,
							transform: `translateX(${(1 - p) * 40}px)`,
						}}
					>
						<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 46, color: dark ? C.gold : C.burgundy}}>{it.title}</div>
						<div style={{fontFamily: F.sub, fontWeight: 500, fontSize: 30, lineHeight: 1.42, marginTop: 8}}>{it.body}</div>
						{it.ex ? (
							<div
								style={{
									marginTop: 14,
									fontFamily: F.serif,
									fontStyle: 'italic',
									fontSize: 28,
									color: dark ? C.beige : C.red,
									opacity: rise(g, it.at + 20, 14),
								}}
							>
								Contoh: {toks(it.ex).map((t, j) => (t.hl ? <b key={j} style={{fontStyle: 'normal', background: 'rgba(166,77,98,0.18)', padding: '0 6px', borderRadius: 4}}>{t.t}</b> : <span key={j}>{t.t}</span>))}
							</div>
						) : null}
					</div>
				);
			})}
		</div>
	);
};

const Sentence: React.FC<{s: string; g: number; start: number; mode: 'asal' | 'baku'; size: number}> = ({s, g, start, mode, size}) => {
	let k = 0;
	return (
		<div style={{fontFamily: F.sub, fontWeight: 600, fontSize: size, lineHeight: 1.45}}>
			{toks(s).map((t, j) => {
				if (!t.hl) return <span key={j}>{t.t}</span>;
				const u = rise(g, start + 8 + k++ * 5, 14, easeInOut);
				return (
					<span key={j} style={{position: 'relative', display: 'inline-block', whiteSpace: 'pre'}}>
						<span
							style={{
								position: 'absolute',
								left: -4,
								right: -4,
								top: '12%',
								bottom: '8%',
								borderRadius: 6,
								background: mode === 'asal' ? 'rgba(166,77,98,0.22)' : 'rgba(198,164,106,0.35)',
								transform: `scaleX(${u})`,
								transformOrigin: 'left',
							}}
						/>
						<span style={{position: 'relative', color: mode === 'asal' ? C.red : C.burgundy}}>{t.t}</span>
						<span
							style={{
								position: 'absolute',
								left: 0,
								right: 0,
								bottom: 2,
								height: 4,
								borderRadius: 2,
								background: mode === 'asal' ? C.red : C.gold,
								transform: `scaleX(${u})`,
								transformOrigin: 'left',
							}}
						/>
					</span>
				);
			})}
		</div>
	);
};

const Example: React.FC<{g: number; dur: number; d: any}> = ({g, dur, d}) => {
	const p = rise(g, 6, 22, easeInOut);
	const o = outOf(g, dur, 16);
	const fix = d.fixAt as number;
	const f2 = rise(g, fix, 20, easeInOut);
	return (
		<Paper p={p} o={o} style={{padding: '36px 44px 40px'}}>
			<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
				<Eyebrow color={C.red}>Rojak betulkan</Eyebrow>
				<div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 34, color: C.gold}}>
					{d.i}
					<span style={{fontSize: 22, color: C.beige}}> / {d.n}</span>
				</div>
			</div>
			{/* ASAL */}
			<div style={{marginTop: 22, opacity: lerp(1, 0.42, f2), transform: `scale(${lerp(1, 0.94, f2)})`, transformOrigin: 'left top'}}>
				<div style={{fontFamily: F.display, fontWeight: 800, fontSize: 18, letterSpacing: '0.3em', color: C.red}}>ASAL</div>
				<div style={{marginTop: 8, color: C.charcoal}}>
					<Sentence s={d.asal} g={g} start={14} mode="asal" size={34} />
				</div>
			</div>
			{/* anak panah transisi */}
			<div style={{display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0 12px', opacity: f2}}>
				<Line p={f2} w={70} color={C.gold} h={3} />
				<svg width="22" height="22" viewBox="0 0 22 22">
					<path d="M4 6 L11 14 L18 6" stroke={C.gold} strokeWidth="3" fill="none" strokeLinecap="round" />
				</svg>
			</div>
			{/* CADANGAN */}
			<div style={{opacity: f2, clipPath: `inset(0 ${(1 - f2) * 100}% 0 0)`}}>
				<div style={{fontFamily: F.display, fontWeight: 800, fontSize: 18, letterSpacing: '0.3em', color: C.burgundy}}>CADANGAN (BAKU)</div>
				<div style={{marginTop: 8, color: C.charcoal}}>
					<Sentence s={d.baku} g={g} start={fix + 8} mode="baku" size={38} />
				</div>
			</div>
			{d.note ? (
				<div
					style={{
						marginTop: 20,
						paddingTop: 16,
						borderTop: `1px solid rgba(85,32,51,0.18)`,
						fontFamily: F.sub,
						fontWeight: 500,
						fontSize: 24,
						lineHeight: 1.4,
						color: C.burgundy,
						opacity: rise(g, d.noteAt ?? fix + 30, 16),
					}}
				>
					{toks(d.note).map((t, j) => (t.hl ? <b key={j}>{t.t}</b> : <span key={j}>{t.t}</span>))}
				</div>
			) : null}
		</Paper>
	);
};

const Flow: React.FC<{g: number; dur: number; d: any}> = ({g, dur, d}) => {
	const o = outOf(g, dur, 16);
	const steps: {t: string; ic: string; at: number}[] = d.steps;
	return (
		<div style={{opacity: 1 - o, display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
			<Eyebrow color={C.gold} style={{opacity: rise(g, 0, 14)}}>
				Laluan pengaruh
			</Eyebrow>
			{steps.map((s, k) => {
				const p = rise(g, s.at, 20);
				const ar = k < steps.length - 1 ? rise(g, steps[k + 1].at - 10, 14, easeInOut) : 0;
				return (
					<React.Fragment key={k}>
						<div
							style={{
								marginTop: k ? 0 : 20,
								display: 'flex',
								alignItems: 'center',
								gap: 22,
								background: k === steps.length - 1 ? C.burgundy : C.cream,
								borderRadius: 16,
								padding: '20px 30px',
								width: 640,
								boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
								opacity: p,
								transform: `translateY(${(1 - p) * 24}px)`,
							}}
						>
							<div style={{width: 64, height: 64, borderRadius: 32, background: k === steps.length - 1 ? C.gold : C.burgundy, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
								<Icon name={s.ic} size={34} color={k === steps.length - 1 ? C.charcoal : C.cream} />
							</div>
							<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 40, letterSpacing: '0.04em', color: k === steps.length - 1 ? C.cream : C.burgundy}}>{s.t}</div>
						</div>
						{k < steps.length - 1 ? (
							<div style={{marginLeft: 60, height: 54, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
								<div style={{width: 4, height: 34 * ar, background: C.gold, borderRadius: 2}} />
								<svg width="22" height="14" viewBox="0 0 22 14" style={{opacity: ar}}>
									<path d="M2 2 L11 12 L20 2" stroke={C.gold} strokeWidth="3.5" fill="none" strokeLinecap="round" />
								</svg>
							</div>
						) : null}
					</React.Fragment>
				);
			})}
		</div>
	);
};

const Illus: React.FC<{g: number; dur: number; d: any}> = ({g, dur, d}) => {
	const p = rise(g, 6, 22, easeInOut);
	const o = outOf(g, dur, 16);
	const f2 = rise(g, d.fixAt, 20, easeInOut);
	return (
		<Paper p={p} o={o}>
			<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
				<div style={{background: C.gold, color: C.charcoal, fontFamily: F.display, fontWeight: 800, fontSize: 17, letterSpacing: '0.26em', padding: '6px 12px', borderRadius: 4}}>
					CONTOH ILUSTRASI
				</div>
				<Eyebrow color={C.red} style={{fontSize: 18}}>
					{d.label}
				</Eyebrow>
			</div>
			<div style={{marginTop: 22, opacity: lerp(1, 0.42, f2)}}>
				<div style={{fontFamily: F.display, fontWeight: 800, fontSize: 18, letterSpacing: '0.3em', color: C.red}}>{d.asalLabel ?? 'ASAL'}</div>
				<div style={{marginTop: 8, color: C.charcoal}}>
					<Sentence s={d.asal} g={g} start={14} mode="asal" size={32} />
				</div>
			</div>
			<div style={{marginTop: 22, opacity: f2, clipPath: `inset(0 ${(1 - f2) * 100}% 0 0)`}}>
				<div style={{fontFamily: F.display, fontWeight: 800, fontSize: 18, letterSpacing: '0.3em', color: C.burgundy}}>CADANGAN</div>
				<div style={{marginTop: 8, color: C.charcoal}}>
					<Sentence s={d.baku} g={g} start={d.fixAt + 8} mode="baku" size={34} />
				</div>
			</div>
		</Paper>
	);
};


const Chips: React.FC<{g: number; dur: number; d: any}> = ({g, dur, d}) => {
	const p = rise(g, 6, 22, easeInOut);
	const o = outOf(g, dur, 16);
	const items: [string, number][] = d.items;
	return (
		<Paper p={p} o={o}>
			<Eyebrow color={C.red}>Rumusan contoh</Eyebrow>
			<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 52, color: C.burgundy, marginTop: 10, lineHeight: 1.05}}>
				<MaskUp p={rise(g, 12, 18)}>{d.title}</MaskUp>
			</div>
			<div style={{display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 28}}>
				{items.map(([t, at], k) => {
					const q = rise(g, Math.max(14, at), 16);
					return (
						<div
							key={k}
							style={{
								fontFamily: F.sub,
								fontWeight: 600,
								fontSize: 30,
								color: k % 2 ? C.cream : C.burgundy,
								background: k % 2 ? C.burgundy : 'rgba(198,164,106,0.35)',
								padding: '12px 24px',
								borderRadius: 40,
								opacity: q,
								transform: `scale(${lerp(0.7, 1, q)})`,
							}}
						>
							{t}
						</div>
					);
				})}
			</div>
		</Paper>
	);
};

const Points: React.FC<{g: number; dur: number; d: any}> = ({g, dur, d}) => {
	const p = rise(g, 6, 22, easeInOut);
	const o = outOf(g, dur, 16);
	const items: [string, number][] = d.items;
	return (
		<Paper p={p} o={o} style={{padding: '36px 42px'}}>
			<Eyebrow color={C.red}>Penutup</Eyebrow>
			<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 52, color: C.burgundy, marginTop: 8}}>
				<MaskUp p={rise(g, 12, 18)}>{d.title}</MaskUp>
			</div>
			<div style={{marginTop: 18, display: 'flex', flexDirection: 'column', gap: 18}}>
				{items.map(([t, at], k) => {
					const q = rise(g, Math.max(14, at), 18);
					return (
						<div key={k} style={{display: 'flex', gap: 18, opacity: q, transform: `translateX(${(1 - q) * 24}px)`}}>
							<div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 600, fontSize: 46, color: C.gold, lineHeight: 1, minWidth: 40}}>{k + 1}</div>
							<div style={{fontFamily: F.sub, fontWeight: 500, fontSize: 25, lineHeight: 1.42, color: C.charcoal}}>
								{toks(t).map((x, j) => (x.hl ? <b key={j} style={{color: C.burgundy}}>{x.t}</b> : <span key={j}>{x.t}</span>))}
							</div>
						</div>
					);
				})}
			</div>
		</Paper>
	);
};

/* ---------------------------------------------------------------- PENGHANTAR */
const POS: Record<string, React.CSSProperties> = {
	TL: {left: 110, top: 90},
	TR: {right: 110, top: 90, textAlign: 'right'},
	TC: {left: 0, right: 0, top: 80, display: 'flex', justifyContent: 'center'},
	CARD: {left: 1080, top: 0, bottom: 0, width: 760, display: 'flex', flexDirection: 'column', justifyContent: 'center'},
};

const ART: Record<string, React.FC<{g: number; dur: number}>> = {
	kerancuan: Kerancuan,
	rojak: Rojak,
	sintaksis: Sintaksis,
	baku: Baku,
	medsos: MedSos,
};
const CARD: Record<string, React.FC<{g: number; dur: number; d: any}>> = {
	definition: Definition,
	compare: Compare,
	example: Example,
	flow: Flow,
	illus: Illus,
	chips: Chips,
	points: Points,
};

export const Graphics: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<AbsoluteFill>
			{TL.gfx.map((x: Gfx, i) => {
				if (f < x.from || f >= x.from + x.dur) return null;
				const g = f - x.from;
				const A = ART[x.kind];
				if (A) {
					const pos = POS[x.data?.pos ?? 'TL'];
					const panel = x.kind !== 'baku';
					const pin = rise(g, 0, 14, easeInOut);
					const pout = rise(g, x.dur - 14, 14, easeIn);
					return (
						<div key={i} style={{position: 'absolute', ...pos}}>
							<div
								style={
									panel
										? {
												display: 'inline-block',
												textAlign: 'left',
												background: 'rgba(37,35,38,0.66)',
												borderLeft: `6px solid ${C.red}`,
												borderRadius: 14,
												padding: '20px 30px 24px',
												boxShadow: '0 18px 40px rgba(0,0,0,0.3)',
												clipPath: `inset(0 ${(1 - pin) * 100}% 0 0 round 14px)`,
												opacity: 1 - pout,
											}
										: {display: 'inline-block', textAlign: 'left'}
								}
							>
								<A g={g} dur={x.dur} />
							</div>
						</div>
					);
				}
				const K = CARD[x.kind];
				if (K) {
					return (
						<div key={i} style={{position: 'absolute', ...POS.CARD}}>
							<K g={g} dur={x.dur} d={x.data} />
						</div>
					);
				}
				return null;
			})}
		</AbsoluteFill>
	);
};
