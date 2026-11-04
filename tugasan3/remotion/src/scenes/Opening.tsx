import React from 'react';
import {C, E, Eyebrow, F, Glass, Icon, S, Source, Win, lerp, rise} from '../lib';

/** Kad nama ringkas */
export const NameCard: React.FC = () => (
	<Win s={S(2)} e={S(2) + 6.5}>
		{(t, v) => (
			<div style={{position: 'absolute', left: 80, top: 690, opacity: v, transform: `translateX(${lerp(-40, 0, v)}px)`}}>
				<div style={{display: 'flex', alignItems: 'stretch'}}>
					<div style={{width: 8, background: C.gold, borderRadius: 4}} />
					<div style={{background: 'rgba(9,24,42,0.82)', padding: '14px 26px', borderRadius: '0 12px 12px 0'}}>
						<div style={{fontFamily: F.sans, fontWeight: 800, fontSize: 38, color: C.white}}>
							Mohamad Aliff bin Ahmad Shahabuddin
						</div>
						<div style={{fontFamily: F.sans, fontWeight: 500, fontSize: 23, color: C.soft, marginTop: 4}}>
							Bahasa Melayu Kumpulan 1 · Ambilan Ogos 2025 · IPG Kampus Tun Hussein Onn
						</div>
					</div>
				</div>
			</div>
		)}
	</Win>
);

/** Cover Story: tajuk syarahan seperti kulit majalah, wajah kekal penuh */
export const CoverOpening: React.FC = () => (
	<Win s={S(4)} e={S(10) - 0.3} d={0.7}>
		{(t, v) => {
			const words = ['Daripada', 'Konsep', 'Insan', 'kepada', 'Bilik', 'Darjah', 'Inklusif'];
			return (
				<div style={{position: 'absolute', inset: 0, opacity: v}}>
					{/* bingkai emas nipis */}
					<div style={{position: 'absolute', inset: 34, border: `2px solid ${C.gold}`, borderRadius: 6, opacity: 0.85}} />
					{/* bayang kiri untuk kebolehbacaan */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							background: 'linear-gradient(90deg, rgba(6,16,30,0.82) 0%, rgba(6,16,30,0.55) 30%, rgba(6,16,30,0) 46%)',
						}}
					/>
					<div style={{position: 'absolute', left: 80, top: 66, display: 'flex', gap: 18, alignItems: 'center'}}>
						<Eyebrow>MPU3152 · Falsafah dan Cabaran Masa Depan</Eyebrow>
					</div>
					<div style={{position: 'absolute', left: 80, top: 150, width: 640}}>
						<Eyebrow color={C.soft} style={{fontSize: 18, marginBottom: 18}}>
							Tugasan 3 · Video syarahan
						</Eyebrow>
						<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 76, lineHeight: 1.04, color: C.white}}>
							{words.map((w, i) => {
								const p = rise(t, S(6) + i * 0.22, 0.6);
								return (
									<span
										key={w}
										style={{
											display: 'inline-block',
											marginRight: 18,
											opacity: p,
											transform: `translateY(${lerp(30, 0, p)}px)`,
											color: i >= 4 ? C.gold : C.white,
										}}
									>
										{w}
									</span>
								);
							})}
						</div>
						<div
							style={{
								fontFamily: F.sans,
								fontWeight: 600,
								fontSize: 30,
								lineHeight: 1.3,
								color: C.white,
								marginTop: 26,
								opacity: rise(t, S(8)),
								borderLeft: `4px solid ${C.gold}`,
								paddingLeft: 18,
							}}
						>
							Merapatkan Jurang Interaksi Antara Etnik dalam Kalangan Murid
						</div>
						<div style={{fontFamily: F.sans, fontSize: 22, color: C.soft, marginTop: 22, opacity: rise(t, S(9))}}>
							Kesinambungan Tugasan 2: Konsep Insan dalam Pelbagai Tradisi Pemikiran
						</div>
					</div>
				</div>
			);
		}}
	</Win>
);

/** Penghargaan: senarai terapung, hanya yang disebut */
export const Thanks: React.FC = () => {
	const rows: [number, string, string, string][] = [
		[S(12), 'heart', 'Ke hadrat Ilahi', 'Dengan izin-Nya tugasan ini disiapkan'],
		[S(13), 'teacher', 'Puan Suzanna binti Zainudin', 'Pensyarah MPU3152: bimbingan dan tunjuk ajar'],
		[S(16), 'users', 'Rakan-rakan BM Kumpulan 1', 'Bantuan dan perkongsian idea'],
	];
	return (
		<Win s={S(11)} e={E(18)}>
			{(t, v) => (
				<Glass style={{position: 'absolute', left: 80, top: 170, width: 590, padding: '30px 34px', opacity: v}}>
					<Eyebrow>Penghargaan</Eyebrow>
					<div style={{display: 'flex', flexDirection: 'column', gap: 22, marginTop: 22}}>
						{rows.map(([s, ic, a, b]) => {
							const p = rise(t, s);
							return (
								<div key={a} style={{display: 'flex', gap: 18, alignItems: 'center', opacity: p, transform: `translateX(${lerp(-24, 0, p)}px)`}}>
									<div style={{width: 58, height: 58, borderRadius: 29, background: 'rgba(245,196,67,0.14)', display: 'grid', placeItems: 'center', flexShrink: 0}}>
										<Icon name={ic} size={32} />
									</div>
									<div>
										<div style={{fontSize: 30, fontWeight: 700}}>{a}</div>
										<div style={{fontSize: 21, color: C.soft, marginTop: 2}}>{b}</div>
									</div>
								</div>
							);
						})}
					</div>
				</Glass>
			)}
		</Win>
	);
};

// eksport untuk elak amaran
export const _unused = Source;
