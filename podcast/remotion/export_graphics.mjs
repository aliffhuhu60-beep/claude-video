// Eksport aset grafik utama sebagai PNG ke ../output/graphics/
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
import {makeBundle, BROWSER} from './stills.mjs';
const TL = JSON.parse(fs.readFileSync('src/timeline.json', 'utf8'));
const shots = [['01_opening_bicara_bahasa', 125], ['02_opening_rojak_atau_rancu', 215], ['03_opening_subtajuk', 285]];
const lt = TL.lowerThirds;
lt.forEach((x, i) => shots.push([`04_lower_third_${x.name.toLowerCase()}`, x.from + 45]));
TL.blocks.filter((b) => b.type === 'chapter').forEach((b, i) => shots.push([`05_kad_segmen_${i + 1}`, b.from + 60]));
const seen = {};
for (const g of TL.gfx) {
	seen[g.kind] = (seen[g.kind] ?? 0) + 1;
	const at = g.kind === 'example' || g.kind === 'illus' ? g.from + (g.data.fixAt ?? 0) + 60 : g.from + Math.min(g.dur - 20, 150);
	shots.push([`06_${g.kind}_${seen[g.kind]}`, at]);
}
const ad = TL.blocks.find((b) => b.type === 'ad');
shots.push(['07_iklan_lima_mit_lagi', ad.from + 150]);
const outro = TL.blocks.find((b) => b.type === 'outro');
shots.push(['08_outro_kredit', outro.from + 330]);
const serveUrl = await makeBundle(path.resolve('.bundle'));
const composition = await selectComposition({serveUrl, id: 'Podcast', browserExecutable: BROWSER});
const dir = path.resolve('../output/graphics');
fs.mkdirSync(dir, {recursive: true});
for (const [name, frame] of shots) {
	await renderStill({serveUrl, composition, frame, output: path.join(dir, name + '.png'), imageFormat: 'png', browserExecutable: BROWSER,
		chromiumOptions: {gl: 'swangle'}, timeoutInMilliseconds: 600000});
	console.log('ok', name, frame);
}
