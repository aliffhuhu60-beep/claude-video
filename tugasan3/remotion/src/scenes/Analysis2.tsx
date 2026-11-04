import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, Eyebrow, F, Glass, Icon, S, Source, Win, countText, lerp, rise} from '../lib';

/** Phone Mockup: kandungan 3R yang diturunkan MCMC */
export const PhoneMockup: React.FC = () => {
	// Hanya angka yang disebut dalam syarahan dilabel
	const bars: [string, number, number | null][] = [
		['2022', 175, 480.3],
		['2023', 1633, null],
		['2024', 4830, 483.8],
		['2025', 1504, 492.2],
	];
	return (
		<Win s={S(123)} e={S(135) - 0.3} d={0.6}>
			{(t, v) => {
				// kaunter utama mengikut angka yang sedang disebut
				let big = '';
				if (t >= 497.7) big = countText(rise(t, 497.7, 1.2), 8540, 0);
				else if (t >= 492.2) big = countText(rise(t, 492.2, 0.9), 1504, 0, 4830);
				else if (t >= 483.8) big = countText(rise(t, 483.8, 1.0), 4830, 0, 175);
				else if (t >= 480.3) big = countText(rise(t, 480.3, 0.7), 175, 0);
				const label = t >= 497.7 ? 'kandungan diturunkan sejak 2022 (hingga Apr. 2026)' : 'kandungan 3R diturunkan MCMC';
				const scroll = rise(t, S(133), 8) * 260;
				return (
					<div style={{position: 'absolute', left: 150, top: 46, opacity: v, transform: `translateY(${lerp(80, 0, v)}px) rotate(${lerp(-6, -3, v)}deg)`}}>
						<div
							style={{
								width: 400,
								height: 790,
								borderRadius: 56,
								background: '#0b0f16',
								padding: 16,
								boxShadow: '0 40px 90px rgba(0,0,0,0.6), inset 0 0 0 2px #2a3240',
							}}
						>
							<div style={{width: '100%', height: '100%', borderRadius: 42, overflow: 'hidden', background: '#F3F5F8', position: 'relative', fontFamily: F.sans}}>
								<div style={{position: 'absolute', top: 12, left: '50%', marginLeft: -55, width: 110, height: 28, borderRadius: 14, background: '#0b0f16'}} />
								<div style={{padding: '58px 22px 0', color: C.ink}}>
									<div style={{fontSize: 15, fontWeight: 700, letterSpacing: '0.1em', color: C.red}}>RUANG DIGITAL · 3R</div>
									<div style={{fontSize: 17, color: '#55607a', marginTop: 4, opacity: rise(t, S(125))}}>Kaum · Agama · Institusi diraja</div>
									<div style={{fontSize: 68, fontWeight: 800, marginTop: 14, color: t >= 497.7 ? C.red : C.ink, minHeight: 82}}>{big}</div>
									<div style={{fontSize: 17, color: '#55607a', minHeight: 44}}>{big ? label : ''}</div>
									<svg width={330} height={220} style={{marginTop: 10}}>
										{bars.map(([yr, val, s], i) => {
											const p = s === null ? rise(t, 483.0, 0.8) * 0.9 : rise(t, s, 0.9);
											const h = (val / 5000) * 180 * p;
											const x = 18 + i * 80;
											const hot = yr === '2024';
											return (
												<g key={yr}>
													<rect x={x} y={190 - h} width={54} height={h} rx={6} fill={hot ? C.red : s === null ? '#C8D1DE' : '#5B8DB8'} />
													{s !== null && p > 0.3 ? (
														<text x={x + 27} y={182 - h} textAnchor="middle" fontSize={17} fontWeight={800} fill={C.ink}>
															{val.toLocaleString('en-US')}
														</text>
													) : null}
													<text x={x + 27} y={212} textAnchor="middle" fontSize={15} fill="#55607a">
														{yr}
													</text>
												</g>
											);
										})}
									</svg>
									{/* suapan algoritma */}
									<div style={{marginTop: 14, height: 250, overflow: 'hidden', opacity: rise(t, S(132))}}>
										<div style={{transform: `translateY(${-scroll}px)`}}>
											{Array.from({length: 8}).map((_, i) => (
												<div key={i} style={{background: '#fff', borderRadius: 14, padding: 12, marginBottom: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: 10}}>
													<div style={{width: 36, height: 36, borderRadius: 18, background: i % 3 ? '#C8D1DE' : '#F2C9BD'}} />
													<div style={{flex: 1}}>
														<div style={{height: 10, width: '70%', background: '#D5DBE5', borderRadius: 5}} />
														<div style={{height: 10, width: '92%', background: '#E4E8EF', borderRadius: 5, marginTop: 8}} />
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
						<div style={{position: 'absolute', left: 250, top: 18, width: 300, opacity: rise(t, S(133))}}>
							<Glass style={{padding: '16px 20px', transform: 'rotate(3deg)'}}>
								<div style={{fontSize: 24, fontWeight: 800}}>
									Stereotaip <span style={{color: C.gold}}>disuap oleh algoritma</span>
								</div>
							</Glass>
						</div>
						<div style={{position: 'absolute', left: 6, top: 790, width: 520, transform: 'rotate(3deg)'}}>
							<Source style={{color: C.soft}}>Teo Nie Ching, Timbalan Menteri Komunikasi; Free Malaysia Today (2026b)</Source>
						</div>
					</div>
				);
			}}
		</Win>
	);
};

/** Grafik perbandingan enrolmen SJK(C) */
export const Enrolment: React.FC = () => (
	<Win s={S(135)} e={S(146) - 0.3}>
		{(t, v) => {
			const a = rise(t, 531.1, 1.0);
			const b = rise(t, 535.6, 1.2);
			const W = 520;
			return (
				<Glass style={{position: 'absolute', left: 70, top: 150, width: 640, padding: '28px 32px', opacity: v, transform: `translateX(${lerp(-40, 0, v)}px)`}}>
					<Eyebrow>Corak persekolahan</Eyebrow>
					<div style={{fontSize: 27, fontWeight: 700, marginTop: 10, opacity: rise(t, S(137))}}>Peratus murid Bumiputera di SJK(C)</div>
					{[
						['2014', 11.67, a, '#5B8DB8'],
						['2024', 18.52, b, C.gold],
					].map(([yr, val, p, col]) => (
						<div key={yr as string} style={{marginTop: 20, opacity: p as number}}>
							<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 21, color: C.soft}}>
								<span>{yr}</span>
								<span style={{fontSize: 40, fontWeight: 800, color: C.white}}>{countText(p as number, val as number, 2)}%</span>
							</div>
							<div style={{height: 26, borderRadius: 13, background: 'rgba(255,255,255,0.1)', marginTop: 6}}>
								<div style={{height: 26, borderRadius: 13, width: ((val as number) / 25) * W * (p as number), background: col as string}} />
							</div>
						</div>
					))}
					<div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24}}>
						<div style={{display: 'flex', gap: 14, alignItems: 'center', fontSize: 23, opacity: rise(t, S(141))}}>
							<Icon name="school" size={30} />
							<span>SJK(T): hampir keseluruhannya murid India</span>
						</div>
						<div style={{display: 'flex', gap: 14, alignItems: 'center', fontSize: 23, opacity: rise(t, S(143))}}>
							<Icon name="down" size={30} color={C.red} />
							<span>
								Kemasukan murid bukan Bumiputera ke SK <b style={{color: C.gold}}>menurun</b>
							</span>
						</div>
					</div>
					<Source>Jawapan KPM di Parlimen, dilaporkan Utusan Malaysia (2024)</Source>
				</Glass>
			);
		}}
	</Win>
);

