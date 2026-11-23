import data from './timeline.json';

/** Semua masa dalam BINGKAI (30 fps) pada garis masa output, dijana oleh build.py */
export type Seat = 'L' | 'C' | 'R';
export type Block =
	| {type: 'dialogue'; from: number; dur: number; base: number}
	| {type: 'chapter'; from: number; dur: number; n: string; title: string; base: number}
	| {type: 'ad'; from: number; dur: number}
	| {type: 'outro'; from: number; dur: number; base: number};
export type Shot = {from: number; dur: number; kind: 'wide' | 'medium' | 'close'; seat: Seat | null; push?: number};
export type Sub = {from: number; to: number; text: string; seat?: Seat};
export type LowerThird = {from: number; dur: number; seat: Seat; name: string; role: string};
export type Gfx = {from: number; dur: number; kind: string; data?: any};

export type Timeline = {
	fps: number;
	total: number;
	opening: {dur: number; bgFrom: number};
	blocks: Block[];
	shots: Shot[];
	subs: Sub[];
	lowerThirds: LowerThird[];
	gfx: Gfx[];
	faces: Record<Seat, {x: number; y: number}>;
};

export const TL = data as unknown as Timeline;
