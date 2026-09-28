#!/usr/bin/env node

/**
 * Tech Inject Component Installer CLI
 * Usage:
 *   npx tech-inject add <slug> [--out <dir>] [--token <auth-token>] [--url <server-url>] [--overwrite]
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

function parseArgs() {
  const args = process.argv.slice(2);
  const help = args.includes('--help') || args.includes('-h') || args.length === 0;

  const positional = args.filter((a) => !a.startsWith('-'));
  const command = positional[0];
  const slug = positional[1];

  let targetDir = process.cwd();
  let serverUrl = process.env.TECH_INJECT_URL || 'http://localhost:3000';
  let token = process.env.TECH_INJECT_TOKEN || '';
  let overwrite = args.includes('--overwrite') || args.includes('-f');

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--out' && args[i + 1]) {
      targetDir = path.resolve(args[++i]);
    } else if (arg === '--url' && args[i + 1]) {
      serverUrl = args[++i];
    } else if (arg === '--token' && args[i + 1]) {
      token = args[++i];
    }
  }

  return { command, slug, targetDir, serverUrl, token, overwrite, help };
}

function showHelp() {
  console.log(`
Tech Inject Design Library — Component Installer CLI

Usage:
  npx tech-inject add <component-slug> [options]

Commands:
  add <slug>             Download and install component files into project

Options:
  --out <dir>            Target destination directory (default: current directory)
  --token <token>        Authentication token for premium components
  --url <url>            Tech Inject server URL (default: http://localhost:3000)
  --overwrite, -f        Overwrite existing files without error
  --help, -h             Show this help screen

Examples:
  npx tech-inject add button
  npx tech-inject add data-table --token="ti_sess_xxx"
  npx tech-inject add dialog --out="./src"
`);
}

function validateSafePath(relativePath, targetBaseDir) {
  if (path.isAbsolute(relativePath)) {
    throw new Error(`Unsafe absolute path: "${relativePath}". Must be project-relative.`);
  }
  const normalized = path.normalize(relativePath);
  if (normalized.startsWith('..') || normalized.includes(path.sep + '..' + path.sep)) {
    throw new Error(`Unsafe path traversal: "${relativePath}". Prohibited.`);
  }
  const resolved = path.resolve(targetBaseDir, normalized);
  const resolvedTarget = path.resolve(targetBaseDir);
  if (!resolved.startsWith(resolvedTarget + path.sep) && resolved !== resolvedTarget) {
    throw new Error(`Path "${resolved}" escapes root directory "${resolvedTarget}".`);
  }
  return resolved;
}

async function fetchBundle(serverUrl, slug, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(`${serverUrl.replace(/\/$/, '')}/api/components/${slug}/install`);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;

    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'tech-inject-cli/1.0.0',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = client.request(
      urlObj,
      {
        method: 'POST',
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            const data = JSON.parse(body);
            if (res.statusCode >= 400) {
              return reject(new Error(data.error || `HTTP ${res.statusCode}: Request failed`));
            }
            resolve(data);
          } catch (e) {
            reject(new Error(`Failed to parse response: ${body.substring(0, 100)}`));
          }
        });
      }
    );

    req.on('error', (err) => reject(new Error(`Network error connecting to ${serverUrl}: ${err.message}`)));
    req.write(JSON.stringify({ client: 'cli' }));
    req.end();
  });
}

async function main() {
  const { command, slug, targetDir, serverUrl, token, overwrite, help } = parseArgs();

  if (help || !command) {
    showHelp();
    process.exit(0);
  }

  if (command !== 'add') {
    console.error(`Unknown command: "${command}". Did you mean "add"?`);
    showHelp();
    process.exit(1);
  }

  if (!slug) {
    console.error('Error: Component slug is required. Example: npx tech-inject add button');
    process.exit(1);
  }

  console.log(`\n> Fetching "${slug}" from ${serverUrl}...`);

  try {
    const response = await fetchBundle(serverUrl, slug, token);
    const comp = response.component;

    console.log(`> Found ${comp.name} v${comp.version} (${comp.files.length} files)`);

    // Verify paths and check collisions
    for (const f of comp.files) {
      const fullPath = validateSafePath(f.path, targetDir);
      if (fs.existsSync(fullPath) && !overwrite) {
        console.error(`\n[ERROR] File already exists: "${f.path}"`);
        console.error('Installation aborted to prevent accidental overwrite. Use --overwrite (-f) to force replace.');
        process.exit(1);
      }
    }

    // Write files
    for (const f of comp.files) {
      const fullPath = validateSafePath(f.path, targetDir);
      const parentDir = path.dirname(fullPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(fullPath, f.content, 'utf-8');
      console.log(`  + Created: ${f.path}`);
    }

    console.log(`\n✔ Successfully installed ${comp.name} into ${targetDir}`);

    const deps = Object.keys(comp.dependencies || {});
    if (deps.length > 0) {
      const depString = deps.map((d) => `${d}@${comp.dependencies[d]}`).join(' ');
      console.log('\nRequired dependencies:');
      console.log(`  npm install ${depString}\n`);
    } else {
      console.log('No additional dependencies required.\n');
    }
  } catch (err) {
    console.error(`\n[INSTALLATION FAILED]: ${err.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateSafePath, fetchBundle };
