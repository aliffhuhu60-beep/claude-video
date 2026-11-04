import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Main} from './Main';
import {FPS, INTRO_F, OUTRO_F, SPEECH_FRAMES} from './lib';

const Root: React.FC = () => (
	<Composition
		id="Syarahan"
		component={Main}
		durationInFrames={INTRO_F + SPEECH_FRAMES + OUTRO_F}
		fps={FPS}
		width={1920}
		height={1080}
	/>
);

registerRoot(Root);
