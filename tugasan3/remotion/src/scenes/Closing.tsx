import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, Eyebrow, F, Glass, REF_DUR, S, TOTAL, Win, lerp, rise} from '../lib';

/** Kata kunci rumusan secara minimal, satu demi satu */
export const SummaryChips: React.FC = () => {
	const K: [number, number, React.ReactNode][] = [
		[S(309), S(310) + 1.5, <>Insan berkembang melalui <b style={{color: C.gold}}>hubungan</b></>],
		[S(311), S(312) - 0.2, <>Hidup berdampingan <b style={{color: C.gold}}>≠ bersatu</b></>],
		[S(313), S(316) - 0.2, <>Semakin baik, <b style={{color: C.gold}}>tetapi masih cetek</b></>],
		[S(317), S(320), <>Angka sahaja <b style={{color: C.gold}}>tidak mencukupi</b></>],
		[S(322), S(323) - 0.3, <>Interaksi bermakna melalui <b style={{color: C.gold}}>kerangka BINA</b></>],
	];
	return (
		<>
			{K.map(([s, e, node], i) => (
				<Win key={i} s={s} e={e}>
					{(t, v) => (
						<Glass style={{position: 'absolute', left: 80, top: 640, padding: '18px 26px', fontSize: 32, fontWeight: 700, opacity: v, transform: `translateY(${lerp(20, 0, v)}px)`}}>
							{node}
						</Glass>
					)}
				</Win>
			))}
			<Win s={S(307)} e={S(307) + 5}>
				{(t, v) => <Eyebrow style={{position: 'absolute', left: 80, top: 70, opacity: v}}>Rumusan</Eyebrow>}
			</Win>
		</>
	);
};

/** Cover Story: ayat pendirian akhir */
export const CoverStand: React.FC = () => (
	<Win s={S(323)} e={S(330) - 0.2} d={0.8}>
		{(t, v) => (
			<div style={{position: 'absolute', inset: 0, opacity: v}}>
				<div style={{position: 'absolute', inset: 34, border: `2px solid ${C.gold}`, borderRadius: 6, opacity: 0.85}} />
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6,16,30,0.85) 0%, rgba(6,16,30,0.55) 30%, rgba(6,16,30,0) 47%)'}} />
				<Eyebrow style={{position: 'absolute', left: 80, top: 70}}>Pendirian saya</Eyebrow>
				<div style={{position: 'absolute', left: 80, top: 160, width: 660, fontFamily: F.serif, color: C.white}}>
					<div style={{fontWeight: 700, fontSize: 58, lineHeight: 1.1, opacity: rise(t, 1258.4, 0.7), transform: `translateY(${lerp(24, 0, rise(t, 1258.4, 0.7))}px)`}}>
						Perpaduan tidak lahir daripada duduk sebumbung,
					</div>
					<div style={{fontWeight: 700, fontSize: 58, lineHeight: 1.1, marginTop: 14, color: C.gold, opacity: rise(t, 1262.3, 0.7), transform: `translateY(${lerp(24, 0, rise(t, 1262.3, 0.7))}px)`}}>
						tetapi daripada belajar, bekerja dan berdialog bersama.
					</div>
					<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 30, marginTop: 30, opacity: rise(t, 1268.8), borderLeft: `4px solid ${C.gold}`, paddingLeft: 18}}>
						Guru ialah arkitek pertemuan itu.
					</div>
				</div>
			</div>
		)}
	</Win>
);

