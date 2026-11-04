import React from 'react';
import {C, Eyebrow, F, Glass, Icon, S, Source, Win, lerp, rise} from '../lib';

/** Frame Break: perkataan BINA memecah bingkai */
export const BinaBreak: React.FC = () => (
	<Win s={S(221) - 0.2} e={839.2} d={0.4}>
		{(t, v) => (
			<div style={{position: 'absolute', left: 40, top: 420, opacity: v, display: 'flex', gap: 6}}>
				{['B', 'I', 'N', 'A'].map((L, i) => {
					const p = rise(t, S(221) + i * 0.18, 0.5);
					return (
						<div
							key={L}
							style={{
								fontFamily: F.serif,
								fontWeight: 800,
								fontSize: 240,
								lineHeight: 1,
								color: i % 2 ? C.white : C.gold,
								textShadow: '0 16px 50px rgba(0,0,0,0.55)',
								opacity: p,
								transform: `translateY(${lerp(80, 0, p)}px) scale(${lerp(1.3, 1, p)})`,
							}}
						>
							{L}
						</div>
					);
				})}
			</div>
		)}
	</Win>
);

const Tick: React.FC<{p: number; size?: number}> = ({p, size = 40}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: size / 2,
			flexShrink: 0,
			background: p > 0.5 ? C.gold : 'rgba(255,255,255,0.12)',
			display: 'grid',
			placeItems: 'center',
			transform: `scale(${lerp(0.6, 1, p)})`,
		}}
	>
		<svg width={size * 0.6} height={size * 0.6} viewBox="0 0 32 32">
			<path d="M6 17 L13 24 L27 8" fill="none" stroke={C.navy} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={40} strokeDashoffset={40 * (1 - p)} />
		</svg>
	</div>
);

/** Checklist: B-I-N-A berkembang menjadi nama strategi */
export const BinaChecklist: React.FC = () => {
	const R: [string, number, string][] = [
		['B', 840.8, 'Bilik darjah responsif budaya'],
		['I', 844.0, 'Interaksi bermakna merentas kumpulan'],
		['N', 846.5, 'Nilai & literasi digital'],
		['A', 849.9, 'Akauntabiliti & kolaborasi komuniti'],
	];
	const P: [string, number][] = [
		['Konkrit', S(226) + 1.5],
		['Praktikal', S(227)],
		['Beretika', S(227) + 2.6],
	];
	return (
		<Win s={S(222)} e={S(230) - 0.2}>
			{(t, v) => (
				<div style={{position: 'absolute', left: 70, top: 110, width: 660, opacity: v}}>
					<Eyebrow>Kerangka BINA</Eyebrow>
					<div style={{display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16}}>
						{R.map(([L, s, name]) => {
							const p = rise(t, s, 0.6);
							return (
								<Glass key={L} style={{display: 'flex', alignItems: 'center', gap: 20, padding: '12px 20px', opacity: lerp(0.35, 1, p)}}>
									<div style={{fontFamily: F.serif, fontWeight: 800, fontSize: 68, lineHeight: 1, color: C.gold, width: 56, textAlign: 'center'}}>{L}</div>
									<div style={{overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: 560 * p, fontSize: 26, fontWeight: 700}}>{name}</div>
								</Glass>
							);
						})}
					</div>
					<div style={{display: 'flex', gap: 12, marginTop: 18}}>
						{P.map(([w, s]) => {
							const p = rise(t, s, 0.5);
							return (
								<div key={w} style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderRadius: 30, background: 'rgba(9,24,42,0.7)', opacity: p, fontFamily: F.sans, fontSize: 24, fontWeight: 700, color: C.white}}>
									<Tick p={p} size={32} /> {w}
								</div>
							);
						})}
					</div>
				</div>
			)}
		</Win>
	);
};

