import { Plugin } from './types.ts';

export type SwaggerUIOptions = {
	/**
	 * Path for UI to be served on
	 */
	path: string;
};

export const swaggerUI = (swaggerUIOptions: SwaggerUIOptions): Plugin => {
	return (megalo) => {
		const spec = megalo.generateDocs();

		const html = `<! DOCTYPE html>
		<html>
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="description"
					content="SwaggerUI"
				/>
				<title>SwaggerUI</title>
				<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css" />
				<style>
					body {
						margin: 0
					}
				</style>
			</head>
			<body>
				<div id="root"></div>
				<script src="https://unpkg.com/swagger-ui-dist@4.14.2/swagger-ui-bundle.js" crossorigin></script>
				<script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js" crossorigin></script>
				<script>
					window.onload = () => {
						window.ui = SwaggerUIBundle({
							dom_id: '#root',
							spec: ${JSON.stringify(spec)},
							presets: [
          						SwaggerUIBundle.presets.apis,
          						SwaggerUIStandalonePreset
        					],
        					layout: "StandaloneLayout",
						});
					}
				</script>
			</body>
		</html>
		`;

		megalo.get(swaggerUIOptions.path, (_req, res) =>
			res.body(html, { headers: { 'Content-Type': 'text/html' } })
		);
	};
};
