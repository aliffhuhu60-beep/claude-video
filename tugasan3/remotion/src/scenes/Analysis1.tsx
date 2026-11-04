import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, E, Eyebrow, F, Glass, Icon, S, Source, Win, countText, lerp, rise} from '../lib';

/** Kad buku (Headline Wall ringkas) semasa Furnivall disebut */
export const FurnivallBook: React.FC = () => (
	<Win s={S(67)} e={238.6}>
		{(t, v) => (
			<div style={{position: 'absolute', left: 80, top: 210, width: 560, opacity: v, transform: `rotate(${lerp(-4, -2, v)}deg)`}}>
				<div style={{background: C.paper, color: C.ink, borderRadius: 6, padding: '28px 30px', boxShadow: '0 24px 60px rgba(0,0,0,0.45)'}}>
					<Eyebrow color={C.red}>Sumber · 1948</Eyebrow>
					<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 40, marginTop: 10}}>J. S. Furnivall</div>
					<div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 27, marginTop: 8, lineHeight: 1.25}}>
						Colonial Policy and Practice: A Comparative Study of Burma and Netherlands India
					</div>
					<div style={{fontFamily: F.sans, fontSize: 19, marginTop: 10, color: '#5a6476'}}>Cambridge University Press</div>
				</div>
			</div>
		)}
	</Win>
);

/** Paper Cut: keratan petikan di atas latar kabur */
const PaperQuote: React.FC<{t: number; v: number; eyebrow: string; quote: React.ReactNode; by: string; note?: string}> = ({t, v, eyebrow, quote, by, note}) => (
	<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: v}}>
		<div
			style={{
				width: 1240,
				transform: `translateY(${lerp(60, 0, v)}px) rotate(${lerp(-2.5, -1, v)}deg)`,
				filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.5))',
			}}
		>
			<div
				style={{
					background: C.paper,
					color: C.ink,
					padding: '64px 80px 56px',
					clipPath:
						'polygon(0% 3%, 4% 0%, 9% 2%, 15% 0%, 22% 2.5%, 30% 0.5%, 38% 2%, 46% 0%, 55% 2.5%, 63% 0.5%, 71% 2%, 79% 0%, 87% 2.5%, 94% 0.5%, 100% 2%, 100% 97%, 95% 100%, 88% 97.5%, 80% 100%, 72% 98%, 64% 100%, 56% 97.5%, 47% 100%, 39% 98%, 30% 100%, 22% 97.5%, 13% 100%, 6% 98%, 0% 100%)',
				}}
			>
				<Eyebrow color={C.red}>{eyebrow}</Eyebrow>
				<div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 600, fontSize: 60, lineHeight: 1.2, marginTop: 20}}>{quote}</div>
				<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 26, marginTop: 30}}>— {by}</div>
				{note ? <div style={{fontFamily: F.sans, fontSize: 19, marginTop: 6, color: '#5a6476'}}>{note}</div> : null}
			</div>
		</div>
	</AbsoluteFill>
);

export const FurnivallQuote: React.FC = () => (
	<Win s={238.8 + 0.3} e={255.0} d={0.6}>
		{(t, v) => (
			<PaperQuote
				t={t}
				v={v}
				eyebrow="Masyarakat majmuk"
				quote={
					<>
						“Mereka <span style={{background: 'linear-gradient(transparent 60%, #F5C44399 60%)'}}>bercampur, tetapi tidak bergabung</span>… bertemu hanya di
						pasar, untuk berjual beli.”
					</>
				}
				by="J. S. Furnivall (1948, hlm. 304)"
				note="Terjemahan bebas daripada “they mix but do not combine”"
			/>
		)}
	</Win>
);

export const ShamsulQuote: React.FC = () => (
	<Win s={269.5 + 0.3} e={286.0} d={0.6}>
		{(t, v) => (
			<PaperQuote
				t={t}
				v={v}
				eyebrow="Realiti hubungan etnik di Malaysia"
				quote={
					<>
						<span style={{background: 'linear-gradient(transparent 60%, #F5C44399 60%)'}}>Ketegangan yang stabil</span>. Matlamatnya:{' '}
						<span style={{background: 'linear-gradient(transparent 60%, #F5C44399 60%)'}}>kesepaduan dalam kepelbagaian</span>, bukan keseragaman.
					</>
				}
				by="Shamsul Amri Baharuddin (2012)"
				note="Modul Hubungan Etnik (Ed. ke-2), Institut Kajian Etnik, UKM"
			/>
		)}
	</Win>
);

