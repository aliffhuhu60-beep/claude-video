// Render penuh (video sahaja; audio dicampur berasingan oleh audio/mix.py):
//   node render.mjs [mulaBingkai] [tamatBingkai]
import {renderMedia, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
import {makeBundle, BROWSER} from './stills.mjs';

const serveUrl = await makeBundle(path.resolve('.bundle'));
const composition = await selectComposition({serveUrl, id: process.env.COMP ?? 'Podcast', browserExecutable: BROWSER});
const a = process.argv[2] ? Number(process.argv[2]) : 0;
const b = process.argv[3] ? Number(process.argv[3]) : composition.durationInFrames - 1;
fs.mkdirSync('out', {recursive: true});
const out = process.argv[4] ?? 'out/video_noaudio.mp4';
let last = 0;
await renderMedia({
	serveUrl, composition, codec: 'h264', outputLocation: out, frameRange: [a, b], muted: true,
	crf: 18, x264Preset: 'medium', pixelFormat: 'yuv420p', imageFormat: 'jpeg', jpegQuality: 92,
	concurrency: 4, browserExecutable: BROWSER, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 600000,
	offthreadVideoCacheSizeInBytes: 1024 * 1024 * 1024,
	onProgress: ({progress, renderedFrames}) => {
		if (Date.now() - last > 30000) { last = Date.now(); console.log(`${(progress * 100).toFixed(1)}% ${renderedFrames} bingkai`); }
	},
});
console.log('siap', out);
