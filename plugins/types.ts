import { Megalo } from '../src/Megalo.ts';

export type Plugin = (
	instance: Megalo,
) => void | Promise<void>;
