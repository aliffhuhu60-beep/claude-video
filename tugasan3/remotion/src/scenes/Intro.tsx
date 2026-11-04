import React from 'react';
import {C, E, Eyebrow, F, Glass, Icon, S, Source, Win, lerp, rise} from '../lib';

/** Orbit: peta syarahan mengelilingi penyampai (tidak menutup wajah) */
export const OrbitMap: React.FC = () => {
	const cx = 1000,
		cy = 470,
		rx = 640,
		ry = 330;
	const nodes: [number, number, string][] = [
		[205, S(22), 'Hubungan falsafah'],
		[335, S(23), 'Analisis kritis isu semasa'],
		[25, S(25), 'Cadangan penyelesaian'],
		[155, S(26), 'Rumusan & pendirian'],
	];
	const arc = (a0: number, a1: number) => {
		const pts: string[] = [];
		for (let a = a0; a <= a1; a += 3) {
			const r = (a * Math.PI) / 180;
			pts.push(`${cx + rx * Math.cos(r)},${cy + ry * Math.sin(r)}`);
		}
		return pts.join(' ');
	};
	return (
		<Win s={S(21)} e={S(27) - 0.2} d={0.6}>
			{(t, v) => {
				const drift = Math.sin(t * 0.6) * 2;
				const active = nodes.reduce((acc, n, i) => (t >= n[1] ? i : acc), -1);
				return (
					<div style={{position: 'absolute', inset: 0, opacity: v}}>
						<svg width={1920} height={1080} style={{position: 'absolute'}}>
							<polyline points={arc(130, 230)} fill="none" stroke={C.gold} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="6 10" />
							<polyline points={arc(-50, 50)} fill="none" stroke={C.gold} strokeOpacity={0.55} strokeWidth={2} strokeDasharray="6 10" />
						</svg>
						<Eyebrow style={{position: 'absolute', left: 80, top: 70}}>Peta syarahan</Eyebrow>
						{nodes.map(([ang, s, label], i) => {
							const p = rise(t, s, 0.8);
							const a = ((ang + lerp(28, 0, p) + drift) * Math.PI) / 180;
							const x = cx + rx * Math.cos(a);
							const y = cy + ry * Math.sin(a);
							const on = i === active;
							return (
								<div
									key={label}
									style={{
										position: 'absolute',
										left: x - 190,
										top: y - 44,
										width: 380,
										opacity: p,
										transform: `scale(${lerp(0.8, on ? 1.04 : 1, p)})`,
									}}
								>
									<Glass
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 16,
											padding: '16px 20px',
											border: on ? `2px solid ${C.gold}` : `1px solid ${C.glassLine}`,
										}}
									>
										<div
											style={{
												width: 52,
												height: 52,
												borderRadius: 26,
												background: on ? C.gold : 'rgba(255,255,255,0.12)',
												color: on ? C.navy : C.white,
												display: 'grid',
												placeItems: 'center',
												fontWeight: 800,
												fontSize: 26,
												flexShrink: 0,
											}}
										>
											{i + 1}
										</div>
										<div style={{fontSize: 27, fontWeight: 700, lineHeight: 1.15}}>{label}</div>
									</Glass>
								</div>
							);
						})}
					</div>
				);
			}}
		</Win>
	);
};

/** Glass Type: tajuk Tugasan 2 */
export const T2Title: React.FC = () => (
	<Win s={S(28)} e={S(32) - 0.2}>
		{(t, v) => (
			<Glass style={{position: 'absolute', left: 80, top: 180, width: 620, padding: '30px 34px', opacity: v, transform: `translateY(${lerp(20, 0, v)}px)`}}>
				<Eyebrow>Imbasan Tugasan 2</Eyebrow>
				<div style={{fontFamily: F.serif, fontSize: 46, fontWeight: 600, lineHeight: 1.15, marginTop: 14}}>
					Konsep Insan dalam Pelbagai Tradisi Pemikiran
				</div>
				<div style={{fontSize: 26, color: C.soft, marginTop: 12, opacity: rise(t, S(29))}}>
					dan Perkaitannya dengan Falsafah Malaysia
				</div>
			</Glass>
		)}
	</Win>
);

