import { Schema, Field, refOf } from './openapi/mod.ts'; // https://deno.land/x/megalo/openapi/mod.ts
import { swaggerUI } from './plugins/swaggerUI.ts'; // https://deno.land/x/megalo/plugins/swaggerUI.ts
import { Megalo } from './mod.ts'; // https://deno.land/x/megalo/mod.ts

@Schema()
class User {
	@Field({ type: 'string' })
	username!: string;
	@Field({ type: 'integer', format: 'int32' })
	age!: number;
}

const megalo = new Megalo({
	openapi: {
		info: {
			title: 'Megalo API',
			version: '1.0.0',
			description: 'A Megalo API using OpenAPI.',
		},
	},
	plugins: [swaggerUI({ path: '/swagger' })],
});

megalo
	.get(
		'/users',
		{
			openapi: {
				summary: 'Get all users',
				responses: {
					'200': {
						description: 'Successfully got all users.',
					},
				},
			},
		},
		(_req, res) => res.json({ username: 'ibomb', age: 17 } as User)
	)
	.get(
		'/users/:id',
		{
			openapi: {
				summary: 'Get user with specified id.',
				responses: {
					'200': {
						description: 'Successfully found user.',
					},
					'404': {
						description: 'Could not find user with provided id.',
					},
				},
				parameters: [
					{
						in: 'path',
						name: 'id',
						required: true,
						description: 'Id of desired user.',
					},
				],
			},
		},
		(_req, res) => res.json({ username: 'ibomb', age: 17 } as User)
	)
	.post(
		'/users',
		{
			openapi: {
				summary: 'Add a user',
				responses: {
					'200': {
						description: 'Successfully added user',
					},
				},
				requestBody: {
					content: {
						'application/json': {
							schema: refOf(User),
						},
					},
				},
			},
		},
		(_req, res) => res.status(200)
	);

megalo.listen({ port: 3000, hostname: '127.0.0.1' });