/** Kajian Chong (2024), ISIS Malaysia */
export const Chong: React.FC = () => (
	<Win s={S(146)} e={582.0}>
		{(t, v) => (
			<Glass style={{position: 'absolute', left: 70, top: 220, width: 620, padding: '28px 32px', opacity: v, transform: `translateY(${lerp(24, 0, v)}px)`}}>
				<Eyebrow>ISIS Malaysia · Chong (2024)</Eyebrow>
				<div style={{display: 'flex', gap: 16, alignItems: 'center', marginTop: 18}}>
					<Icon name="home" size={44} />
					<div style={{fontSize: 27, fontWeight: 700, lineHeight: 1.25}}>
						Membesar di kawasan satu etnik → cenderung <span style={{color: C.gold}}>berkawan dalam kelompok sendiri</span>
					</div>
				</div>
				<div style={{display: 'flex', gap: 16, alignItems: 'center', marginTop: 18, opacity: rise(t, S(150))}}>
					<Icon name="chat" size={44} />
					<div style={{fontSize: 27, fontWeight: 700, lineHeight: 1.25}}>
						Bahasa kebangsaan <span style={{color: C.gold}}>mengurangkan</span> kecenderungan ini
					</div>
				</div>
			</Glass>
		)}
	</Win>
);

/** Glass Type: soalan dan jawapan "Tidak" */
export const NotEnough: React.FC = () => (
	<Win s={S(153)} e={S(156) + 0.6}>
		{(t, v) => (
			<div style={{position: 'absolute', left: 80, top: 230, width: 640, opacity: v}}>
				<Glass style={{padding: '28px 32px'}}>
					<div style={{fontFamily: F.serif, fontWeight: 600, fontSize: 42, lineHeight: 1.18}}>
						Adakah memadai jika murid pelbagai kaum <span style={{color: C.gold}}>sekadar berada di sekolah yang sama?</span>
					</div>
				</Glass>
				<div
					style={{
						fontFamily: F.serif,
						fontWeight: 800,
						fontSize: 130,
						color: C.gold,
						marginTop: 10,
						opacity: rise(t, 594.0, 0.3),
						transform: `scale(${lerp(1.4, 1, rise(t, 594.0, 0.45))})`,
						transformOrigin: 'left center',
						textShadow: '0 10px 40px rgba(0,0,0,0.5)',
					}}
				>
					Tidak.
				</div>
			</div>
		)}
	</Win>
);

