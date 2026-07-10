import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { parse } from 'smol-toml';

type FontConfig = {
  en: string;
  zh: string;
  file: string;
};

const projectRoot = process.cwd();
const uiCharsPath = join(projectRoot, 'scripts/fonts/ui-chars.txt');
const fontConfig = readFontConfig();
const subsetFontUrl = getSubsetFontUrl(fontConfig.file);
const outputFontPath = resolveProjectPath(subsetFontUrl);
const sourceFontPath = resolveProjectPath(fontConfig.file);
const subsetFontName = `${fontConfig.zh} UI Subset`;
const contentSource = process.env.NAVFOLIO_CONTENT_SOURCE === 'docs' ? 'docs' : 'content';
const contentRoot = contentSource === 'docs' ? 'src/docs' : 'src/content';

const sourceDirs = [
  'src/pages',
  'src/components',
  'src/layouts',
  'src/config',
  'src/utils',
  'src/i18n',
];
const contentFrontmatterDirs = [
  `${contentRoot}/blog`,
  `${contentRoot}/projects`,
  `${contentRoot}/vibe`,
];
const lightweightContentDirs = [`${contentRoot}/vibe`];
const lightweightContentFiles = [
  `${contentRoot}/about.mdx`,
  `${contentRoot}/about.md`,
  `${contentRoot}/projects/index.mdx`,
  `${contentRoot}/projects/index.md`,
];
const sourceExtensions = new Set(['.astro', '.ts', '.js', '.mjs', '.cjs', '.json', '.toml']);
const frontmatterExtensions = new Set(['.md', '.mdx']);
const frontmatterKeys = new Set([
  'title',
  'description',
  'subtitle',
  'note',
  'tags',
  'categories',
  'series',
]);
const cjkPattern =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}\u3000-\u303f\uff00-\uffef]/u;

function readFontConfig(): FontConfig {
  const defaults: FontConfig = {
    en: 'Maple Mono',
    zh: 'ChillRoundM',
    file: '/fonts/ChillRoundM.ttf',
  };
  const siteConfigPath = join(projectRoot, 'src/config/site.toml');

  if (!existsSync(siteConfigPath)) return defaults;

  const parsed = parse(readFileSync(siteConfigPath, 'utf8')) as {
    config?: {
      fonts?: Partial<Record<keyof FontConfig, unknown>>;
    };
  };
  const fonts = parsed.config?.fonts ?? {};

  return {
    en: normalizeConfigString(fonts.en, defaults.en),
    zh: normalizeConfigString(fonts.zh, defaults.zh),
    file: normalizeConfigString(fonts.file, defaults.file),
  };
}

function getSubsetFontUrl(fontUrl: string) {
  const queryIndex = fontUrl.search(/[?#]/);
  const suffix = queryIndex === -1 ? '' : fontUrl.slice(queryIndex);
  const path = queryIndex === -1 ? fontUrl : fontUrl.slice(0, queryIndex);
  const extensionIndex = path.lastIndexOf('.');
  const basePath = extensionIndex === -1 ? path : path.slice(0, extensionIndex);

  return `${basePath}-ui-subset.woff2${suffix}`;
}

function normalizeConfigString(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function resolveProjectPath(value: string) {
  if (/^https?:\/\//i.test(value)) {
    throw new Error(
      `Font subsetting needs a local font file, but config.fonts.file received a remote URL: ${value}`,
    );
  }

  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '');
  const relativePath = normalized.startsWith('public/') ? normalized : `public/${normalized}`;

  return join(projectRoot, relativePath);
}

function walkFiles(dir: string, extensions: Set<string>) {
  if (!existsSync(dir)) return [];

  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(path, extensions));
      continue;
    }

    if (entry.isFile() && extensions.has(extname(entry.name))) files.push(path);
  }

  return files;
}

function collectCjk(chars: Set<string>, text: string) {
  for (const char of text) {
    if (cjkPattern.test(char)) chars.add(char);
  }
}

function extractFrontmatter(text: string) {
  if (!text.startsWith('---')) return '';

  const endIndex = text.indexOf('\n---', 3);
  if (endIndex === -1) return '';

  return text.slice(3, endIndex);
}

function extractFrontmatterFields(frontmatter: string) {
  const values: string[] = [];
  let activeKey: string | null = null;

  for (const line of frontmatter.split(/\r?\n/)) {
    const keyMatch = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (keyMatch) {
      activeKey = keyMatch[1];
      if (frontmatterKeys.has(activeKey)) values.push(keyMatch[2]);
      continue;
    }

    if (activeKey && frontmatterKeys.has(activeKey) && /^\s+/.test(line)) {
      values.push(line);
    }
  }

  return values.join('\n');
}

