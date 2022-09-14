# Megalo
Deno HTTP server framework aiming for maximum speed

## Example
```ts
import { Megalo, Controller } from 'https://deno.land/x/megalo/mod.ts';

const megalo = new Megalo({
    // optionally add a notFoundHandler
    notFoundHandler: (req) =>
        new Response(`<html><body>${req.pathname} not found :(</body></html>`, {
            status: 404,
            headers: { ['Content-Type']: 'text/html' },
        }),
    // optionally add an errorHandler
    errorHandler: (err, req, httpErr) => {
        // if NotFoundError, etc. was thrown
        if (httpErr) return httpErr.toResponse();
        return new Response('Internal Server Error', { status: 500 })
    }
});

megalo
    // route all requests to '/'
    .addHook('preRoute', (req) => (req.pathname = '/'))
    .get('/', { parseQuery: false }, () => {
        return new Response('<html><body>hello megalo!</body></html>', {
            status: 200,
            headers: { ['Content-Type']: 'text/html' },
        });
    })
    .post('/', (req) => {
        return new Response('Secret handler', { status: 200 });
    })
    .get('/sus', () => {
        return new Response('<html><body>sus page</body></html>', {
            status: 200,
            headers: { ['Content-Type']: 'text/html' },
        });
    })
    .get(/^\/regex(\/.*)?$/, () => new Response(undefined, { status: 200 }))
    .get('/pattern/:id', ({ params }) => {
        return new Response(`<html><body>id: ${params.id}</body></html>`, {
            status: 200,
            headers: { ['Content-Type']: 'text/html' },
        });
    })
    .post('/posted', (req) => {
        return new Response('you posted it :)', { status: 200 });
    })
    .controller(new Controller('/users').get('/', () => new Response('user', { status: 200 })));

// log startup time
console.log(`Startup time: ${performance.now()}ms`);
megalo.listen({ port: 9000, hostname: '127.0.0.1' });
```

### Start Server
Use `--allow-hrtime` for more precise `performance.now()`
```bash
deno run --allow-net --allow-hrtime --unstable server.ts
```

## Route resolution

Routes are resolved in this order
- string literal ex. `"/sus"`
- controllers ex. `new Controller("/users")`
- patterns ex. `"/users/:id"`
- regex ex. `/^.*\/regex\/.*\/?$/`
- notFoundHandler

## Error Throwing

You can throw special exported errors to have the response status and body automatically set.
```ts
import { Megalo, InternalServerError } from 'https://deno.land/x/megalo/mod.ts';

const megalo = new Megalo();

megalo.get((req) => {
    throw new InternalServerError({ message: 'uh oh' });
    return new Response(undefined, { status: 200 });
});

megalo.listen({ port: 9000, hostname: '127.0.0.1' });
```

## Notes

Until https://github.com/denoland/deno/issues/15813 is resolved, in all POST, PUT, and PATCH routes you MUST await the body or else deno will panic. Also, do not use this in production as any POST, PUT, or PATCH request will crash the server, until this bug is fixed.