/** Orbit: empat syarat Hipotesis Hubungan Allport */
export const AllportOrbit: React.FC = () => {
	const cx = 1000,
		cy = 460,
		rx = 650,
		ry = 320;
	const N: [number, number, string, string][] = [
		[208, 608.5, 'Status setara', 'Tiada kumpulan yang dominan'],
		[332, 610.0, 'Matlamat bersama', 'Semua menuju hasil yang sama'],
		[28, 611.8, 'Kerjasama', 'Saling bergantung, bukan bersaing'],
		[152, 612.8, 'Sokongan pihak berautoriti', 'Guru dan pentadbir menyokong'],
	];
	return (
		<Win s={S(156)} e={S(161) - 0.2} d={0.6}>
			{(t, v) => {
				const drift = Math.sin(t * 0.5) * 2;
				const pos = N.map(([ang, s]) => {
					const p = rise(t, s, 0.8);
					const a = ((ang - lerp(30, 0, p) + drift) * Math.PI) / 180;
					return {x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a), p};
				});
				return (
					<div style={{position: 'absolute', inset: 0, opacity: v}}>
						<Glass style={{position: 'absolute', left: 80, top: 60, padding: '14px 22px'}}>
							<span style={{fontSize: 24, fontWeight: 800}}>Hipotesis Hubungan</span>
							<span style={{fontSize: 22, color: C.gold, marginLeft: 12}}>Allport (1954)</span>
						</Glass>
						<svg width={1920} height={1080} style={{position: 'absolute'}}>
							{[
								[0, 3],
								[1, 2],
							].map(([a, b]) => {
								const p = Math.min(pos[a].p, pos[b].p);
								return (
									<line
										key={`${a}${b}`}
										x1={pos[a].x}
										y1={pos[a].y + 44}
										x2={lerp(pos[a].x, pos[b].x, p)}
										y2={lerp(pos[a].y + 44, pos[b].y - 44, p)}
										stroke={C.gold}
										strokeWidth={2.5}
										strokeDasharray="6 8"
										opacity={0.8}
									/>
								);
							})}
						</svg>
						{N.map(([, , a, b], i) => (
							<div key={a} style={{position: 'absolute', left: pos[i].x - 200, top: pos[i].y - 50, width: 400, opacity: pos[i].p, transform: `scale(${lerp(0.8, 1, pos[i].p)})`}}>
								<Glass style={{padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center', border: `1.5px solid ${C.gold}`}}>
									<div style={{width: 46, height: 46, borderRadius: 23, background: C.gold, color: C.navy, fontWeight: 800, fontSize: 24, display: 'grid', placeItems: 'center', flexShrink: 0}}>
										{i + 1}
									</div>
									<div>
										<div style={{fontSize: 27, fontWeight: 800, lineHeight: 1.1}}>{a}</div>
										<div style={{fontSize: 19, color: C.soft, marginTop: 3}}>{b}</div>
									</div>
								</Glass>
							</div>
						))}
					</div>
				);
			}}
		</Win>
	);
};

/** Paper Cut: Pettigrew & Tropp (2006) */
export const Pettigrew: React.FC = () => (
	<Win s={S(161)} e={S(165) - 0.2}>
		{(t, v) => (
			<div style={{position: 'absolute', left: 90, top: 170, width: 560, opacity: v, transform: `rotate(${lerp(-5, -2, v)}deg) translateY(${lerp(40, 0, v)}px)`}}>
				<div style={{background: C.paper, color: C.ink, padding: '30px 34px', borderRadius: 4, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
					<Eyebrow color={C.red}>Meta-analisis · 2006</Eyebrow>
					<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 30, marginTop: 8}}>Pettigrew &amp; Tropp</div>
					<div style={{display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 10}}>
						<div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 110, lineHeight: 1, color: C.red}}>{countText(rise(t, 623.1, 1.2), 515, 0)}</div>
						<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 30}}>kajian</div>
					</div>
					<div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 26, lineHeight: 1.3, marginTop: 14, opacity: rise(t, S(163))}}>
						Hubungan antara kumpulan mengurangkan prasangka; kesannya lebih kuat apabila syarat Allport dipenuhi.
					</div>
					<div style={{fontFamily: F.sans, fontSize: 16, color: '#5a6476', marginTop: 12}}>Journal of Personality and Social Psychology, 90(5)</div>
				</div>
			</div>
		)}
	</Win>
);

