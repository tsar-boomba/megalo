// POST, PUT, and PATCH panic deno
Deno.serve((req) => {
	console.log(req.method);
	return new Response('Not get method', { status: 200 });
});
