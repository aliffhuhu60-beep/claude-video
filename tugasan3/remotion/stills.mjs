import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

// Bundle sekali ke folder tetap dan guna semula (elak salin video asas 3 GB berulang kali).
// Set BUNDLE_DIR ke folder kosong anda sendiri; REBUILD=1 untuk bina semula.
const BUNDLE = process.env.BUNDLE_DIR;
if (!BUNDLE) throw new Error('Set BUNDLE_DIR');
const rebuild = process.env.REBUILD === '1' || !fs.existsSync(path.join(BUNDLE, 'index.html'));
if (rebuild) {
	fs.rmSync(BUNDLE, {recursive: true, force: true});
	await bundle({entryPoint: path.resolve('src/Root.tsx'), outDir: BUNDLE});
}
const serveUrl = BUNDLE;
const times = process.argv.slice(2).map(Number);
const browserExecutable =
	'/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const composition = await selectComposition({serveUrl, id: 'Syarahan', browserExecutable});
fs.mkdirSync('out', {recursive: true});
for (const t of times) {
	await renderStill({
		serveUrl,
		composition,
		frame: Math.round(t * 30),
		output: `out/still_${String(t).replace('.', '_')}.jpg`,
		imageFormat: 'jpeg',
		jpegQuality: 85,
		browserExecutable,
		chromiumOptions: {gl: 'swangle'},
		timeoutInMilliseconds: 900000,
	});
	console.log('ok', t);
}
