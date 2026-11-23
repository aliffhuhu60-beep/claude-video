import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import {TL} from './timeline';
import {Promo, PROMO_FRAMES} from './promo/Promo';

export const Root: React.FC = () => (
	<>
		<Composition id="Podcast" component={Main} durationInFrames={TL.total} fps={TL.fps} width={1920} height={1080} />
		<Composition id="Promo" component={Promo} durationInFrames={PROMO_FRAMES} fps={30} width={1920} height={1080} />
	</>
);