const TRAD: [number, string, string, string, string][] = [
	[S(33), 'I', 'Islam', 'Khalifah yang memikul amanah', 'Wahid & Firdaus (2022)'],
	[S(35), 'H', 'Hindu', 'Atman: jiwa yang kekal', 'Chadha (2022)'],
	[S(38), 'B', 'Buddha', 'Anatta: tiada diri yang tetap', 'Chu & Vu (2022)'],
	[S(39), 'K', 'Konfusianisme', 'Diri dibentuk melalui peranan dan hubungan sosial', 'Moore (2026)'],
	[S(41), 'B', 'Barat moden', 'Autonomi individu → autonomi berasaskan hubungan', 'Lee (2023)'],
];
const TRAD_COL = ['#2F7D6B', '#D06A3C', '#E0A526', '#5B8DB8', '#8C7BB8'];

/** Lima tradisi muncul berperingkat di sisi penyampai */
export const Traditions: React.FC = () => (
	<Win s={S(32)} e={S(43) - 0.1}>
		{(t, v) => (
			<div style={{position: 'absolute', left: 80, top: 120, width: 600, opacity: v}}>
				<Eyebrow style={{marginBottom: 16}}>Faham insan dalam lima tradisi</Eyebrow>
				<div style={{display: 'flex', flexDirection: 'column', gap: 14}}>
					{TRAD.map(([s, letter, name, desc, src], i) => {
						const p = rise(t, s);
						return (
							<Glass
								key={name}
								style={{
									display: 'flex',
									gap: 18,
									alignItems: 'center',
									padding: '14px 20px',
									opacity: p,
									transform: `translateX(${lerp(-40, 0, p)}px)`,
								}}
							>
								<div
									style={{
										width: 54,
										height: 54,
										borderRadius: 14,
										background: TRAD_COL[i],
										display: 'grid',
										placeItems: 'center',
										fontFamily: F.serif,
										fontWeight: 700,
										fontSize: 30,
										flexShrink: 0,
									}}
								>
									{letter}
								</div>
								<div style={{minWidth: 0}}>
									<div style={{fontSize: 27, fontWeight: 800}}>{name}</div>
									<div style={{fontSize: 21, color: C.soft, lineHeight: 1.25}}>{desc}</div>
									<div style={{fontSize: 15, color: C.faint, marginTop: 3}}>{src}</div>
								</div>
							</Glass>
						);
					})}
				</div>
			</div>
		)}
	</Win>
);

/** Pull-back Reveal: lima tradisi bertemu dalam FPK */
export const FPK: React.FC = () => (
	<Win s={S(43)} e={S(46) - 0.4} d={0.7}>
		{(t, v) => {
			const names = ['Islam', 'Hindu', 'Buddha', 'Konfusianisme', 'Barat moden'];
			const jeri: [string, number][] = [
				['Jasmani', 168.0],
				['Emosi', 168.9],
				['Rohani', 169.6],
				['Intelek', 170.2],
			];
			const line = rise(t, S(43) + 0.8, 1.2);
			return (
				<div style={{position: 'absolute', left: 70, top: 120, width: 880, opacity: v}}>
					<Eyebrow>Landasan nilai bersama</Eyebrow>
					<div style={{display: 'flex', gap: 10, marginTop: 22}}>
						{names.map((n, i) => (
							<div
								key={n}
								style={{
									flex: 1,
									textAlign: 'center',
									padding: '12px 6px',
									borderRadius: 12,
									background: TRAD_COL[i],
									fontFamily: F.sans,
									fontWeight: 700,
									fontSize: 19,
									color: C.white,
									opacity: rise(t, S(43) + 0.1 * i),
								}}
							>
								{n}
							</div>
						))}
					</div>
					<svg width={880} height={110} style={{display: 'block'}}>
						{names.map((_, i) => {
							const x = 88 + i * 176;
							return (
								<line key={i} x1={x} y1={0} x2={lerp(x, 440, line)} y2={110 * line} stroke={C.gold} strokeWidth={2.5} strokeOpacity={0.8} />
							);
						})}
					</svg>
					<Glass style={{padding: '26px 30px', border: `2px solid ${C.gold}`, opacity: rise(t, S(43) + 1.4)}}>
						<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 40}}>Falsafah Pendidikan Kebangsaan</div>
						<div style={{fontSize: 24, color: C.soft, marginTop: 6}}>Insan yang seimbang dan harmonis</div>
						<div style={{display: 'flex', gap: 12, marginTop: 18}}>
							{jeri.map(([w, s]) => {
								const p = rise(t, s, 0.4);
								return (
									<div
										key={w}
										style={{
											flex: 1,
											textAlign: 'center',
											padding: '12px 4px',
											borderRadius: 10,
											fontWeight: 800,
											fontSize: 24,
											background: p > 0.5 ? C.gold : 'rgba(255,255,255,0.1)',
											color: p > 0.5 ? C.navy : C.soft,
											transform: `scale(${lerp(1, 1.06, p) - 0.06 * rise(t, s + 0.5, 0.3)})`,
										}}
									>
										{w}
									</div>
								);
							})}
						</div>
					</Glass>
					<Source>Salleh (2022); Rosli et al. (2022)</Source>
				</div>
			);
		}}
	</Win>
);