/** Frame Break: bercampur tetapi tidak bergabung */
export const MixFrame: React.FC = () => (
	<Win s={S(165) + 0.5} e={649.7}>
		{(t, v) => (
			<div style={{position: 'absolute', left: 40, top: 560, width: 940, opacity: v, background: 'rgba(10,27,46,0.9)', borderLeft: `6px solid ${C.gold}`, padding: '22px 30px', borderRadius: 8, boxShadow: '0 24px 60px rgba(0,0,0,0.5)'}}>
				<div style={{fontSize: 26, fontWeight: 700, fontFamily: F.sans, color: C.soft, opacity: rise(t, S(166))}}>Berkelompok mengikut kaum di kantin dan di dalam kelas</div>
				<div
					style={{
						fontFamily: F.serif,
						fontWeight: 800,
						fontSize: 70,
						lineHeight: 1.05,
						color: C.white,
						marginTop: 10,
						opacity: rise(t, S(168)),
						transform: `translateX(${lerp(-80, 0, rise(t, S(168)))}px)`,
						textShadow: '0 8px 40px rgba(0,0,0,0.6)',
					}}
				>
					Bercampur, <span style={{color: C.gold}}>tetapi tidak bergabung.</span>
				</div>
			</div>
		)}
	</Win>
);

/** Menolak naratif yang terlalu mudah */
export const Narrative: React.FC = () => (
	<Win s={S(170)} e={S(185) - 0.3}>
		{(t, v) => {
			const strike = rise(t, S(173), 0.8);
			const phase2 = rise(t, S(177));
			return (
				<div style={{position: 'absolute', left: 70, top: 120, width: 640, opacity: v}}>
					<Eyebrow>Menolak naratif yang terlalu mudah</Eyebrow>
					<Glass style={{padding: '22px 26px', marginTop: 16, opacity: rise(t, S(171))}}>
						<div style={{fontSize: 18, fontWeight: 700, color: C.red, letterSpacing: '0.1em'}}>NARATIF MUDAH</div>
						<div style={{fontSize: 27, fontWeight: 700, marginTop: 6, position: 'relative', display: 'inline-block'}}>
							Sekolah vernakular punca utama polarisasi
							<div style={{position: 'absolute', left: 0, top: '52%', height: 4, width: `${strike * 100}%`, background: C.red}} />
						</div>
					</Glass>
					<Glass style={{padding: '22px 26px', marginTop: 14, border: `2px solid ${C.gold}`, opacity: rise(t, S(174))}}>
						<div style={{fontSize: 18, fontWeight: 700, color: C.gold, letterSpacing: '0.1em'}}>BACAAN BERASASKAN BUKTI</div>
						<div style={{fontSize: 25, marginTop: 6, lineHeight: 1.3}}>
							SJK(C) <b>semakin pelbagai</b>; SK pula <b>semakin kurang</b> kepelbagaian kaum
						</div>
					</Glass>
					<Glass style={{padding: '20px 26px', marginTop: 14, opacity: phase2}}>
						<div style={{display: 'flex', gap: 14, alignItems: 'center'}}>
							<div style={{fontSize: 34, fontWeight: 800, color: C.gold}}>RIMUP</div>
							<div style={{fontSize: 22, color: C.soft}}>sejak 1986 · Hussien &amp; Abdullah (2018)</div>
						</div>
						<div style={{fontSize: 25, marginTop: 8, opacity: rise(t, S(181))}}>
							Acara sehari → risiko <b style={{color: C.gold}}>“perpaduan bermusim”</b>
						</div>
					</Glass>
					<div
						style={{
							marginTop: 14,
							padding: '18px 24px',
							background: C.gold,
							color: C.navy,
							borderRadius: 14,
							fontWeight: 800,
							fontSize: 25,
							lineHeight: 1.25,
							fontFamily: F.sans,
							opacity: rise(t, S(183)),
						}}
					>
						Masalah utama: kualiti pelaksanaan di peringkat bilik darjah
					</div>
				</div>
			);
		}}
	</Win>
);

