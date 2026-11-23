import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C, Grain, rise} from './theme';
import {TL} from './timeline';
import {Footage} from './Footage';
import {Opening} from './Opening';
import {AdBreak, ChapterCards, LowerThirds, Outro, Subtitles} from './Overlays';
import {Graphics} from './Graphics';

/** Latar belakang editorial (kelihatan apabila rakaman mengecil ke split screen) */
const Stage: React.FC = () => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at 75% 40%, rgba(166,77,98,0.35), transparent 60%), linear-gradient(135deg, ${C.burgundy} 0%, ${C.charcoal} 70%)`,
		}}
	/>
);

/** Kilatan/kabur pendek pada setiap peralihan blok (light sweep + motion blur ringan) */
const BlockFlash: React.FC = () => {
	const f = useCurrentFrame();
	const b = TL.blocks.find((x) => x.type === 'dialogue' && f >= x.from && f < x.from + 10 && x.from > TL.opening.dur);
	if (!b) return null;
	const g = f - b.from;
	const a = 1 - rise(g, 0, 10);
	return <AbsoluteFill style={{background: C.cream, opacity: 0.18 * a, pointerEvents: 'none'}} />;
};

export const Main: React.FC = () => {
	const O = TL.opening.dur;
	return (
		<AbsoluteFill style={{background: C.charcoal}}>
			<Stage />
			<Sequence from={O} layout="none">
				<AbsoluteFill />
			</Sequence>
			<Footage />
			<Graphics />
			<LowerThirds />
			<Subtitles />
			<ChapterCards />
			<AdBreak />
			<Outro />
			<BlockFlash />
			<Grain opacity={0.035} />
			<Sequence from={0} durationInFrames={O}>
				<Opening />
			</Sequence>
		</AbsoluteFill>
	);
};