/** Panel strategi dengan checklist */
const StrategyPanel: React.FC<{
	t: number;
	v: number;
	letter: string;
	title: string;
	items: {s: number; text: React.ReactNode; sub?: React.ReactNode; subS?: number}[];
	source?: string;
	sourceS?: number;
	footer?: React.ReactNode;
	footerS?: number;
}> = ({t, v, letter, title, items, source, sourceS, footer, footerS}) => (
	<div style={{position: 'absolute', left: 70, top: 110, width: 660, opacity: v, transform: `translateX(${lerp(-40, 0, v)}px)`}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
			<div style={{width: 92, height: 92, borderRadius: 20, background: C.gold, display: 'grid', placeItems: 'center', fontFamily: F.serif, fontWeight: 800, fontSize: 64, color: C.navy}}>
				{letter}
			</div>
			<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 38, color: C.white, lineHeight: 1.1, textShadow: '0 4px 20px rgba(0,0,0,0.5)'}}>{title}</div>
		</div>
		<Glass style={{marginTop: 18, padding: '18px 24px'}}>
			<div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
				{items.map((it, i) => {
					const p = rise(t, it.s, 0.5);
					if (t < it.s - 0.02) return null;
					return (
						<div key={i} style={{display: 'flex', gap: 16, alignItems: 'flex-start', opacity: lerp(0.0, 1, p)}}>
							<Tick p={p} />
							<div>
								<div style={{fontSize: 27, fontWeight: 700, lineHeight: 1.2}}>{it.text}</div>
								{it.sub ? <div style={{fontSize: 21, color: C.soft, marginTop: 4, lineHeight: 1.3, opacity: rise(t, it.subS ?? it.s)}}>{it.sub}</div> : null}
							</div>
						</div>
					);
				})}
			</div>
			{source ? <div style={{opacity: rise(t, sourceS ?? 0)}}><Source>{source}</Source></div> : null}
		</Glass>
		{footer ? (
			<div style={{marginTop: 14, padding: '14px 22px', background: C.gold, color: C.navy, borderRadius: 14, fontWeight: 800, fontSize: 24, fontFamily: F.sans, opacity: rise(t, footerS ?? 0)}}>
				{footer}
			</div>
		) : null}
	</div>
);

export const StratB: React.FC = () => (
	<Win s={S(230)} e={S(247) - 0.2}>
		{(t, v) => (
			<StrategyPanel
				t={t}
				v={v}
				letter="B"
				title="Bilik darjah responsif budaya"
				source="Gay (2018); Aronson & Patnoe (2011)"
				sourceS={S(231)}
				items={[
					{s: S(235), text: 'Kumpulan Jigsaw heterogen', sub: 'Status setara dan saling bergantung, tepat seperti syarat Allport', subS: S(238)},
					{s: S(242), text: 'Bahan pengajaran pelbagai budaya', sub: 'Nama, perayaan dan cerita daripada pelbagai komuniti'},
					{
						s: S(244),
						text: 'Audit bias kendiri',
						sub: (
							<>
								<div style={{opacity: rise(t, S(245))}}>Siapa yang selalu saya panggil?</div>
								<div style={{opacity: rise(t, S(246))}}>Siapa yang kerap saya tegur? Apakah andaian saya?</div>
							</>
						),
					},
				]}
			/>
		)}
	</Win>
);

export const StratI: React.FC = () => (
	<Win s={S(247)} e={S(262) - 0.2}>
		{(t, v) => (
			<StrategyPanel
				t={t}
				v={v}
				letter="I"
				title="Interaksi bermakna merentas kumpulan"
				items={[
					{s: S(249), text: 'Projek berasaskan masalah · 10 minggu', sub: 'Gabungan SK dan SJK yang berdekatan', subS: S(250)},
					{
						s: S(252),
						text: (
							<>
								“Peta Warisan Kejiranan Kita”
							</>
						),
						sub: 'Makanan · rumah ibadat · kisah warga emas',
						subS: S(253),
					},
					{
						s: S(255),
						text: 'Memenuhi syarat Allport',
						sub: (
							<>
								<span style={{opacity: rise(t, S(255))}}>Matlamat bersama</span> · <span style={{opacity: rise(t, S(256))}}>kerjasama berterusan</span> ·{' '}
								<span style={{opacity: rise(t, S(257))}}>sokongan pentadbir</span>
							</>
						),
					},
					{s: S(259), text: 'Amalan harian', sub: 'Pelan tempat duduk berputar · kumpulan kokurikulum bercampur', subS: S(260)},
				]}
				footer="Setiap hari, bukan setahun sekali"
				footerS={S(261)}
			/>
		)}
	</Win>
);