// Senarai rujukan, disalin tepat daripada senarai rujukan bahan tugasan
const REFS: string[] = [
	'Al-Quran. (t.t.). Surah al-Hujurat, 49:13.',
	'Allport, G. W. (1954). The nature of prejudice. Addison-Wesley.',
	'Aronson, E., & Patnoe, S. (2011). Cooperation in the classroom: The jigsaw method (3rd ed.). Pinter & Martin.',
	'Berita RTM. (2026, Januari). RPN 2026–2035: Lonjakan besar sistem pendidikan negara. https://berita.rtm.gov.my/nasional/senarai-berita-nasional/senarai-artikel/rpn-2026-2035-lonjakan-besar-sistem-pendidikan-negara/',
	'Bernama. (t.t.). [Laporan Indeks Perpaduan Nasional: skor 2018 dan 2022 serta julat tahap perpaduan]. https://www.bernama.com/en/general/news.php?id=2403697',
	'Chadha, M. (2022). Personhood in classical Indian philosophy. Dalam E. N. Zalta & U. Nodelman (Ed.), The Stanford encyclopedia of philosophy. Stanford University. https://plato.stanford.edu/entries/personhood-india/',
	'Chong, H. (2024, September 11). How do Malaysian university students form social ties? Institute of Strategic and International Studies (ISIS) Malaysia. https://www.isis.org.my/2024/09/11/how-do-malaysian-university-students-form-social-ties/',
	'Chu, I., & Vu, M. C. (2022). The nature of the self, self-regulation and moral action: Implications from the Confucian relational self and Buddhist non-self. Journal of Business Ethics, 180(1), 245–262. https://doi.org/10.1007/s10551-021-04826-z',
	'Free Malaysia Today. (2026a, Februari 24). Kedah scores lowest in 2025 National Unity Index. https://www.freemalaysiatoday.com/category/nation/2026/02/24/kedah-scores-lowest-in-2025-national-unity-index',
	'Free Malaysia Today. (2026b, Mei 9). Close to 400 3R-related items taken down in first 4 months. https://www.freemalaysiatoday.com/category/nation/2026/05/09/close-to-400-3r-related-items-taken-down-in-first-4-months',
	"Fulcrum. (2024). Beneath polarisation, Malaysia's youth have common yearnings for fairness. ISEAS–Yusof Ishak Institute. https://fulcrum.sg/beneath-polarisation-malaysias-youth-have-common-yearnings-for-fairness/",
	'Furnivall, J. S. (1948). Colonial policy and practice: A comparative study of Burma and Netherlands India. Cambridge University Press.',
	'Gay, G. (2018). Culturally responsive teaching: Theory, research, and practice (3rd ed.). Teachers College Press.',
	'Hussien, H. H., & Abdullah, M. S. (2018). Keberkesanan Rancangan Integrasi Murid untuk Perpaduan (RIMUP) dalam memupuk kesepaduan sosial. MANU: Jurnal Pusat Penataran Ilmu dan Bahasa, 28, 33–50. https://doi.org/10.51200/manu.v28i.1581',
	'Lee, J.-Y. (2023). Relational approaches to personal autonomy. Philosophy Compass, 18(5), Artikel e12916. https://doi.org/10.1111/phc3.12916',
	'Malay Mail. (2024, September 6). Merdeka Center youth survey: Indians report discrimination, Malays show low trust in own community. https://www.malaymail.com/news/malaysia/2024/09/06/merdeka-center-youth-survey-indians-report-discrimination-malays-show-low-trust-in-own-community/149477',
	'Moore, T. (2026). The Confucian conception of self: Collectivist or relational? Asian Studies, 14(1), 89–102. https://doi.org/10.4312/as.2026.14.1.89-102',
	'Pettigrew, T. F., & Tropp, L. R. (2006). A meta-analytic test of intergroup contact theory. Journal of Personality and Social Psychology, 90(5), 751–783. https://doi.org/10.1037/0022-3514.90.5.751',
	'Rosli, S., Mahmud, S. F., & Azni, M. E. (2022). Mengintegrasi Falsafah Pendidikan Kebangsaan (FPK) dalam membangunkan modal insan bersepadu. Jurnal Dunia Pendidikan, 4(1), 86–103. https://myjms.mohe.gov.my/index.php/jdpd/article/view/17461',
	'Salleh, M. J. (2022). Falsafah Pendidikan Kebangsaan paradigma J.E.R.I.S.A.H. membina insan sejahtera bertaqwa: Perspektif kepimpinan pendidikan dan guru-guru. Jurnal Dunia Pendidikan, 4(1), 197–215. https://doi.org/10.55057/jdpd.2022.4.1.15',
	'Shamsul Amri Baharuddin. (Ed.). (2012). Modul hubungan etnik (Ed. ke-2). Institut Kajian Etnik, Universiti Kebangsaan Malaysia.',
	'The Borneo Post. (2026, Jun 28). IPNas 2025 study shows Malaysians are more united. https://www.theborneopost.com/2026/06/28/ipnas-2025-study-shows-malaysians-are-more-united/',
	'Utusan Malaysia. (2024, Julai). PARLIMEN: Kemasukan murid bukan bumiputera ke SK menurun dalam 10 tahun. https://www.utusan.com.my/nasional/2024/07/parlimen-kemasukan-murid-bukan-bumiputera-ke-sk-menurun-dalam-10-tahun/',
	'Wahid, A., & Firdaus, H. I. (2022). Hakikat manusia dalam Al-Qur’an: Kajian tafsir tematik. Jurnal Kewarganegaraan, 6(2), 4705–4716. https://journal.upy.ac.id/index.php/pkn/article/download/4010/pdf/9855',
];

const PAGES = [REFS.slice(0, 8), REFS.slice(8, 16), REFS.slice(16)];

/** Rujukan: Paper Cut editorial, tiga halaman */
export const References: React.FC = () => {
	const per = REF_DUR / PAGES.length;
	return (
		<>
			{PAGES.map((items, k) => {
				const s = TOTAL + 0.3 + k * per;
				const e = s + per - 0.1;
				return (
					<Win key={k} s={s} e={e} d={0.6}>
						{(t, v) => (
							<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
								<div
									style={{
										width: 1640,
										background: C.paper,
										color: C.ink,
										padding: '50px 64px',
										borderRadius: 4,
										opacity: v,
										boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
										transform: `translateX(${lerp(120, 0, rise(t, s, 0.6)) - lerp(0, 120, rise(t, e - 0.6, 0.6))}px) rotate(${k % 2 ? 0.6 : -0.6}deg)`,
									}}
								>
									<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
										<div style={{fontFamily: F.serif, fontWeight: 700, fontSize: 52}}>Rujukan</div>
										<div style={{fontFamily: F.sans, fontWeight: 700, fontSize: 20, color: C.red, letterSpacing: '0.1em'}}>
											{k + 1} / {PAGES.length}
										</div>
									</div>
									<div style={{height: 2, background: C.ink, opacity: 0.15, margin: '16px 0 22px'}} />
									<div style={{display: 'flex', flexDirection: 'column', gap: 13}}>
										{items.map((r) => (
											<div key={r} style={{fontFamily: F.sans, fontSize: 22, lineHeight: 1.32, paddingLeft: 36, textIndent: -36, overflowWrap: 'anywhere'}}>
												{r}
											</div>
										))}
									</div>
								</div>
							</AbsoluteFill>
						)}
					</Win>
				);
			})}
		</>
	);
};