function runSubset() {
  const args = [
    sourceFontPath,
    `--text-file=${uiCharsPath}`,
    `--output-file=${outputFontPath}`,
    '--flavor=woff2',
    '--with-zopfli',
    '--layout-features=*',
    '--name-IDs=*',
    '--glyph-names',
    '--notdef-glyph',
    '--notdef-outline',
    '--recommended-glyphs',
    '--no-hinting',
  ];

  const commands = [
    { command: 'pyftsubset', args },
    { command: 'python', args: ['-m', 'fontTools.subset', ...args] },
  ];

  for (const { command, args: commandArgs } of commands) {
    const result = spawnSync(command, commandArgs, { stdio: 'inherit' });
    if (result.status === 0) {
      return;
    }

    if (result.error && 'code' in result.error && result.error.code === 'ENOENT') continue;
  }

  throw new Error(
    'Unable to run fonttools. Install it in a virtual environment with `python -m venv .venv && .venv/bin/python -m pip install fonttools brotli`, then add `.venv/bin` to PATH or make `pyftsubset` available on PATH.',
  );
}

function syncSubsetFontName() {
  const script = `
from fontTools.ttLib import TTFont
import sys

path = sys.argv[1]
family = sys.argv[2]
font = TTFont(path)
name_table = font['name']

for record in name_table.names:
    if record.nameID == 1:
        record.string = family.encode(record.getEncoding(), errors='replace')
    elif record.nameID == 2:
        record.string = 'Regular'.encode(record.getEncoding(), errors='replace')
    elif record.nameID == 4:
        record.string = f'{family} Regular'.encode(record.getEncoding(), errors='replace')
    elif record.nameID == 6:
        record.string = ''.join(part for part in f'{family}-Regular' if part.isalnum() or part == '-').encode(record.getEncoding(), errors='replace')

font.save(path)
`;
  let result = spawnSync('python3', ['-c', script, outputFontPath, subsetFontName], {
    stdio: 'inherit',
  });

  if (result.error || result.status !== 0) {
    result = spawnSync('python', ['-c', script, outputFontPath, subsetFontName], {
      stdio: 'inherit',
    });
  }

  if (result.error || result.status !== 0) {
    throw new Error(
      `Generated subset font, but failed to sync its internal name to ${subsetFontName}. Ensure Python 3 and fonttools are installed. Error: ${result.error?.message ?? `status ${result.status}`}`,
    );
  }
}

const chars = new Set<string>();

for (const dir of sourceDirs) {
  for (const file of walkFiles(join(projectRoot, dir), sourceExtensions)) {
    collectCjk(chars, readFileSync(file, 'utf8'));
  }
}

for (const dir of contentFrontmatterDirs) {
  for (const file of walkFiles(join(projectRoot, dir), frontmatterExtensions)) {
    const frontmatter = extractFrontmatter(readFileSync(file, 'utf8'));
    collectCjk(chars, extractFrontmatterFields(frontmatter));
  }
}

for (const dir of lightweightContentDirs) {
  for (const file of walkFiles(join(projectRoot, dir), frontmatterExtensions)) {
    collectCjk(chars, readFileSync(file, 'utf8'));
  }
}

for (const file of lightweightContentFiles) {
  const path = join(projectRoot, file);
  if (existsSync(path)) collectCjk(chars, readFileSync(path, 'utf8'));
}

const uiChars = [...chars].sort((a, b) => a.codePointAt(0)! - b.codePointAt(0)!).join('');
if (!uiChars) throw new Error('No CJK UI characters were found for font subsetting.');

mkdirSync(join(projectRoot, 'scripts/fonts'), { recursive: true });
mkdirSync(dirname(outputFontPath), { recursive: true });
writeFileSync(uiCharsPath, `${uiChars}\n`, 'utf8');

if (!existsSync(sourceFontPath)) {
  throw new Error(
    `${fontConfig.zh} source font not found. Place the full font at ${sourceFontPath}, or update config.fonts.file in src/config/site.toml.`,
  );
}

runSubset();
syncSubsetFontName();

console.log(`Generated ${uiCharsPath} with ${uiChars.length} CJK UI characters.`);
console.log(`Generated ${subsetFontName} at ${outputFontPath} from ${sourceFontPath}.`);
