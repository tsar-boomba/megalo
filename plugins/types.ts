import { RouteOwner } from '../src/RouteOwner.ts';
import { DefaultHooks } from '../src/types.ts';

export type Plugin<Hooks extends DefaultHooks> = (
	owner: RouteOwner<Hooks>,
) => void | Promise<void>;
