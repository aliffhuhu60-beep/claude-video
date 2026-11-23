import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, Eyebrow, F, Grain, Line, MaskUp, clamp01, easeIn, easeInOut, easeOut, lerp, life, rise} from './theme';
import {TL} from './timeline';
import {useLayout} from './Footage';

/* ============================================================ SARI KATA */
const renderSub = (s: string) =>
	s.split(/(\*[^*]+\*)/g).map((part, i) =>
		part.startsWith('*') && part.endsWith('*') ? (
			<span key={i} style={{color: '#E4C78F', fontWeight: 700}}>
				{part.slice(1, -1)}
			</span>
		) : (
			<span key={i}>{part}</span>
		),
	);

export const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const lay = useLayout(f);
	const cue = TL.subs.find((c) => f >= c.from && f < c.to);
	if (!cue) return null;
	const a = rise(f, cue.from, 4);
	const split = lay.s < 0.98;
	return (
		<div
			style={{
				position: 'absolute',
				left: split ? 70 : 220,
				width: split ? 920 : 1480,
				bottom: split ? 150 : 52,
				display: 'flex',
				justifyContent: 'center',
				opacity: a,
			}}
		>
			<div
				style={{
					fontFamily: F.sub,
					fontWeight: 600,
					fontSize: split ? 34 : 42,
					lineHeight: 1.32,
					color: C.cream,
					textAlign: 'center',
					padding: '8px 22px 10px',
					borderRadius: 12,
					background: 'rgba(20,18,21,0.52)',
					textShadow: '0 2px 8px rgba(0,0,0,0.5)',
					display: '-webkit-box',
					WebkitLineClamp: 2,
					WebkitBoxOrient: 'vertical',
					overflow: 'hidden',
					transform: `translateY(${(1 - a) * 8}px)`,
				}}
			>
				{renderSub(cue.text)}
			</div>
		</div>
	);
};

/* ============================================================ LOWER THIRD */
export const LowerThirds: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			{TL.lowerThirds.map((lt, i) => {
				if (f < lt.from - 1 || f > lt.from + lt.dur + 1) return null;
				const g = f - lt.from;
				const bar = rise(g, 0, 16, easeInOut);
				const nm = rise(g, 8, 18);
				const rl = rise(g, 14, 18);
				const out = rise(g, lt.dur - 16, 16, easeIn);
				const left = 110;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left,
							top: 700,
							opacity: 1 - out,
							transform: `translateX(${-out * 30}px)`,
						}}
					>
						<div style={{display: 'flex', alignItems: 'stretch'}}>
							<div style={{width: 8, background: C.gold, transform: `scaleY(${bar})`, transformOrigin: 'bottom'}} />
							<div
								style={{
									background: C.burgGlass,
									padding: '18px 36px 18px 26px',
									clipPath: `inset(0 ${(1 - bar) * 100}% 0 0)`,
									boxShadow: '0 12px 34px rgba(0,0,0,0.35)',
								}}
							>
								<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 64, color: C.cream, letterSpacing: '0.06em', lineHeight: 1}}>
									<MaskUp p={nm}>{lt.name}</MaskUp>
								</div>
								<div style={{marginTop: 10, fontFamily: F.display, fontWeight: 700, fontSize: 24, letterSpacing: '0.3em', color: C.gold}}>
									<MaskUp p={rl}>{lt.role}</MaskUp>
								</div>
							</div>
						</div>
						<Line p={rise(g, 18, 22, easeInOut)} w={220} color={C.cream} h={2} style={{marginTop: 10, opacity: 0.7}} />
					</div>
				);
			})}
		</>
	);
};

/* ============================================================ KAD TAJUK SEGMEN */
export const ChapterCards: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<>
			{TL.blocks.map((b, i) => {
				if (b.type !== 'chapter') return null;
				if (f < b.from - 2 || f > b.from + b.dur + 2) return null;
				return <Chapter key={i} g={f - b.from} dur={b.dur} n={b.n} title={b.title} base={b.base} eyebrow={(b as any).eyebrow} />;
			})}
		</>
	);
};

