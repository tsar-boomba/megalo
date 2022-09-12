// POST, PUT, and PATCH panic deno
Deno.serve(async (req) => {
	console.log(req.method);
	await req.text();
	return new Response('Not get method', { status: 200 });
});
