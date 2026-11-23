import React from 'react';
import {AbsoluteFill, OffthreadVideo, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, F, Grain, Line, MaskUp, clamp01, easeInOut, easeOut, lerp, rise} from './theme';
import {TL} from './timeline';

/**
 * PEMBUKAAN (11 s = 330 bingkai), tanpa teaser.
 * 0–2 s   gelap + garisan burgundy + impak halus
 * 2–5 s   BICARA BAHASA (tipografi kinetik, light sweep, motion blur)
 * 5–8 s   ROJAK ATAU RANCU? (scale, tracking, masking)
 * 8–11 s  subtajuk + rakaman sebenar tiga ahli di beranda -> terus masuk perbualan
 */

const SweepText: React.FC<{text: string; p: number; style: React.CSSProperties}> = ({text, p, style}) => {
	const x = lerp(-30, 130, p);
	return (
		<span style={{position: 'relative', display: 'inline-block'}}>
			<span style={style}>{text}</span>
			{p > 0 && p < 1 ? (
				<span
					style={{
						...style,
						position: 'absolute',
						left: 0,
						top: 0,
						color: 'transparent',
						backgroundImage: `linear-gradient(105deg, transparent ${x - 16}%, rgba(255,246,228,0.95) ${x}%, transparent ${x + 16}%)`,
						WebkitBackgroundClip: 'text',
						backgroundClip: 'text',
					}}
				>
					{text}
				</span>
			) : null}
		</span>
	);
};

const Letters: React.FC<{text: string; f: number; start: number; stagger: number; style: React.CSSProperties; sweep?: number; offset?: number}> = ({
	text,
	f,
	start,
	stagger,
	style,
	sweep = -99,
	offset = 0,
}) => (
	<span style={{display: 'inline-flex'}}>
		{text.split('').map((ch, i) => {
			const p = rise(f, start + i * stagger, 16);
			const glow = Math.exp(-(((sweep - (i + offset)) / 1.3) ** 2));
			return (
				<span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: '0.08em'}}>
					<span
						style={{
							...style,
							display: 'inline-block',
							transform: `translateY(${(1 - p) * 105}%)`,
							filter: p < 1 ? `blur(${(1 - p) * 8}px)` : glow > 0.02 ? `brightness(${1 + 0.55 * glow})` : undefined,
							textShadow: glow > 0.02 ? `0 0 ${28 * glow}px rgba(255,236,205,${0.7 * glow})` : undefined,
							whiteSpace: 'pre',
						}}
					>
						{ch}
					</span>
				</span>
			);
		})}
	</span>
);