const Chapter: React.FC<{g: number; dur: number; n: string; title: string; base: number; eyebrow: string}> = ({g, dur, n, title, base, eyebrow}) => {
	// panel burgundy menyapu masuk (masking), kemudian keluar ke kanan
	const wipeIn = rise(g, 0, 16, easeInOut);
	const wipeOut = rise(g, dur - 16, 16, easeInOut);
	const num = rise(g, 10, 22);
	const ln = rise(g, 16, 24, easeInOut);
	const tt = rise(g, 18, 22);
	const zoom = lerp(1.08, 1.0, rise(g, 0, dur, easeOut));
	const words = title.split(' ');
	return (
		<AbsoluteFill>
			{/* latar: rakaman kabur (pegun) */}
			<AbsoluteFill style={{clipPath: `inset(0 ${wipeOut * 100}% 0 ${0}%)`}}>
				<AbsoluteFill style={{transform: `scale(${zoom * 1.05})`, filter: 'blur(14px) brightness(0.55) saturate(0.9)'}}>
					<OffthreadVideo src={staticFile('base.mp4')} startFrom={base} muted style={{width: 1920, height: 1080}} />
				</AbsoluteFill>
				<AbsoluteFill style={{background: `linear-gradient(110deg, rgba(85,32,51,0.92) 0%, rgba(85,32,51,0.75) 45%, rgba(37,35,38,0.55) 100%)`, clipPath: `inset(0 ${(1 - wipeIn) * 100}% 0 0)`}} />
				<Grain opacity={0.08} />
				<div style={{position: 'absolute', left: 180, top: 330, opacity: 1 - wipeOut}}>
					<div
						style={{
							fontFamily: F.serif,
							fontStyle: 'italic',
							fontWeight: 500,
							fontSize: 170,
							color: C.gold,
							lineHeight: 1,
							opacity: num,
							transform: `translateX(${(1 - num) * -60}px)`,
						}}
					>
						{n}
					</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 22, marginTop: 18}}>
						<Line p={ln} w={90} color={C.cream} h={3} />
						<Eyebrow color={C.beige} style={{opacity: ln}}>
							{eyebrow}
						</Eyebrow>
					</div>
					<div
						style={{
							marginTop: 26,
							fontFamily: F.display,
							fontWeight: 900,
							fontSize: 92,
							lineHeight: 1.04,
							color: C.cream,
							maxWidth: 1500,
							letterSpacing: lerp(0.12, 0.01, tt) + 'em',
						}}
					>
						{words.map((w, k) => (
							<React.Fragment key={k}>
								<MaskUp p={rise(g, 18 + k * 3, 20)}>{w}</MaskUp>{' '}
							</React.Fragment>
						))}
					</div>
				</div>
				{/* sapuan cahaya */}
				<AbsoluteFill
					style={{
						mixBlendMode: 'screen',
						background: `linear-gradient(105deg, transparent ${lerp(-30, 130, clamp01((g - 26) / 30)) - 12}%, rgba(255,236,210,0.16) ${lerp(-30, 130, clamp01((g - 26) / 30))}%, transparent ${lerp(-30, 130, clamp01((g - 26) / 30)) + 12}%)`,
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ============================================================ IKLAN (lagu Suno) */
export const AdBreak: React.FC = () => {
	const f = useCurrentFrame();
	const b = TL.blocks.find((x) => x.type === 'ad');
	if (!b || f < b.from - 2 || f > b.from + b.dur + 2) return null;
	const g = f - b.from;
	const inP = rise(g, 0, 18, easeInOut);
	const outP = rise(g, b.dur - 18, 18, easeInOut);
	const card = rise(g, 12, 22);
	const bars = Array.from({length: 28});
	return (
		<AbsoluteFill style={{opacity: 1 - outP * 0.0, transform: `scale(${lerp(1, 1.04, outP)})`}}>
			<AbsoluteFill style={{background: C.charcoal, clipPath: `inset(0 0 0 ${(1 - inP) * 100}%)`}}>
				<AbsoluteFill style={{background: `radial-gradient(ellipse at 30% 40%, rgba(166,77,98,0.45), transparent 60%), radial-gradient(ellipse at 80% 80%, rgba(198,164,106,0.25), transparent 55%)`}} />
				<Grain opacity={0.08} />
				{/* label IKLAN */}
				<div style={{position: 'absolute', left: 120, top: 90, display: 'flex', alignItems: 'center', gap: 18, opacity: card}}>
					<div style={{background: C.gold, color: C.charcoal, fontFamily: F.display, fontWeight: 800, fontSize: 22, letterSpacing: '0.3em', padding: '8px 16px'}}>
						IKLAN
					</div>
					<Eyebrow color={C.beige}>Rehat sebentar · Bicara Bahasa</Eyebrow>
				</div>
				{/* video lagu */}
				<div
					style={{
						position: 'absolute',
						left: 120,
						top: 200,
						width: 680,
						height: 680,
						borderRadius: 28,
						overflow: 'hidden',
						boxShadow: '0 40px 90px rgba(0,0,0,0.55)',
						transform: `translateY(${(1 - card) * 40}px) scale(${lerp(0.94, 1, card)})`,
						opacity: card,
						background: '#000',
					}}
				>
					<Sequence from={b.from} layout="none">
						<OffthreadVideo
							src={staticFile('suno.mp4')}
							startFrom={(TL as any).ad.songFrom}
							muted
							style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%'}}
						/>
					</Sequence>
				</div>
				{/* maklumat lagu */}
				<div style={{position: 'absolute', left: 900, top: 330, width: 900}}>
					<Eyebrow color={C.gold} style={{opacity: rise(g, 20, 18)}}>Lagu original · Sedang dimainkan</Eyebrow>
					<div style={{marginTop: 22, fontFamily: F.display, fontWeight: 900, fontSize: 120, color: C.cream, lineHeight: 1}}>
						<MaskUp p={rise(g, 24, 22)}>Lima Mit</MaskUp>
						<br />
						<MaskUp p={rise(g, 30, 22)}>
							<span style={{color: C.red}}>Lagi</span>
						</MaskUp>
					</div>
					<Line p={rise(g, 36, 26, easeInOut)} w={260} color={C.gold} style={{marginTop: 34}} />
					{/* equaliser */}
					<div style={{display: 'flex', alignItems: 'flex-end', gap: 8, height: 90, marginTop: 40}}>
						{bars.map((_, k) => {
							const h = 18 + 70 * Math.abs(Math.sin(g * 0.21 + k * 0.9) * Math.cos(g * 0.07 + k * 0.33));
							return <div key={k} style={{width: 14, height: h * card, background: k % 3 === 0 ? C.gold : C.red, borderRadius: 4, opacity: 0.9}} />;
						})}
					</div>
					<div style={{marginTop: 34, fontFamily: F.serif, fontStyle: 'italic', fontSize: 34, color: C.creamSoft, opacity: rise(g, 60, 20)}}>
						Kita sambung semula selepas ini…
					</div>
				</div>
				<AbsoluteFill style={{background: C.charcoal, opacity: outP}} />
				{/* bar masa */}
				<div style={{position: 'absolute', left: 0, bottom: 0, height: 8, width: 1920 * clamp01(g / b.dur), background: C.gold}} />
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

/* ============================================================ OUTRO */
export const Outro: React.FC = () => {
	const f = useCurrentFrame();
	const b = TL.blocks.find((x) => x.type === 'outro');
	if (!b || f < b.from) return null;
	const g = f - b.from;
	const D = b.dur;
	const dim = rise(g, 20, 40, easeInOut);
	const t1 = rise(g, 40, 22);
	const t2 = rise(g, 62, 22);
	const q = rise(g, 110, 26);
	const names = rise(g, 190, 22);
	const course = rise(g, 250, 22);
	const black = rise(g, D - 36, 36, easeInOut);
	const NM: [string, string][] = [
		['NAIM', 'Hos / Moderator'],
		['FADLI', 'Panel 1'],
		['ADAM', 'Panel 2'],
	];
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `rgba(37,35,38,${0.72 * dim})`}} />
			<AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(85,32,51,${0.5 * dim}) 100%)`}} />
			<Grain opacity={0.07 * dim} />
			<AbsoluteFill style={{alignItems: 'center', top: 150}}>
				<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 70, letterSpacing: lerp(0.3, 0.12, t1) + 'em', color: C.beige, opacity: t1}}>
					BICARA BAHASA
				</div>
				<Line p={rise(g, 50, 26, easeInOut)} w={260} color={C.gold} origin="center" style={{marginTop: 18}} />
				<div style={{marginTop: 22, display: 'flex', alignItems: 'baseline', gap: 26, opacity: t2, transform: `scale(${lerp(1.08, 1, t2)})`}}>
					<span style={{fontFamily: F.display, fontWeight: 900, fontSize: 110, color: C.red, textShadow: `5px 5px 0 ${C.burgundy}`}}>ROJAK</span>
					<span style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 52, color: C.gold}}>atau</span>
					<span style={{fontFamily: F.display, fontWeight: 900, fontSize: 110, color: C.cream}}>RANCU?</span>
				</div>
				<div
					style={{
						marginTop: 44,
						fontFamily: F.serif,
						fontStyle: 'italic',
						fontWeight: 500,
						fontSize: 44,
						lineHeight: 1.35,
						color: C.cream,
						textAlign: 'center',
						opacity: q,
						transform: `translateY(${(1 - q) * 18}px)`,
					}}
				>
					“Bahasa mencerminkan pemikiran,
					<br />
					ketepatan bahasa melambangkan kejelasan.”
				</div>
				<div style={{display: 'flex', gap: 90, marginTop: 56}}>
					{NM.map(([n, r], k) => {
						const p = rise(g, 190 + k * 8, 20);
						return (
							<div key={n} style={{textAlign: 'center', opacity: p * names, transform: `translateY(${(1 - p) * 20}px)`}}>
								<div style={{fontFamily: F.display, fontWeight: 800, fontSize: 40, color: C.cream, letterSpacing: '0.1em'}}>{n}</div>
								<div style={{fontFamily: F.display, fontWeight: 600, fontSize: 18, color: C.gold, letterSpacing: '0.28em', marginTop: 6, textTransform: 'uppercase'}}>{r}</div>
							</div>
						);
					})}
				</div>
				<div style={{marginTop: 48, textAlign: 'center', opacity: course}}>
					<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 26, letterSpacing: '0.22em', color: C.beige}}>BMMB3233 · SINTAKSIS BAHASA MELAYU</div>
					<div style={{fontFamily: F.display, fontWeight: 600, fontSize: 22, letterSpacing: '0.3em', color: C.creamFaint, marginTop: 10}}>TUTORIAL M13</div>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#000', opacity: black}} />
		</AbsoluteFill>
	);
};
