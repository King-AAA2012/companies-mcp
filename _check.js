const fs = require('fs');
const path = require('path');
const dir = __dirname;
for (const pkg of ['election-mcp','holidays-mcp','rto-mcp','gst-mcp','companies-mcp','pan-mcp','pincode-mcp','irctc-mcp','upi-mcp']) {
  const p = path.join(dir, pkg, 'package.json');
  try {
    const j = JSON.parse(fs.readFileSync(p, 'utf8'));
    const srv = fs.existsSync(path.join(dir, pkg, 'server.js'));
    console.log(`${pkg}: ${j.name} v${j.version} server=${srv}`);
  } catch (e) {
    console.log(`${pkg}: ERROR ${e.message}`);
  }
}