export const Opening: React.FC = () => {
	const f = useCurrentFrame();
	const O = TL.opening;
	// ---- fasa
	const lineP = rise(f, 10, 34, easeInOut); // 0.33 s
	const showIn = rise(f, 60, 20);
	const showOut = rise(f, 146, 16, easeInOut); // tajuk rancangan mengecil ke atas
	const mainIn = f >= 150;
	const subIn = rise(f, 240, 20);
	const vidIn = rise(f, 228, 30, easeInOut); // rakaman sebenar muncul
	const exitP = rise(f, 300, 30, easeInOut); // zoom-through ke perbualan

	// ---- latar rakaman (wide shot sebenar, perlahan zoom out)
	const vidScale = lerp(1.18, 1.0, rise(f, 228, 102, easeOut));
	const darken = lerp(0.62, 0, exitP);

	return (
		<AbsoluteFill style={{background: C.charcoal, overflow: 'hidden'}}>
			{/* rakaman sebenar */}
			{f >= 220 ? (
				<AbsoluteFill style={{opacity: vidIn, transform: `scale(${vidScale})`}}>
					<OffthreadVideo src={staticFile('base.mp4')} startFrom={O.bgFrom} muted style={{width: '100%', height: '100%'}} />
				</AbsoluteFill>
			) : null}
			{/* gradien & vinyet gelap */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse at 50% 45%, rgba(85,32,51,${0.35 * (1 - vidIn)}) 0%, rgba(37,35,38,${1 - vidIn * 0.45}) 70%)`,
				}}
			/>
			<AbsoluteFill style={{background: `rgba(26,24,27,${darken * vidIn})`}} />
			<Grain opacity={0.07 * (1 - exitP)} />

			{/* ---------- garisan burgundy ---------- */}
			<div
				style={{
					position: 'absolute',
					left: 960 - 520,
					top: 540,
					width: 1040,
					height: 4,
					background: `linear-gradient(90deg, transparent, ${C.red} 20%, ${C.burgundy} 50%, ${C.red} 80%, transparent)`,
					transform: `scaleX(${lineP}) translateY(${lerp(0, -205, showIn)}px)`,
					opacity: 1 - rise(f, 140, 12),
					boxShadow: `0 0 ${18 * lineP}px rgba(166,77,98,0.8)`,
				}}
			/>

			{/* ---------- BICARA BAHASA ---------- */}
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					transform: `translateY(${lerp(0, -290, showOut)}px) scale(${lerp(1, 0.42, showOut)})`,
					opacity: f < 60 ? 0 : 1 - rise(f, 300, 20),
				}}
			>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
					<div style={{opacity: rise(f, 64, 20)}}>
						<div
							style={{
								fontFamily: F.serif,
								fontStyle: 'italic',
								fontWeight: 500,
								fontSize: 40,
								color: C.gold,
								letterSpacing: '0.04em',
								transform: `translateY(${(1 - rise(f, 64, 24)) * 20}px)`,
							}}
						>
							Porch Talk · Borak Beranda
						</div>
					</div>
					<div style={{position: 'relative', display: 'flex', gap: 34}}>
						<Letters
							text="BICARA"
							f={f}
							start={66}
							stagger={3}
							sweep={lerp(-3, 16, clamp01((f - 104) / 34))}
							style={{fontFamily: F.display, fontWeight: 900, fontSize: 168, color: C.cream, letterSpacing: lerp(0.3, 0.08, rise(f, 66, 50)) + 'em'}}
						/>
						<Letters
							text="BAHASA"
							f={f}
							start={78}
							stagger={3}
							sweep={lerp(-3, 16, clamp01((f - 104) / 34))}
							offset={7}
							style={{fontFamily: F.display, fontWeight: 900, fontSize: 168, color: C.beige, letterSpacing: lerp(0.3, 0.08, rise(f, 78, 50)) + 'em'}}
						/>

					</div>
					<Line p={rise(f, 96, 30, easeInOut)} w={420} color={C.gold} h={3} origin="center" />
				</div>
			</AbsoluteFill>

			{/* ---------- ROJAK ATAU RANCU? ---------- */}
			{mainIn ? <MainTitle f={f} /> : null}

			{/* ---------- subtajuk ---------- */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 730,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: 14,
					opacity: subIn * (1 - rise(f, 302, 18)),
				}}
			>
				<Line p={rise(f, 240, 24, easeInOut)} w={120} color={C.gold} origin="center" />
				<div style={{fontFamily: F.display, fontWeight: 700, fontSize: 40, letterSpacing: '0.24em', color: C.cream, textAlign: 'center'}}>
					<MaskUp p={rise(f, 244, 20)}>ISU KERANCUAN BAHASA</MaskUp>
				</div>
				<div style={{fontFamily: F.display, fontWeight: 500, fontSize: 30, letterSpacing: '0.36em', color: C.beige, textAlign: 'center'}}>
					<MaskUp p={rise(f, 252, 20)}>DALAM BAHASA MELAYU</MaskUp>
				</div>
			</div>

			{/* kilatan putih lembut semasa peralihan */}
			<AbsoluteFill style={{background: C.cream, opacity: 0.35 * Math.sin(Math.PI * clamp01((f - 300) / 22)), pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};

const MainTitle: React.FC<{f: number}> = ({f}) => {
	const s = 150;
	const p1 = rise(f, s, 26);
	const p2 = rise(f, s + 12, 22);
	const p3 = rise(f, s + 22, 26);
	const settle = rise(f, s, 90, easeOut);
	const up = rise(f, 232, 26, easeInOut); // naik memberi ruang subtajuk
	const out = rise(f, 298, 24, easeInOut);
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				transform: `translateY(${lerp(30, -40, up)}px) scale(${lerp(1.0, 0.86, up) * lerp(1, 1.6, out)})`,
				opacity: 1 - out,
				filter: out > 0 ? `blur(${out * 14}px)` : undefined,
			}}
		>
			<div style={{display: 'flex', alignItems: 'baseline', gap: 38, transform: `scale(${lerp(1.06, 1, settle)})`}}>
				{/* ROJAK - huruf bertindih, burgundy */}
				<span style={{display: 'inline-block', overflow: 'hidden', padding: '0 0.04em 0.05em'}}>
					<span
						style={{
							display: 'inline-block',
							fontFamily: F.display,
							fontWeight: 900,
							fontSize: 172,
							color: C.red,
							letterSpacing: lerp(0.4, -0.04, p1) + 'em',
							transform: `translateY(${(1 - p1) * 100}%)`,
							textShadow: `6px 6px 0 ${C.burgundy}`,
						}}
					>
						ROJAK
					</span>
				</span>
				<span
					style={{
						fontFamily: F.serif,
						fontStyle: 'italic',
						fontWeight: 500,
						fontSize: 76,
						color: C.gold,
						opacity: p2,
						transform: `translateY(${(1 - p2) * 30}px)`,
						display: 'inline-block',
					}}
				>
					atau
				</span>
				{/* RANCU? - cream, garis luar kemudian isi */}
				<span style={{display: 'inline-block', overflow: 'hidden', padding: '0 0.04em 0.05em'}}>
					<span
						style={{
							display: 'inline-block',
							fontFamily: F.display,
							fontWeight: 900,
							fontSize: 172,
							color: `rgba(245,240,234,${rise(f, s + 34, 26)})`,
							WebkitTextStroke: `3px ${C.cream}`,
							letterSpacing: lerp(0.4, -0.02, p3) + 'em',
							transform: `translateY(${(p3 - 1) * 100}%)`,
						}}
					>
						RANCU?
					</span>
				</span>
			</div>
		</AbsoluteFill>
	);
};