/** Enam wajah kepelbagaian sebagai cip terapung */
export const Diversity: React.FC = () => {
	const chips: [string, number, number, number][] = [
		['Etnik', 259.6, 150, 230],
		['Agama', 260.5, 150, 360],
		['Bahasa', 261.5, 150, 490],
		['Budaya', 262.5, 1420, 230],
		['Wilayah', 263.6, 1420, 360],
		['Kelas sosial', 264.3, 1420, 490],
	];
	return (
		<Win s={S(74)} e={S(77) - 0.2}>
			{(t, v) => (
				<div style={{position: 'absolute', inset: 0, opacity: v}}>
					<Eyebrow style={{position: 'absolute', left: 150, top: 160}}>Wajah kepelbagaian di Malaysia</Eyebrow>
					{chips.map(([w, s, x, y]) => {
						const p = rise(t, s, 0.45);
						return (
							<Glass
								key={w}
								style={{
									position: 'absolute',
									left: x,
									top: y + Math.sin(t * 0.9 + x) * 4,
									padding: '18px 30px',
									fontSize: 34,
									fontWeight: 800,
									opacity: p,
									transform: `scale(${lerp(0.6, 1, p)})`,
									border: `1.5px solid ${C.gold}`,
								}}
							>
								{w}
							</Glass>
						);
					})}
				</div>
			)}
		</Win>
	);
};

/** UI World: tiga lapisan isu dalam ruang 3D di sisi penyampai */
export const Layers: React.FC = () => {
	const L: [number, string, string, string][] = [
		[S(87), 'school', 'Lapisan struktur', 'Sekolah dan kejiranan didominasi satu kaum'],
		[S(89), 'teacher', 'Lapisan pedagogi', 'Andaian dan stereotaip guru (Tugasan 2)'],
		[S(91), 'phone', 'Lapisan digital', 'Kandungan berunsur kaum dan agama tersebar pantas'],
	];
	return (
		<Win s={S(86)} e={S(94) - 0.2}>
			{(t, v) => (
				<div style={{position: 'absolute', left: 70, top: 120, width: 660, height: 740, perspective: 1400, opacity: v}}>
					<Eyebrow style={{marginLeft: 10}}>Di manakah jurangnya? Tiga lapisan</Eyebrow>
					<div style={{position: 'relative', marginTop: 60, transformStyle: 'preserve-3d', transform: `rotateY(${lerp(18, 12, v)}deg) rotateX(4deg)`}}>
						<svg width={60} height={560} style={{position: 'absolute', left: 30, top: 50}}>
							<line x1={30} y1={0} x2={30} y2={560 * rise(t, S(87), 6)} stroke={C.gold} strokeWidth={3} strokeDasharray="4 8" />
						</svg>
						{L.map(([s, ic, a, b], i) => {
							const p = rise(t, s, 0.7);
							return (
								<Glass
									key={a}
									style={{
										position: 'absolute',
										left: 0,
										top: i * 215,
										width: 600,
										padding: '24px 26px',
										display: 'flex',
										gap: 20,
										alignItems: 'center',
										opacity: p,
										transform: `translateZ(${lerp(-200, 0, p)}px)`,
									}}
								>
									<div style={{width: 66, height: 66, borderRadius: 16, background: C.gold, display: 'grid', placeItems: 'center', flexShrink: 0}}>
										<Icon name={ic} size={38} color={C.navy} />
									</div>
									<div>
										<div style={{fontSize: 32, fontWeight: 800}}>{a}</div>
										<div style={{fontSize: 23, color: C.soft, lineHeight: 1.25, marginTop: 4}}>{b}</div>
									</div>
								</Glass>
							);
						})}
					</div>
				</div>
			)}
		</Win>
	);
};

