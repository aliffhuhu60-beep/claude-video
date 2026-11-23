import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {C, clamp01, easeInOut, lerp, rise} from './theme';
import {Seat, Shot, TL} from './timeline';

/** Kamera digital (multicam daripada satu kamera): skala & posisi bagi setiap jenis syot. */
const KIND = {
	wide: {s: 1.0, sy: 540},
	medium: {s: 1.22, sy: 470},
	close: {s: 1.34, sy: 440},
};

type Cam = {s: number; cx: number; cy: number};

const camFor = (sh: Shot | undefined): Cam => {
	if (!sh || sh.kind === 'wide' || !sh.seat) return {s: 1.0, cx: 960, cy: 540};
	const k = KIND[sh.kind];
	const face = (sh as any).fx != null ? {x: (sh as any).fx, y: (sh as any).fy} : TL.faces[sh.seat as Seat];
	const s = k.s;
	// letak wajah sedikit ke arah ruang pandangan (rule of thirds)
	const sx = sh.seat === 'L' ? 900 : sh.seat === 'R' ? 1020 : 960;
	let cx = face.x - (sx - 960) / s;
	let cy = face.y - (k.sy - 540) / s;
	cx = Math.max(960 / s, Math.min(1920 - 960 / s, cx));
	cy = Math.max(540 / s, Math.min(1080 - 540 / s, cy));
	return {s, cx, cy};
};

const shotAt = (f: number) => {
	const arr = TL.shots;
	let lo = 0,
		hi = arr.length - 1,
		idx = -1;
	while (lo <= hi) {
		const m = (lo + hi) >> 1;
		if (arr[m].from <= f) {
			idx = m;
			lo = m + 1;
		} else hi = m - 1;
	}
	return idx;
};

/** Kamera semasa: potongan terus antara syot, atau zoom licin jika syot ada 'push' (bingkai). */
export const useCamera = (f: number): Cam => {
	const i = shotAt(f);
	if (i < 0) return {s: 1, cx: 960, cy: 540};
	const sh = TL.shots[i];
	const cur = camFor(sh);
	// hanyut perlahan (rasa kamera hidup) 0 → 1.8 %
	const drift = 1 + 0.018 * clamp01((f - sh.from) / Math.max(1, sh.dur));
	if (sh.push && i > 0) {
		const prev = camFor(TL.shots[i - 1]);
		const p = rise(f, sh.from, sh.push, easeInOut);
		return {s: lerp(prev.s, cur.s, p) * drift, cx: lerp(prev.cx, cur.cx, p), cy: lerp(prev.cy, cur.cy, p)};
	}
	return {s: cur.s * drift, cx: cur.cx, cy: cur.cy};
};

/** Susun atur skrin (split screen untuk kad akademik) */
export type Layout = {x: number; y: number; s: number; r: number};
const FULL: Layout = {x: 0, y: 0, s: 1, r: 0};
const LAYOUTS: Record<string, Layout> = {
	splitL: {x: -400, y: -20, s: 0.5, r: 36}, // rakaman di kiri, kad di kanan
	splitR: {x: 400, y: -20, s: 0.5, r: 36},
	splitWideL: {x: -330, y: -10, s: 0.6, r: 32},
};

export const useLayout = (f: number): Layout => {
	for (const g of TL.gfx) {
		const L = g.data?.layout as string | undefined;
		if (!L) continue;
		const s = g.from,
			e = g.from + g.dur;
		if (f >= s - 1 && f <= e + 1) {
			const p = Math.min(rise(f, s, 20, easeInOut), 1 - rise(f, e - 18, 18, easeInOut));
			const T = LAYOUTS[L];
			return {x: lerp(0, T.x, p), y: lerp(0, T.y, p), s: lerp(1, T.s, p), r: lerp(0, T.r, p)};
		}
	}
	return FULL;
};

const Clip: React.FC<{base: number; dur: number}> = ({base, dur}) => (
	<OffthreadVideo src={staticFile('base.mp4')} startFrom={base} endAt={base + dur + 2} muted style={{width: 1920, height: 1080}} />
);

/** Lapisan rakaman: semua blok yang ada video + kamera + susun atur */
export const Footage: React.FC = () => {
	const f = useCurrentFrame();
	const cam = useCamera(f);
	const lay = useLayout(f);
	const tx = 960 - cam.cx;
	const ty = 540 - cam.cy;
	return (
		<AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 1920,
					height: 1080,
					overflow: 'hidden',
					transform: `translate(${lay.x}px, ${lay.y}px) scale(${lay.s})`,
					borderRadius: lay.r / Math.max(lay.s, 0.01),
					boxShadow: lay.s < 0.999 ? `0 30px 80px rgba(0,0,0,${0.45 * (1 - lay.s) * 2})` : undefined,
				}}
			>
				<div style={{position: 'absolute', inset: 0, transform: `scale(${cam.s}) translate(${tx}px, ${ty}px)`}}>
					{TL.blocks.map((b, i) =>
						b.type === 'dialogue' || b.type === 'outro' ? (
							<Sequence key={i} from={b.from} durationInFrames={b.dur} layout="none">
								<Clip base={b.base} dur={b.dur} />
							</Sequence>
						) : b.type === 'chapter' ? (
							// bingkai pertama bahagian seterusnya (hampir pegun) di bawah kad segmen
							<Sequence key={i} from={b.from} durationInFrames={b.dur} layout="none">
								<OffthreadVideo src={staticFile('base.mp4')} startFrom={b.base} playbackRate={0.05} muted style={{width: 1920, height: 1080}} />
							</Sequence>
						) : null,
					)}
				</div>
			</div>
		</AbsoluteFill>
	);
};
