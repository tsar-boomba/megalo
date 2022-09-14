import { RouteOwner } from '../RouteOwner.ts';
import { DefaultHooks } from '../types.ts';

export type Plugin<Hooks extends DefaultHooks> = (
	owner: RouteOwner<Hooks>
) => void | Promise<void>;