/** Headline Wall: tajuk-tajuk sumber sebenar daripada senarai rujukan */
export const HeadlineWall: React.FC = () => {
	const H: [string, string, string][] = [
		['Berita RTM · Jan 2026', 'RPN 2026–2035: Lonjakan besar sistem pendidikan negara', 'lead'],
		['The Borneo Post · 28 Jun 2026', 'IPNas 2025 study shows Malaysians are more united', ''],
		['Free Malaysia Today · 24 Feb 2026', 'Kedah scores lowest in 2025 National Unity Index', ''],
		['Malay Mail · 6 Sep 2024', 'Merdeka Center youth survey: Indians report discrimination, Malays show low trust in own community', ''],
		['Free Malaysia Today · 9 Mei 2026', 'Close to 400 3R-related items taken down in first 4 months', ''],
		['Utusan Malaysia · Jul 2024', 'PARLIMEN: Kemasukan murid bukan bumiputera ke SK menurun dalam 10 tahun', ''],
	];
	return (
		<Win s={335.7 + 0.3} e={347.4} d={0.6}>
			{(t, v) => {
				const pull = rise(t, 342.9, 4.5);
				return (
					<AbsoluteFill style={{opacity: v, perspective: 1600}}>
						<div
							style={{
								position: 'absolute',
								left: 160,
								top: 110,
								width: 1600,
								display: 'grid',
								gridTemplateColumns: 'repeat(3, 1fr)',
								gap: 26,
								transform: `rotateX(8deg) scale(${lerp(1.06, 0.94, pull)})`,
							}}
						>
							{H.map(([outlet, head, lead], i) => {
								const p = lead ? rise(t, 336.0, 0.6) : rise(t, 342.9 + i * 0.35, 0.6);
								return (
									<div
										key={head}
										style={{
											background: C.paper,
											color: C.ink,
											borderRadius: 4,
											padding: '22px 24px',
											minHeight: 230,
											opacity: p,
											transform: `translateY(${lerp(40, 0, p)}px) rotate(${(i % 2 ? 1 : -1) * 0.8}deg)`,
											boxShadow: lead ? `0 0 0 4px ${C.gold}, 0 20px 50px rgba(0,0,0,0.45)` : '0 20px 50px rgba(0,0,0,0.45)',
										}}
									>
										<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 17, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.red}}>
											{outlet}
										</div>
										<div style={{height: 2, background: C.ink, opacity: 0.15, margin: '12px 0'}} />
										<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 31, lineHeight: 1.18}}>{head}</div>
									</div>
								);
							})}
						</div>
						<div
							style={{
								position: 'absolute',
								left: 160,
								top: 760,
								fontFamily: F.sans,
								fontWeight: 700,
								fontSize: 26,
								color: C.white,
								opacity: rise(t, 336.6),
							}}
						>
							Perpaduan dijadikan <span style={{color: C.gold}}>prinsip asas</span> Rancangan Pendidikan Malaysia 2026–2035. Apa kata bukti?
						</div>
					</AbsoluteFill>
				);
			}}
		</Win>
	);
};

/** Chart Grow: IPNas sebagai carta animasi di sisi wajah */
export const IPNasChart: React.FC = () => {
	const bars: [string, number, number][] = [
		['2018', 0.567, 350.4],
		['2022', 0.629, 353.8],
		['2025', 0.701, 359.0],
	];
	const H = 430;
	const y = (val: number) => H - val * H;
	return (
		<Win s={347.5} e={S(110) - 0.3}>
			{(t, v) => (
				<Glass style={{position: 'absolute', left: 70, top: 110, width: 640, padding: '26px 30px 22px', opacity: v, transform: `translateX(${lerp(-40, 0, v)}px)`}}>
					<Eyebrow>Indeks Perpaduan Nasional (IPNas)</Eyebrow>
					<div style={{fontSize: 20, color: C.soft, marginTop: 4}}>Skor 0 hingga 1</div>
					<svg width={580} height={H + 50} style={{marginTop: 14, overflow: 'visible'}}>
						{[0, 0.25, 0.5, 0.75, 1].map((g) => (
							<g key={g}>
								<line x1={44} x2={580} y1={y(g)} y2={y(g)} stroke="#fff" strokeOpacity={0.12} />
								<text x={0} y={y(g) + 6} fill={C.faint} fontSize={17} fontFamily="Inter">
									{g.toFixed(2)}
								</text>
							</g>
						))}
						{bars.map(([yr, val, s], i) => {
							const p = rise(t, s, 0.9);
							const x = 90 + i * 165;
							const h = val * H * p;
							const last = i === 2;
							return (
								<g key={yr}>
									<rect x={x} y={H - h} width={110} height={h} rx={8} fill={last ? C.gold : '#5B8DB8'} />
									<text x={x + 55} y={H - h - 14} textAnchor="middle" fill={C.white} fontSize={30} fontWeight={800} fontFamily="Inter" opacity={p}>
										{countText(p, val, 3)}
									</text>
									<text x={x + 55} y={H + 32} textAnchor="middle" fill={C.soft} fontSize={21} fontFamily="Inter">
										{yr}
									</text>
								</g>
							);
						})}
						{(() => {
							const p = rise(t, 375.4, 1.0);
							return (
								<g opacity={p}>
									<line x1={44} x2={44 + 536 * p} y1={y(0.75)} y2={y(0.75)} stroke={C.red} strokeWidth={3} strokeDasharray="10 8" />
									<text x={60} y={y(0.75) - 12} fill={C.red} fontSize={20} fontWeight={700} fontFamily="Inter">
										Ambang tahap tinggi 0.75
									</text>
								</g>
							);
						})()}
					</svg>
					<div style={{display: 'flex', gap: 12, marginTop: 6, opacity: rise(t, S(105))}}>
						<div style={{fontSize: 22, fontWeight: 700}}>Tidak sekata antara negeri:</div>
						<div style={{fontSize: 22, fontWeight: 800, color: C.gold, opacity: rise(t, 387.0)}}>Kedah 0.593 (terendah 2025)</div>
					</div>
					<Source>The Borneo Post (2026); Bernama (t.t.); Free Malaysia Today (2026a)</Source>
				</Glass>
			)}
		</Win>
	);
};