/** Glass Type: adil terhadap bukti */
export const CriticalRead: React.FC = () => {
	const R: [number, string, string][] = [
		[S(190), 'IPNas', 'Indeks nasional, tidak semestinya suasana bilik darjah'],
		[S(193), 'Merdeka Center', 'Mengukur persepsi, bukan bukti diskriminasi'],
		[S(197), 'Data 3R', 'Mencerminkan intensiti penguatkuasaan'],
	];
	return (
		<Win s={S(186)} e={S(199) - 0.1}>
			{(t, v) => (
				<div style={{position: 'absolute', left: 70, top: 150, width: 640, opacity: v}}>
					<Eyebrow>Bersikap adil terhadap bukti</Eyebrow>
					<div style={{fontSize: 21, color: C.soft, marginTop: 6, opacity: rise(t, S(188))}}>Seperti penilaian kritis terhadap Salleh (2022) dalam Tugasan 2</div>
					<div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20}}>
						{R.map(([s, a, b]) => {
							const p = rise(t, s);
							return (
								<Glass key={a} style={{padding: '20px 24px', opacity: p, transform: `translateX(${lerp(-30, 0, p)}px)`}}>
									<div style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.1em', color: C.gold}}>HAD BUKTI · {a.toUpperCase()}</div>
									<div style={{fontSize: 27, fontWeight: 700, marginTop: 6, lineHeight: 1.25}}>{b}</div>
								</Glass>
							);
						})}
					</div>
				</div>
			)}
		</Win>
	);
};

