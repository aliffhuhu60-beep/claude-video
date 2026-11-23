import React from 'react';

/** Enjin voxel isometrik ringkas (SVG). Unit dunia: 1 kiub. */
export const U = 46; // piksel bagi 1 unit
const CX = 0.866;

export const proj = (x: number, y: number, z: number): [number, number] => [(x - y) * U * CX, (x + y) * U * 0.5 - z * U];

const hex = (c: string) => {
	const n = parseInt(c.slice(1), 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
export const shade = (c: string, k: number) => {
	const [r, g, b] = hex(c);
	const f = (v: number) => Math.max(0, Math.min(255, Math.round(v * k)));
	return `rgb(${f(r)},${f(g)},${f(b)})`;
};

export type FacePix = {u: number; v: number; c: string}[]; // grid 8x8 pada muka +y
export type Box = {
	x: number;
	y: number;
	z: number;
	w: number;
	d: number;
	h: number;
	c: string; // warna asas
	top?: string; // warna atas khusus
	face?: FacePix; // piksel pada muka +y (muka hadapan watak)
	side?: FacePix; // piksel pada muka +x
	layer?: number; // lapisan lukis (0 = latar)
	o?: number; // kelegapan
};

const poly = (pts: [number, number][]) => pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

const pixQuads = (b: Box, pix: FacePix, plane: 'y' | 'x', key: string) =>
	pix.map((p, i) => {
		const u0 = p.u / 8,
			u1 = (p.u + 1) / 8,
			v0 = p.v / 8,
			v1 = (p.v + 1) / 8;
		const P = (u: number, v: number): [number, number] =>
			plane === 'y' ? proj(b.x + u * b.w, b.y + b.d, b.z + b.h - v * b.h) : proj(b.x + b.w, b.y + b.d - u * b.d, b.z + b.h - v * b.h);
		return <polygon key={key + 'p' + i} points={poly([P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)])} fill={p.c} />;
	});

export const BoxEl: React.FC<{b: Box; k: string}> = ({b, k}) => {
	const {x, y, z, w, d, h} = b;
	const top = poly([proj(x, y, z + h), proj(x + w, y, z + h), proj(x + w, y + d, z + h), proj(x, y + d, z + h)]);
	const rx = poly([proj(x + w, y, z), proj(x + w, y + d, z), proj(x + w, y + d, z + h), proj(x + w, y, z + h)]);
	const ly = poly([proj(x, y + d, z), proj(x + w, y + d, z), proj(x + w, y + d, z + h), proj(x, y + d, z + h)]);
	const st = {stroke: 'rgba(20,10,14,0.28)', strokeWidth: 1.2, strokeLinejoin: 'round' as const};
	return (
		<g opacity={b.o ?? 1}>
			<polygon points={top} fill={shade(b.top ?? b.c, 1.08)} {...st} />
			<polygon points={rx} fill={shade(b.c, 0.78)} {...st} />
			<polygon points={ly} fill={shade(b.c, 0.92)} {...st} />
			{b.face ? pixQuads(b, b.face, 'y', k) : null}
			{b.side ? pixQuads(b, b.side, 'x', k + 's') : null}
		</g>
	);
};

/** Lukis senarai kotak dengan susunan painter (jauh → dekat) */
export const Scene: React.FC<{boxes: Box[]}> = ({boxes}) => {
	const sorted = [...boxes].sort((a, b) => {
		const la = a.layer ?? 1,
			lb = b.layer ?? 1;
		if (la !== lb) return la - lb;
		return a.x + a.w / 2 + a.y + a.d / 2 + (a.z + a.h / 2) * 0.5 - (b.x + b.w / 2 + b.y + b.d / 2 + (b.z + b.h / 2) * 0.5);
	});
	return (
		<>
			{sorted.map((b, i) => (
				<BoxEl key={i} b={b} k={String(i)} />
			))}
		</>
	);
};

/** Rawak berketentuan */
export const rnd = (i: number) => {
	const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
	return s - Math.floor(s);
};

/* ------------------------------------------------------------- watak blok */
export type Look = {name: string; shirt: string; accent: string; hair: string; glasses?: boolean; pattern?: 'stripe' | 'batik' | 'plain'};
export const NAIM: Look = {name: 'NAIM', shirt: '#3A383F', accent: '#C2334A', hair: '#2A1B14', pattern: 'plain'};
export const FADLI: Look = {name: 'FADLI', shirt: '#7A1F2E', accent: '#F1E6D8', hair: '#1E140F', pattern: 'batik'};
export const ADAM: Look = {name: 'ADAM', shirt: '#1F1E23', accent: '#E9E4DC', hair: '#231812', glasses: true, pattern: 'stripe'};
const SKIN = '#C08A62';
const SKIN2 = '#A9734F';

const facePix = (L: Look, talk: number, blink: boolean, smile: boolean): FacePix => {
	const p: FacePix = [];
	for (let u = 0; u < 8; u++) {
		p.push({u, v: 0, c: L.hair});
		p.push({u, v: 1, c: u === 0 || u === 7 ? L.hair : u % 3 === 1 ? L.hair : SKIN});
	}
	// mata
	const ey = 3;
	for (const u of [2, 5]) {
		if (blink) p.push({u, v: ey, c: '#2B1A14'});
		else {
			p.push({u, v: ey, c: '#2B1A14'});
			p.push({u: u === 2 ? 1 : 6, v: ey, c: '#F4F1EA'});
		}
	}
	if (L.glasses) {
		for (const u of [1, 2, 5, 6]) p.push({u, v: 2, c: '#111'});
		p.push({u: 3, v: 3, c: '#111'});
		p.push({u: 4, v: 3, c: '#111'});
		p.push({u: 0, v: 3, c: '#111'});
		p.push({u: 7, v: 3, c: '#111'});
	}
	// hidung & mulut
	p.push({u: 3, v: 4, c: SKIN2});
	p.push({u: 4, v: 4, c: SKIN2});
	if (talk > 0.5) {
		p.push({u: 3, v: 6, c: '#5A1E22'});
		p.push({u: 4, v: 6, c: '#5A1E22'});
		p.push({u: 3, v: 5, c: '#3A1215'});
		p.push({u: 4, v: 5, c: '#3A1215'});
	} else if (smile) {
		p.push({u: 2, v: 5, c: '#5A1E22'});
		p.push({u: 5, v: 5, c: '#5A1E22'});
		p.push({u: 3, v: 6, c: '#5A1E22'});
		p.push({u: 4, v: 6, c: '#5A1E22'});
	} else {
		p.push({u: 3, v: 6, c: '#6B2A2A'});
		p.push({u: 4, v: 6, c: '#6B2A2A'});
	}
	return p;
};

const shirtPix = (L: Look): FacePix => {
	const p: FacePix = [];
	// kolar
	for (const u of [2, 3, 4, 5]) p.push({u, v: 0, c: L.accent});
	if (L.pattern === 'stripe') for (let v = 2; v < 8; v++) p.push({u: 1, v, c: L.accent}), p.push({u: 6, v, c: L.accent});
	if (L.pattern === 'batik')
		for (let k = 0; k < 10; k++) p.push({u: Math.floor(rnd(k + 3) * 8), v: 1 + Math.floor(rnd(k + 40) * 7), c: L.accent});
	if (L.pattern === 'plain') p.push({u: 3, v: 3, c: L.accent}), p.push({u: 4, v: 3, c: L.accent});
	return p;
};

/** Watak duduk; (x,y) = kedudukan tapak; menghadap +y */
export const character = (L: Look, x: number, y: number, f: number, opts: {talk?: boolean; wave?: boolean; bounce?: number; seed?: number} = {}): Box[] => {
	const seed = opts.seed ?? 0;
	const talk = opts.talk ? (Math.sin(f * 0.9 + seed) > 0 ? 1 : 0) : 0;
	const blink = (f + seed * 37) % 90 < 4;
	const bob = (opts.bounce ?? 0) * Math.abs(Math.sin(f * 0.25 + seed));
	const z0 = 0.95 + bob;
	const B: Box[] = [];
	// bangku
	B.push({x: x + 0.1, y: y - 0.1, z: 0, w: 1.0, d: 0.9, h: 0.95, c: '#E8E2D8'});
	// badan
	B.push({x, y, z: z0, w: 1.2, d: 0.7, h: 1.3, c: L.shirt, face: shirtPix(L)});
	// tangan
	const armUp = opts.wave ? Math.max(0, Math.sin(f * 0.35 + seed)) : 0;
	B.push({x: x - 0.4, y: y + 0.1, z: z0 + 0.2 + armUp * 0.9, w: 0.4, d: 0.5, h: 1.0, c: L.shirt, top: SKIN});
	B.push({x: x + 1.2, y: y + 0.1, z: z0 + 0.2, w: 0.4, d: 0.5, h: 1.0, c: L.shirt});
	// tangan (kulit) di atas meja
	B.push({x: x + 0.15, y: 3.95, z: 2.05, w: 0.35, d: 0.4, h: 0.22, c: SKIN});
	B.push({x: x + 0.75, y: 3.95, z: 2.05, w: 0.35, d: 0.4, h: 0.22, c: SKIN});
	// kepala
	B.push({
		x: x + 0.05,
		y: y - 0.2,
		z: z0 + 1.3,
		w: 1.1,
		d: 1.1,
		h: 1.1,
		c: SKIN,
		top: L.hair,
		face: facePix(L, talk, blink, !opts.talk),
		side: [0, 1, 2, 3, 4, 5, 6, 7].flatMap((u) => [{u, v: 0, c: L.hair}, ...(u > 3 ? [{u, v: 1, c: L.hair}, {u, v: 2, c: L.hair}] : [])]),
	});
	return B;
};

/* ------------------------------------------------------------- dunia beranda */
export const porch = (): Box[] => {
	const B: Box[] = [];
	// lantai jubin
	for (let i = 0; i < 12; i++)
		for (let j = 0; j < 9; j++) B.push({x: i, y: j, z: -0.4, w: 1, d: 1, h: 0.4, c: (i + j) % 2 ? '#CFC6BA' : '#BDB3A6', layer: 0});
	// dinding belakang (blok putih bertekstur) + tingkap
	for (let i = 0; i < 12; i++)
		for (let k = 0; k < 6; k++) {
			const win = i >= 7 && i <= 10 && k >= 2 && k <= 4;
			const frame = win && (i === 7 || i === 10 || k === 2 || k === 4);
			const c = win ? (frame ? '#F4F1EA' : (i + k) % 2 ? '#9CC3D5' : '#8AB4C9') : rnd(i * 13 + k) > 0.8 ? '#E4DFD6' : '#F0ECE4';
			B.push({x: i, y: -1, z: k, w: 1, d: 1, h: 1, c, layer: 0});
		}
	// dinding kiri
	for (let j = 0; j < 9; j++)
		for (let k = 0; k < 6; k++) B.push({x: -1, y: j, z: k, w: 1, d: 1, h: 1, c: rnd(j * 7 + k * 3) > 0.8 ? '#E2DCD2' : '#EEE9E1', layer: 0});
	// skuter merah (kiri)
	B.push({x: 0.3, y: 3.2, z: 0, w: 0.9, d: 2.6, h: 0.5, c: '#2A2628'});
	B.push({x: 0.25, y: 3.0, z: 0.5, w: 1.0, d: 2.2, h: 0.9, c: '#B8312F'});
	B.push({x: 0.35, y: 5.0, z: 0.5, w: 0.8, d: 0.6, h: 1.8, c: '#B8312F'});
	B.push({x: 0.2, y: 5.2, z: 2.2, w: 1.1, d: 0.3, h: 0.25, c: '#222'});
	// meja merah
	B.push({x: 3.2, y: 4.1, z: 0, w: 0.25, d: 0.25, h: 1.75, c: '#EDEAE4'});
	B.push({x: 8.4, y: 4.1, z: 0, w: 0.25, d: 0.25, h: 1.75, c: '#EDEAE4'});
	B.push({x: 3.2, y: 5.6, z: 0, w: 0.25, d: 0.25, h: 1.75, c: '#EDEAE4'});
	B.push({x: 8.4, y: 5.6, z: 0, w: 0.25, d: 0.25, h: 1.75, c: '#EDEAE4'});
	B.push({x: 2.9, y: 3.9, z: 1.75, w: 6.1, d: 2.2, h: 0.3, c: '#C9302C'});
	// telefon atas meja
	B.push({x: 4.6, y: 4.6, z: 2.05, w: 0.7, d: 0.4, h: 0.06, c: '#F2F0EC'});
	B.push({x: 6.9, y: 4.8, z: 2.05, w: 0.8, d: 0.4, h: 0.06, c: '#141416'});
	return B;
};