/** Data belia: 43% → 58% */
export const YouthStat: React.FC = () => (
	<Win s={S(110) + 0.2} e={S(118) - 0.2}>
		{(t, v) => {
			const a = rise(t, 429.1, 0.8);
			const b = rise(t, 430.8, 1.0);
			return (
				<Glass style={{position: 'absolute', left: 70, top: 150, width: 640, padding: '28px 32px', opacity: v, transform: `translateX(${lerp(-40, 0, v)}px)`}}>
					<Eyebrow>Kajian Belia Kebangsaan · Merdeka Center 2024</Eyebrow>
					<div style={{fontSize: 24, color: C.soft, marginTop: 10, opacity: rise(t, 413.4)}}>
						<b style={{color: C.white}}>1,605</b> belia berumur 18–30 tahun
					</div>
					<div style={{fontSize: 27, fontWeight: 700, marginTop: 22, lineHeight: 1.25, opacity: rise(t, S(114))}}>
						Belia Cina &amp; India yang merasakan komuniti mereka <span style={{color: C.gold}}>dilayan tidak adil</span>
					</div>
					<div style={{display: 'flex', alignItems: 'flex-end', gap: 24, marginTop: 26}}>
						<div style={{opacity: a}}>
							<div style={{fontSize: 84, fontWeight: 800, lineHeight: 1}}>{countText(a, 43, 0)}%</div>
							<div style={{fontSize: 20, color: C.soft, marginTop: 6}}>Jan. 2023</div>
						</div>
						<div style={{opacity: b, paddingBottom: 40}}>
							<svg width={90} height={40}>
								<path d={`M0 20 H${70 * b} M${70 * b - 14} 6 L${70 * b} 20 L${70 * b - 14} 34`} stroke={C.gold} strokeWidth={5} fill="none" strokeLinecap="round" />
							</svg>
						</div>
						<div style={{opacity: b}}>
							<div style={{fontSize: 100, fontWeight: 800, lineHeight: 1, color: C.gold}}>{countText(b, 58, 0, 43)}%</div>
							<div style={{fontSize: 20, color: C.soft, marginTop: 6}}>Apr. 2024</div>
						</div>
					</div>
					<Source>Malay Mail (2024, 6 September); Fulcrum (2024)</Source>
				</Glass>
			);
		}}
	</Win>
);

/** Glass Type: petikan Ibrahim Suffian (parafrasa) */
export const SuffianQuote: React.FC = () => (
	<Win s={S(118)} e={S(123) - 0.3}>
		{(t, v) => (
			<Glass style={{position: 'absolute', left: 70, top: 200, width: 640, padding: '34px 36px', opacity: v, transform: `translateY(${lerp(24, 0, v)}px)`}}>
				<div style={{fontFamily: F.serif, fontSize: 90, lineHeight: 0.6, color: C.gold}}>“</div>
				<div style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 600, fontSize: 38, lineHeight: 1.22}}>
					Kepercayaan antara etnik yang rendah berkait dengan <span style={{color: C.gold}}>ketiadaan jiran dan rakan sekolah</span> daripada etnik lain.
				</div>
				<div style={{fontSize: 22, fontWeight: 700, marginTop: 20}}>Ibrahim Suffian, Merdeka Center</div>
				<div style={{fontSize: 18, color: C.faint, marginTop: 4}}>Parafrasa · Malay Mail (2024)</div>
			</Glass>
		)}
	</Win>
);

export const _a = E;
export const _b = Icon;