/** N: berhenti sebelum berkongsi + Checklist SEMAK */
export const StratN: React.FC = () => {
	const K: [string, string, string, number][] = [
		['S', 'Sumber', 'Siapa yang menulis?', 1013.95],
		['E', 'Emosi', 'Sengaja membangkitkan marah?', 1016.7],
		['M', 'Motif', 'Apakah tujuannya?', 1020.1],
		['A', 'Akibat', 'Siapa yang akan terluka?', 1022.7],
		['K', 'Konfirmasi', 'Semak sumber rasmi', 1025.6],
	];
	return (
		<Win s={S(262)} e={S(271) - 0.2}>
			{(t, v) => {
				const sem = rise(t, S(265), 0.6);
				return (
					<div style={{position: 'absolute', left: 70, top: 110, width: 660, opacity: v}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
							<div style={{width: 92, height: 92, borderRadius: 20, background: C.gold, display: 'grid', placeItems: 'center', fontFamily: F.serif, fontWeight: 800, fontSize: 64, color: C.navy}}>N</div>
							<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 38, color: C.white, textShadow: '0 4px 20px rgba(0,0,0,0.5)'}}>Nilai &amp; literasi digital</div>
						</div>
						<Glass style={{marginTop: 18, padding: '18px 24px', display: 'flex', gap: 16, alignItems: 'center', opacity: rise(t, S(264)) * (1 - 0.45 * sem)}}>
							<Icon name="phone" size={42} />
							<div style={{fontSize: 26, fontWeight: 700}}>
								Berhenti seketika <span style={{color: C.gold}}>sebelum berkongsi</span>
							</div>
						</Glass>
						<Glass style={{marginTop: 14, padding: '18px 24px', opacity: sem, border: `1.5px solid ${C.gold}`}}>
							<div style={{fontSize: 20, fontWeight: 700, letterSpacing: '0.14em', color: C.gold}}>PROTOKOL SEMAK</div>
							<div style={{display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12}}>
								{K.map(([L, w, q, s]) => {
									const p = rise(t, s, 0.5);
									return (
										<div key={L} style={{display: 'flex', alignItems: 'center', gap: 16, opacity: lerp(0.3, 1, p)}}>
											<Tick p={p} size={38} />
											<div style={{fontFamily: F.serif, fontWeight: 800, fontSize: 38, color: C.gold, width: 34}}>{L}</div>
											<div style={{fontSize: 27, fontWeight: 800, width: 170}}>{w}</div>
											<div style={{fontSize: 20, color: C.soft}}>{q}</div>
										</div>
									);
								})}
							</div>
						</Glass>
					</div>
				);
			}}
		</Win>
	);
};

export const DialogCircle: React.FC = () => (
	<Win s={S(271)} e={S(277) - 0.3}>
		{(t, v) => (
			<StrategyPanel
				t={t}
				v={v}
				letter="N"
				title="Bulatan dialog yang selamat"
				items={[
					{s: S(273), text: 'Bercakap tentang pengalaman sendiri'},
					{s: S(274), text: 'Mendengar tanpa mencelah'},
					{s: S(274) + 2.4, text: 'Tidak melabel mana-mana kaum'},
				]}
				footer="Sejajar dengan cadangan Tugasan 2"
				footerS={S(275)}
			/>
		)}
	</Win>
);

