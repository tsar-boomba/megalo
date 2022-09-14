const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const listenProc = Deno.run({
	cmd: ['deno', 'run', '-A', Deno.args[0]],
	stdout: 'null'
});
await wait(500);
const ohaListenProc = Deno.run({
	cmd: ['oha', '-z', '10s', '--no-tui', Deno.args[1]],
	stdout: 'inherit',
});

await ohaListenProc.status().then(() => listenProc.close());

const serveProc = Deno.run({
	cmd: ['deno', 'run', '-A', '--unstable', Deno.args[0], '--serve'],
	stdout: 'null',
});
await wait(500);
const ohaServeProc = Deno.run({
	cmd: ['oha', '-z', '10s', '--no-tui', Deno.args[1]],
	stdout: 'inherit'
});

ohaServeProc.status().then(() => serveProc.close());
