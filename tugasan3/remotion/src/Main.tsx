import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/fraunces/500.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/fraunces/800.css';
import '@fontsource/fraunces/500-italic.css';
import '@fontsource/fraunces/600-italic.css';
import {Backdrop, Presenter} from './Presenter';
import {Subtitles} from './Subtitles';
import {CoverOpening, NameCard, Thanks} from './scenes/Opening';
import {FPK, IssueTitle, KeyQuestion, OrbitMap, T2Title, TopicLink, Traditions} from './scenes/Intro';
import {Diversity, FurnivallBook, FurnivallQuote, HeadlineWall, IPNasChart, Layers, ShamsulQuote, SuffianQuote, YouthStat} from './scenes/Analysis1';
import {
	AllportOrbit,
	Bubble,
	Chong,
	CriticalRead,
	Enrolment,
	Hujurat,
	InsanConcepts,
	MixFrame,
	Narrative,
	NotEnough,
	Pettigrew,
	PhoneMockup,
	Triangulation,
} from './scenes/Analysis2';
import {BinaBreak, BinaChecklist, DialogCircle, Ethics, Experience, Indicators, Plan, StratA, StratB, StratI, StratN} from './scenes/Solutions';
import {CoverStand, SummaryChips} from './scenes/Closing';
import {IntroScene, OutroScene} from './scenes/Bookends';
import {INTRO_F, SPEECH_FRAMES, rise, useT} from './lib';

const Fade: React.FC = () => {
	const t = useT();
	const o = 1 - rise(t, 0, 0.8);
	return o > 0 ? <AbsoluteFill style={{background: '#000', opacity: o}} /> : null;
};

/** Syarahan (garis masa ucapan); bingkai bermula 0 pada awal ucapan. */
const Speech: React.FC = () => {
	return (
		<AbsoluteFill style={{background: '#0A1B2E'}}>
			<Backdrop />
			<Presenter />
			{/* Pembukaan */}
			<NameCard />
			<CoverOpening />
			<Thanks />
			{/* Pengenalan & hubungan falsafah */}
			<OrbitMap />
			<T2Title />
			<Traditions />
			<FPK />
			<TopicLink />
			<IssueTitle />
			<KeyQuestion />
			{/* Analisis kritis */}
			<FurnivallBook />
			<FurnivallQuote />
			<Diversity />
			<ShamsulQuote />
			<Layers />
			<HeadlineWall />
			<IPNasChart />
			<YouthStat />
			<SuffianQuote />
			<PhoneMockup />
			<Enrolment />
			<Chong />
			<NotEnough />
			<AllportOrbit />
			<Pettigrew />
			<MixFrame />
			<Narrative />
			<CriticalRead />
			<Triangulation />
			<Hujurat />
			<InsanConcepts />
			<Bubble />
			{/* Cadangan penyelesaian */}
			<BinaBreak />
			<BinaChecklist />
			<StratB />
			<StratI />
			<StratN />
			<DialogCircle />
			<StratA />
			<Plan />
			<Indicators />
			<Ethics />
			<Experience />
			{/* Rumusan & penutup */}
			<SummaryChips />
			<CoverStand />
			<Subtitles />
			<Fade />
		</AbsoluteFill>
	);
};

export const Main: React.FC = () => (
	<AbsoluteFill style={{background: '#000'}}>
		<Sequence durationInFrames={INTRO_F}>
			<IntroScene />
		</Sequence>
		<Sequence from={INTRO_F}>
			<Speech />
		</Sequence>
		<Sequence from={INTRO_F + SPEECH_FRAMES}>
			<OutroScene />
		</Sequence>
	</AbsoluteFill>
);