/** A: dengan grafik sosiogram ringkas */
export const StratA: React.FC = () => (
	<Win s={S(277)} e={S(287) - 0.3}>
		{(t, v) => (
			<StrategyPanel
				t={t}
				v={v}
				letter="A"
				title="Akauntabiliti & kolaborasi komuniti"
				items={[
					{
						s: S(279),
						text: 'Sosiogram setiap semester',
						sub: (
							<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
								<Sociogram p={rise(t, S(280), 1.5)} />
								<span style={{opacity: rise(t, S(281))}}>Tanpa nama, disimpan sulit</span>
							</div>
						),
					},
					{s: S(282), text: 'Penilaian sahsiah yang telus', sub: 'Tingkah laku yang boleh diperhatikan, bukan andaian budaya'},
					{s: S(284), text: 'Libatkan ibu bapa & komuniti', sub: 'Hari Keluarga Berbilang Budaya bersama PIBG', subS: S(285)},
				]}
				footer="Perpaduan perlu diukur, bukan sekadar diraikan"
				footerS={S(278)}
			/>
		)}
	</Win>
);

const Sociogram: React.FC<{p: number}> = ({p}) => {
	const nodes = [
		[20, 20],
		[70, 12],
		[110, 40],
		[60, 60],
		[16, 70],
		[130, 78],
	];
	const edges = [
		[0, 1],
		[1, 2],
		[0, 3],
		[3, 4],
		[2, 3],
	];
	return (
		<svg width={150} height={92}>
			{edges.map(([a, b], i) => (
				<line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={lerp(nodes[a][0], nodes[b][0], p)} y2={lerp(nodes[a][1], nodes[b][1], p)} stroke={C.gold} strokeWidth={2} />
			))}
			{nodes.map(([x, y], i) => (
				<circle key={i} cx={x} cy={y} r={8} fill={i === 5 ? C.red : C.white} opacity={i === 5 ? p : 1} />
			))}
		</svg>
	);
};

/** Pull-back Reveal + Chart Grow: pelan pelaksanaan */
export const Plan: React.FC = () => {
	const M: [number, string, string, React.ReactNode][] = [
		[S(288), '1–3 bulan', 'Jangka pendek', 'Audit bias · tempat duduk berputar · protokol SEMAK'],
		[S(291), '1 semester', 'Jangka sederhana', 'Projek RIMUP 10 minggu · sosiogram awal setiap kelas'],
		[S(294), 'Jangka panjang', 'Latihan perguruan', 'Modul pedagogi responsif budaya & perbandingan konsep insan di IPG'],
	];
	return (
		<Win s={S(287) + 0.3} e={1151.6} d={0.7}>
			{(t, v) => {
				const grow = Math.max(rise(t, S(288), 2.5) * 0.34, rise(t, S(291), 2.5) * 0.67, rise(t, S(294), 2.5));
				return (
					<div style={{position: 'absolute', left: 70, top: 170, width: 900, opacity: v}}>
						<Eyebrow>Pelan pelaksanaan</Eyebrow>
						<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 44, color: C.white, marginTop: 8}}>Bagaimana kerangka ini dilaksanakan?</div>
						<div style={{position: 'relative', height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.12)', marginTop: 30}}>
							<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${grow * 100}%`, borderRadius: 7, background: `linear-gradient(90deg, #5B8DB8, ${C.gold})`}} />
						</div>
						<div style={{display: 'flex', gap: 16, marginTop: 22}}>
							{M.map(([s, when, kind, what], i) => {
								const p = rise(t, s, 0.6);
								return (
									// kad belum tiba tetap memegang ruang supaya susun atur stabil
									<Glass key={when} style={{flex: 1, padding: '20px 22px', opacity: p, transform: `translateY(${lerp(30, 0, p)}px)`, border: i === 2 ? `1.5px solid ${C.gold}` : `1px solid ${C.glassLine}`}}>
										<div style={{fontSize: 18, fontWeight: 700, letterSpacing: '0.1em', color: C.gold}}>{kind.toUpperCase()}</div>
										<div style={{fontSize: 38, fontWeight: 800, marginTop: 6}}>{when}</div>
										<div style={{fontSize: 25, color: C.soft, marginTop: 10, lineHeight: 1.3}}>{what}</div>
										{i === 0 ? (
											<div style={{marginTop: 12, display: 'inline-block', padding: '6px 14px', borderRadius: 20, background: C.gold, color: C.navy, fontWeight: 800, fontSize: 19, opacity: rise(t, 1122.9 + 1.2)}}>
												Tanpa kos
											</div>
										) : null}
									</Glass>
								);
							})}
						</div>
					</div>
				);
			}}
		</Win>
	);
};

