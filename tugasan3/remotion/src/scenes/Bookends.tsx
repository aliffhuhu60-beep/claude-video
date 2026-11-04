import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C, Eyebrow, F, FPS, INTRO, OUTRO, lerp, life, rise} from '../lib';
import {REFS} from './Closing';

/** Latar bergerak: grid hanyut perlahan, cahaya lembut dan cincin orbit emas. */
const MotionBg: React.FC<{t: number}> = ({t}) => {
	const dx = (t * 14) % 80;
	const dy = (t * 6) % 80;
	const lx = 25 + 18 * Math.sin(t * 0.25);
	const ly = 30 + 10 * Math.cos(t * 0.2);
	return (
		<AbsoluteFill style={{background: `radial-gradient(1300px 850px at ${lx}% ${ly}%, ${C.navy3} 0%, ${C.navy2} 45%, ${C.navy} 100%)`}}>
			<svg width={1920} height={1080} style={{position: 'absolute', opacity: 0.1}}>
				{Array.from({length: 26}).map((_, i) => (
					<line key={'v' + i} x1={i * 80 - dx} y1={0} x2={i * 80 - dx} y2={1080} stroke="#fff" strokeWidth={1} />
				))}
				{Array.from({length: 15}).map((_, i) => (
					<line key={'h' + i} x1={0} y1={i * 80 - dy} x2={1920} y2={i * 80 - dy} stroke="#fff" strokeWidth={1} />
				))}
			</svg>
			<svg width={1920} height={1080} style={{position: 'absolute'}}>
				{[260, 380, 500].map((r, i) => {
					const a = t * (i % 2 ? -9 : 7) + i * 40;
					return (
						<g key={r} transform={`translate(1520 540) rotate(${a})`} opacity={0.22 - i * 0.05}>
							<circle r={r} fill="none" stroke={C.gold} strokeWidth={1.4} strokeDasharray={i === 1 ? '4 10' : undefined} />
							<circle cx={r} cy={0} r={6 - i} fill={C.gold} />
						</g>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};

const Words: React.FC<{t: number; words: string[]; start: number; gold: number; size: number; step?: number}> = ({t, words, start, gold, size, step = 0.16}) => (
	<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: size, lineHeight: 1.06, color: C.white}}>
		{words.map((w, i) => {
			const p = rise(t, start + i * step, 0.7);
			return (
				<span
					key={i}
					style={{
						display: 'inline-block',
						marginRight: size * 0.24,
						opacity: p,
						transform: `translateY(${lerp(size * 0.5, 0, p)}px)`,
						color: i >= gold ? C.gold : C.white,
					}}
				>
					{w}
				</span>
			);
		})}
	</div>
);

const PAGES = [REFS.slice(0, 12), REFS.slice(12)];
const TITLE_END = 4.5;
const PAGE = (INTRO - TITLE_END - 0.6) / PAGES.length;

/** Pembukaan tanpa suara: ucapan alu-aluan bergerak, kemudian sumber rujukan secara ringkas. */
export const IntroScene: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const title = life(t, 0.2, TITLE_END, 0.6);
	const fadeIn = rise(t, 0, 0.8);
	const fadeOut = 1 - rise(t, INTRO - 0.6, 0.6);
	return (
		<AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut)}}>
			<MotionBg t={t} />
			{/* Tajuk alu-aluan */}
			<div style={{position: 'absolute', left: 140, top: 250, width: 1500, opacity: title, transform: `translateY(${lerp(0, -40, rise(t, TITLE_END - 0.6, 0.6))}px)`}}>
				<Eyebrow style={{opacity: rise(t, 0.3)}}>MPU3152 · Falsafah dan Cabaran Masa Depan · Tugasan 3</Eyebrow>
				<div style={{height: 3, background: C.gold, width: lerp(0, 220, rise(t, 0.4, 0.9)), margin: '26px 0 34px'}} />
				<Words t={t} words={['Selamat', 'menonton', 'dan', 'mendengar', 'syarahan', 'saya']} start={0.6} gold={4} size={104} />
				<div style={{fontFamily: F.sans, fontWeight: 600, fontSize: 34, color: C.white, marginTop: 40, opacity: rise(t, 1.9), borderLeft: `4px solid ${C.gold}`, paddingLeft: 20}}>
					Daripada Konsep Insan kepada Bilik Darjah Inklusif
				</div>
				<div style={{fontFamily: F.sans, fontSize: 25, color: C.soft, marginTop: 18, opacity: rise(t, 2.4)}}>
					Mohamad Aliff bin Ahmad Shahabuddin · Bahasa Melayu Kumpulan 1
				</div>
			</div>
			{/* Sumber rujukan: dua halaman ringkas */}
			{PAGES.map((items, k) => {
				const s = TITLE_END + k * PAGE;
				const e = s + PAGE;
				if (t < s - 0.05 || t > e + 0.05) return null;
				const v = life(t, s, e, 0.5);
				return (
					<AbsoluteFill key={k} style={{alignItems: 'center', justifyContent: 'center'}}>
						<div
							style={{
								width: 1720,
								background: C.paper,
								color: C.ink,
								padding: '40px 56px',
								borderRadius: 4,
								opacity: v,
								boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
								transform: `translateX(${lerp(120, 0, rise(t, s, 0.6)) - lerp(0, 120, rise(t, e - 0.5, 0.5))}px) rotate(${k % 2 ? 0.5 : -0.5}deg)`,
							}}
						>
							<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
								<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 46}}>Sumber rujukan</div>
								<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 20, color: C.red, letterSpacing: '0.1em'}}>
									{k + 1} / {PAGES.length}
								</div>
							</div>
							<div style={{height: 2, background: C.ink, opacity: 0.15, margin: '14px 0 18px'}} />
							<div style={{display: 'flex', flexDirection: 'column', gap: 9}}>
								{items.map((r) => (
									<div key={r} style={{fontFamily: F.sans, fontSize: 18.5, lineHeight: 1.3, paddingLeft: 32, textIndent: -32, overflowWrap: 'anywhere'}}>
										{r}
									</div>
								))}
							</div>
						</div>
					</AbsoluteFill>
				);
			})}
		</AbsoluteFill>
	);
};

/** Penutup: Terima kasih menonton (wajah penyampai sudah pudar sebelum ini). */
export const OutroScene: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	const bg = rise(t, 0.1, 0.7);
	const out = 1 - rise(t, OUTRO - 1.1, 1.0);
	return (
		<AbsoluteFill style={{opacity: out}}>
			<AbsoluteFill style={{opacity: bg}}>
				<MotionBg t={t + 20} />
			</AbsoluteFill>
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', textAlign: 'center'}}>
				<div style={{width: 1400}}>
					<div style={{display: 'flex', justifyContent: 'center'}}>
						<Words t={t} words={['Terima', 'kasih', 'menonton']} start={0.5} gold={2} size={128} step={0.22} />
					</div>
					<div style={{height: 3, background: C.gold, width: lerp(0, 260, rise(t, 1.2, 0.9)), margin: '34px auto 30px'}} />
					<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 32, color: C.white, opacity: rise(t, 1.7)}}>
						Mohamad Aliff bin Ahmad Shahabuddin
					</div>
					<div style={{fontFamily: F.sans, fontSize: 24, color: C.soft, marginTop: 10, opacity: rise(t, 2.0)}}>
						MPU3152 Falsafah dan Cabaran Masa Depan · IPG Kampus Tun Hussein Onn
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