/** Pull-back Reveal: triangulasi bukti */
export const Triangulation: React.FC = () => (
	<Win s={S(199) + 0.2} e={774.3} d={0.6}>
		{(t, v) => {
			const conv = rise(t, S(200), 1.4);
			const src = ['IPNas', 'Kajian belia', 'Data 3R'];
			return (
				<div style={{position: 'absolute', left: 80, top: 160, width: 860, opacity: v}}>
					<Eyebrow>Triangulasi</Eyebrow>
					<div style={{display: 'flex', gap: 16, marginTop: 24}}>
						{src.map((s, i) => (
							<Glass key={s} style={{flex: 1, textAlign: 'center', padding: '20px 10px', fontSize: 28, fontWeight: 800, transform: `translateX(${(1 - i) * 20 * conv}px)`}}>
								{s}
							</Glass>
						))}
					</div>
					<svg width={860} height={120}>
						{[0, 1, 2].map((i) => {
							const x = 135 + i * 295;
							return <line key={i} x1={x} y1={0} x2={lerp(x, 430, conv)} y2={120 * conv} stroke={C.gold} strokeWidth={3} />;
						})}
					</svg>
					<div
						style={{
							background: C.gold,
							color: C.navy,
							borderRadius: 16,
							padding: '26px 30px',
							fontFamily: F.serif,
							fontWeight: 800,
							fontSize: 48,
							textAlign: 'center',
							opacity: rise(t, S(202), 0.6),
							transform: `scale(${lerp(0.9, 1, rise(t, S(202), 0.6))})`,
						}}
					>
						Perpaduan kita stabil, tetapi masih cetek
					</div>
				</div>
			);
		}}
	</Win>
);

/** al-Hujurat 49:13 dengan tipografi sopan */
export const Hujurat: React.FC = () => (
	<Win s={780.8 + 0.3} e={789.8} d={0.7}>
		{(t, v) => (
			<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: v}}>
				<div style={{width: 1300, textAlign: 'center'}}>
					<div style={{width: 180 * v, height: 2, background: C.gold, margin: '0 auto 36px'}} />
					<div style={{fontFamily: F.serif, fontWeight: 500, fontSize: 64, lineHeight: 1.25, color: C.white}}>
						Manusia dijadikan berbangsa-bangsa dan bersuku-suku <span style={{color: C.gold, fontStyle: 'italic'}}>supaya saling mengenali.</span>
					</div>
					<div style={{fontFamily: F.sans, fontWeight: 600, fontSize: 26, color: C.soft, marginTop: 36, letterSpacing: '0.06em'}}>Maksud Surah al-Hujurat, 49:13</div>
					<div style={{width: 180 * v, height: 2, background: C.gold, margin: '36px auto 0'}} />
				</div>
			</AbsoluteFill>
		)}
	</Win>
);

/** Konsep insan sebagai kad terapung */
export const InsanConcepts: React.FC = () => {
	const K: [number, string, string][] = [
		[S(208), 'Atman', 'Martabat rohani setiap insan'],
		[S(210), 'Anatta', 'Lepaskan keterikatan pada ego, termasuk ego kelompok'],
		[S(213), 'Diri relasional', 'Konfusianisme & autonomi berasaskan hubungan: diri berkembang melalui hubungan'],
	];
	return (
		<Win s={S(208)} e={S(215) - 0.2}>
			{(t, v) => (
				<div style={{position: 'absolute', left: 70, top: 150, width: 620, opacity: v, display: 'flex', flexDirection: 'column', gap: 16}}>
					<Eyebrow>Kembali kepada konsep insan</Eyebrow>
					{K.map(([s, a, b]) => {
						const p = rise(t, s);
						return (
							<Glass key={a} style={{padding: '22px 26px', opacity: p, transform: `translateY(${lerp(20, 0, p)}px)`}}>
								<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 36, color: C.gold}}>{a}</div>
								<div style={{fontSize: 25, marginTop: 4, lineHeight: 1.28}}>{b}</div>
							</Glass>
						);
					})}
				</div>
			)}
		</Win>
	);
};

/** Glass Type: gelembung etnik */
export const Bubble: React.FC = () => (
	<Win s={S(215)} e={828.2}>
		{(t, v) => (
			<Glass style={{position: 'absolute', left: 70, top: 230, width: 640, padding: '30px 34px', opacity: v, transform: `translateY(${lerp(24, 0, v)}px)`}}>
				<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 52}}>“Gelembung etnik”</div>
				<div style={{fontSize: 29, marginTop: 14, lineHeight: 1.3, opacity: rise(t, S(217))}}>
					Murid terlepas sebahagian proses untuk menjadi <b style={{color: C.gold}}>insan yang seimbang</b>
				</div>
				<div style={{fontSize: 21, color: C.soft, marginTop: 12, opacity: rise(t, S(218))}}>Hasrat Falsafah Pendidikan Kebangsaan</div>
			</Glass>
		)}
	</Win>
);