/** Petunjuk kejayaan (arah sahaja, tiada angka baharu) */
export const Indicators: React.FC = () => {
	const R: [number, string, string][] = [
		[S(298), 'up', 'Murid yang mempunyai rakan rapat daripada etnik lain'],
		[S(299), 'down', 'Insiden buli berunsur kaum'],
		[S(300), 'up', 'Maklum balas murid tentang rasa diterima'],
	];
	return (
		<Win s={S(297)} e={S(301) - 0.3}>
			{(t, v) => (
				<div style={{position: 'absolute', left: 70, top: 160, width: 640, opacity: v}}>
					<Eyebrow>Petunjuk kejayaan</Eyebrow>
					<div style={{display: 'flex', flexDirection: 'column', gap: 14, marginTop: 18}}>
						{R.map(([s, dir, txt]) => {
							const p = rise(t, s, 0.8);
							return (
								<Glass key={txt} style={{padding: '18px 22px', display: 'flex', gap: 18, alignItems: 'center', opacity: p}}>
									<div style={{width: 58, height: 58, borderRadius: 14, background: dir === 'up' ? 'rgba(245,196,67,0.18)' : 'rgba(224,102,74,0.2)', display: 'grid', placeItems: 'center', transform: `translateY(${(dir === 'up' ? 1 : -1) * lerp(14, 0, p)}px)`}}>
										<Icon name={dir} size={36} color={dir === 'up' ? C.gold : C.red} />
									</div>
									<div style={{fontSize: 26, fontWeight: 700, lineHeight: 1.25}}>
										{txt} <b style={{color: dir === 'up' ? C.gold : C.red}}>{dir === 'up' ? 'meningkat' : 'menurun'}</b>
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

export const Ethics: React.FC = () => {
	const R: [number, string, string][] = [
		[1175.3, 'heart', 'Menghormati kepercayaan'],
		[1178.6, 'hand', 'Penyertaan secara sukarela'],
		[1183.2, 'lock', 'Perlindungan privasi murid'],
	];
	return (
		<Win s={S(301)} e={S(305) - 0.2}>
			{(t, v) => (
				<div style={{position: 'absolute', left: 70, top: 200, width: 640, opacity: v}}>
					<Eyebrow>Tiga prinsip etika</Eyebrow>
					<div style={{display: 'flex', gap: 14, marginTop: 18}}>
						{R.map(([s, ic, txt]) => {
							const p = rise(t, s, 0.6);
							return (
								<Glass key={txt} style={{flex: 1, padding: '24px 16px', textAlign: 'center', opacity: lerp(0.15, 1, p), transform: `scale(${lerp(0.85, 1, p)})`}}>
									<div style={{display: 'flex', justifyContent: 'center'}}>
										<Icon name={ic} size={52} />
									</div>
									<div style={{fontSize: 24, fontWeight: 700, marginTop: 12, lineHeight: 1.2}}>{txt}</div>
								</Glass>
							);
						})}
					</div>
				</div>
			)}
		</Win>
	);
};

export const Experience: React.FC = () => (
	<Win s={S(305)} e={1194.9}>
		{(t, v) => (
			<Glass style={{position: 'absolute', left: 70, top: 260, width: 640, padding: '30px 34px', opacity: v}}>
				<div style={{fontSize: 26, color: C.soft}}>Bukan sekadar mengajar tentang perpaduan,</div>
				<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 46, lineHeight: 1.15, marginTop: 10, opacity: rise(t, S(306)), maxHeight: 220 * rise(t, S(306) - 0.3, 0.4), overflow: 'hidden'}}>
					tetapi <span style={{color: C.gold}}>membentuk pengalaman</span> yang melahirkannya.
				</div>
			</Glass>
		)}
	</Win>
);
