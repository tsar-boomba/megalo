const listenProc = Deno.run({
	cmd: ['deno', 'run', '-A', 'example.ts']
});
const ohaListenProc = Deno.run({
	cmd: ['oha', '-z', '10s', '--no-tui', Deno.args[0]]
});

await ohaListenProc.status().then(() => listenProc.close());

const serveProc = Deno.run({
	cmd: ['deno', 'run', '-A', '--unstable', 'example.ts', '--serve'],
});
const ohaServeProc = Deno.run({
	cmd: ['oha', '-z', '10s', '--no-tui', Deno.args[0]],
});

ohaServeProc.status().then(() => serveProc.close());
