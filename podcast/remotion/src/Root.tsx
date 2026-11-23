import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {TL} from './timeline';

export const Root: React.FC = () => (
	<Composition id="Podcast" component={Main} durationInFrames={TL.total} fps={TL.fps} width={1920} height={1080} />
);
