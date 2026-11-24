// Boot-check: start the MCP server, send an initialize request, read the reply.
import { spawn } from 'node:child_process';

const proc = spawn('node', ['server.js'], { cwd: process.cwd() });

let out = '';
proc.stdout.on('data', (d) => { out += d.toString(); });
proc.stderr.on('data', (d) => { process.stderr.write('[stderr] ' + d); });

const req = JSON.stringify({
  jsonrpc: '2.0', id: 1, method: 'initialize',
  params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'probe', version: '1.0' } },
}) + '\r\n';

proc.stdin.write(req);
setTimeout(() => {
  const lines = out.trim().split('\n').filter(Boolean);
  if (lines.length) {
    try {
      const parsed = JSON.parse(lines[lines.length - 1]);
      console.log('SERVER BOOT OK — serverInfo:', JSON.stringify(parsed.result?.serverInfo));
      process.exit(0);
    } catch (e) {
      console.log('SERVER OUTPUT (not JSON):', out.slice(0, 400));
      process.exit(1);
    }
  } else {
    console.log('NO SERVER OUTPUT');
    process.exit(1);
  }
}, 2500);
