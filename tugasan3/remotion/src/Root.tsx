import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Main} from './Main';
import {FPS, REF_DUR, SPEECH_FRAMES} from './lib';

const Root: React.FC = () => (
	<Composition
		id="Syarahan"
		component={Main}
		durationInFrames={SPEECH_FRAMES + Math.round((REF_DUR + 0.5) * FPS)}
		fps={FPS}
		width={1920}
		height={1080}
	/>
);

registerRoot(Root);
