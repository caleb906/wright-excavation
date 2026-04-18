import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;
const ISSUES_FILE = path.join(__dirname, 'dev-issues.json');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
};

function resolveFilePath(urlPath) {
  const cleanPath = urlPath.split('?')[0].split('#')[0];
  if (cleanPath === '/' || cleanPath === '') return path.join(__dirname, 'index.html');
  const direct = path.join(__dirname, cleanPath);
  if (fs.existsSync(direct) && fs.statSync(direct).isFile()) return direct;
  if (path.extname(cleanPath) === '') {
    const withHtml = path.join(__dirname, cleanPath + '.html');
    if (fs.existsSync(withHtml)) return withHtml;
  }
  return direct;
}

function readIssues() {
  try { return JSON.parse(fs.readFileSync(ISSUES_FILE, 'utf8')); }
  catch { return []; }
}

function writeIssues(issues) {
  fs.writeFileSync(ISSUES_FILE, JSON.stringify(issues, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function json(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sh(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { cwd: __dirname, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({ err, stdout, stderr });
    });
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url;

  // ==== DEV API ====
  if (url === '/__dev/issues' && req.method === 'GET') {
    return json(res, 200, readIssues());
  }

  if (url === '/__dev/issues' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const issue = JSON.parse(body);
      const issues = readIssues();
      issues.push(issue);
      writeIssues(issues);
      return json(res, 200, { ok: true });
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  }

  if (url.startsWith('/__dev/issues/') && req.method === 'DELETE') {
    const id = decodeURIComponent(url.split('/').pop());
    const issues = readIssues().filter(i => i.id !== id);
    writeIssues(issues);
    return json(res, 200, { ok: true });
  }

  if (url === '/__dev/push' && req.method === 'POST') {
    try {
      const body = await readBody(req);
      const { message } = JSON.parse(body || '{}');
      const msg = (message || '').trim() || `Update ${new Date().toISOString().slice(0,16).replace('T', ' ')}`;
      const escaped = msg.replace(/"/g, '\\"');

      const addRes = await sh('git add -A');
      if (addRes.err) return json(res, 500, { error: 'git add failed: ' + addRes.stderr });

      const statusRes = await sh('git status --porcelain');
      const hasChanges = statusRes.stdout.trim().length > 0;

      if (hasChanges) {
        const commitRes = await sh(`git commit -m "${escaped}"`);
        if (commitRes.err && !commitRes.stdout.includes('nothing to commit')) {
          return json(res, 500, { error: 'git commit failed: ' + (commitRes.stderr || commitRes.stdout) });
        }
      }

      const pushRes = await sh('git push');
      if (pushRes.err) return json(res, 500, { error: 'git push failed: ' + pushRes.stderr });

      return json(res, 200, { ok: true, committed: hasChanges, message: msg });
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  }

  // ==== STATIC FILES ====
  const filePath = resolveFilePath(url);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
      return;
    }

    // Inject dev-toolbar into HTML responses
    if (ext === '.html') {
      let html = content.toString();
      if (!html.includes('dev-toolbar.js')) {
        html = html.replace('</body>', '  <script src="/dev-toolbar.js"></script>\n</body>');
      }
      res.writeHead(200, { 'Content-Type': contentType });
      return res.end(html);
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`\n  🔨 Hoffmedia Dev Server`);
  console.log(`     http://localhost:${PORT}`);
  console.log(`     Dev toolbar auto-injected on every page\n`);
});
