const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const listenProc = Deno.run({
	cmd: ['deno', 'run', '-A', 'example.ts'],
	stdout: 'null'
});
await wait(500);
const ohaListenProc = Deno.run({
	cmd: ['oha', '-z', '10s', '--no-tui', Deno.args[0]],
	stdout: 'inherit',
});

await ohaListenProc.status().then(() => listenProc.close());

const serveProc = Deno.run({
	cmd: ['deno', 'run', '-A', '--unstable', 'example.ts', '--serve'],
	stdout: 'null'
});
await wait(500);
const ohaServeProc = Deno.run({
	cmd: ['oha', '-z', '10s', '--no-tui', Deno.args[0]],
	stdout: 'inherit'
});

ohaServeProc.status().then(() => serveProc.close());
