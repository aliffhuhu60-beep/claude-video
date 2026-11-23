// Pratonton bingkai pegun: node stills.mjs <saat> [saat...]
// Bundle sekali; fail public (base.mp4, suno.mp4) dipaut keras, tidak disalin.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

export const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
export async function makeBundle(dir) {
	fs.rmSync(dir, {recursive: true, force: true});
	fs.mkdirSync('.public-empty', {recursive: true});
	await bundle({entryPoint: path.resolve('src/index.ts'), outDir: dir, publicDir: path.resolve('.public-empty')});
	fs.mkdirSync(path.join(dir, 'public'), {recursive: true});
	for (const f of ['base.mp4', 'suno.mp4']) fs.linkSync(path.resolve('public', f), path.join(dir, 'public', f));
	return dir;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	const serveUrl = await makeBundle(path.resolve('.bundle'));
	const composition = await selectComposition({serveUrl, id: 'Podcast', browserExecutable: BROWSER});
	fs.mkdirSync('out', {recursive: true});
	for (const t of process.argv.slice(2).map(Number)) {
		await renderStill({
			serveUrl, composition, frame: Math.round(t * 30), output: `out/still_${String(t).replace('.', '_')}.jpg`,
			imageFormat: 'jpeg', jpegQuality: 85, browserExecutable: BROWSER, chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 600000,
		});
		console.log('ok', t);
	}
}