/** Topik 4 → Topik 11 */
export const TopicLink: React.FC = () => (
	<Win s={S(47)} e={S(55) - 0.2}>
		{(t, v) => (
			<div style={{position: 'absolute', left: 80, top: 180, width: 590, opacity: v}}>
				<Glass style={{padding: '22px 26px'}}>
					<Eyebrow color={C.soft}>Tugasan 2 · Topik 4</Eyebrow>
					<div style={{fontSize: 28, fontWeight: 700, marginTop: 8}}>Faham insan dalam pelbagai tradisi pemikiran</div>
				</Glass>
				<div style={{display: 'flex', justifyContent: 'center', padding: '10px 0', opacity: rise(t, S(49))}}>
					<Icon name="down" size={54} />
				</div>
				<Glass style={{padding: '22px 26px', border: `2px solid ${C.gold}`, opacity: rise(t, S(49)), transform: `translateY(${lerp(20, 0, rise(t, S(49)))}px)`}}>
					<Eyebrow>Tugasan 3 · Topik 11</Eyebrow>
					<div style={{fontSize: 28, fontWeight: 700, marginTop: 8}}>Konsep masyarakat majmuk dan kepelbagaian etnik</div>
				</Glass>
			</div>
		)}
	</Win>
);

/** Glass Type: isu pilihan */
export const IssueTitle: React.FC = () => (
	<Win s={S(55)} e={S(57) - 0.1}>
		{(t, v) => (
			<Glass style={{position: 'absolute', left: 80, top: 220, width: 620, padding: '30px 34px', opacity: v, transform: `translateY(${lerp(20, 0, v)}px)`}}>
				<Eyebrow>Isu pilihan</Eyebrow>
				<div style={{fontFamily: F.serif, fontWeight: 600, fontSize: 48, lineHeight: 1.15, marginTop: 12}}>
					Jurang interaksi dan <span style={{color: C.gold}}>stereotaip antara etnik</span> dalam kalangan murid
				</div>
			</Glass>
		)}
	</Win>
);

/** Frame Break: soalan utama keluar dari bingkai */
export const KeyQuestion: React.FC = () => (
	<Win s={S(57) + 0.4} e={222.6} d={0.5}>
		{(t, v) => (
			<div style={{position: 'absolute', left: 60, top: 520, width: 760, opacity: v}}>
				<div
					style={{
						fontFamily: F.serif,
						fontWeight: 700,
						fontSize: 54,
						lineHeight: 1.12,
						color: C.white,
						textShadow: '0 6px 30px rgba(0,0,0,0.6)',
					}}
				>
					<div style={{opacity: rise(t, S(58)), transform: `translateX(${lerp(-60, 0, rise(t, S(58)))}px)`}}>
						Adakah murid kita <span style={{color: C.gold}}>benar-benar hidup bersama</span>,
					</div>
					<div style={{opacity: rise(t, S(59)), transform: `translateX(${lerp(-60, 0, rise(t, S(59)))}px)`, marginTop: 10}}>
						atau sekadar belajar di bawah <span style={{color: C.gold}}>bumbung yang sama?</span>
					</div>
				</div>
			</div>
		)}
	</Win>
);
