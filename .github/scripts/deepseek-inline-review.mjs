#!/usr/bin/env node

/**
 * DeepSeek hunk-level inline PR reviewer.
 *
 * No npm dependencies required. Uses Node 20 native fetch.
 *
 * Flow:
 * 1. Resolve PR number from GitHub event.
 * 2. Fetch PR metadata and unified diff from GitHub REST API.
 * 3. Parse diff into hunks and keep only reviewable added lines.
 * 4. Ask DeepSeek for strict JSON comments per hunk group.
 * 5. Validate each comment against the actual diff line map.
 * 6. Submit GitHub inline review comments on changed RIGHT-side lines.
 */

import fs from 'node:fs';
import crypto from 'node:crypto';

const DEFAULT_CONFIG = {
  enabled: true,
  reviewLanguage: 'zh-CN',
  model: 'deepseek-v4-flash',
  baseUrl: 'https://api.deepseek.com',
  temperature: 0.1,
  maxOutputTokens: 1800,
  requestTimeoutMs: 90_000,
  maxRetries: 3,
  minSeverity: 'medium',
  minConfidence: 0.68,
  maxComments: 12,
  maxCommentsPerFile: 4,
  maxHunks: 60,
  maxHunkLines: 140,
  hunkContextLines: 4,
  maxHunkChars: 9000,
  maxPromptCharsPerRequest: 26_000,
  maxDiffCharsTotal: 90_000,
  postNoIssuesComment: false,
  includeSuggestionText: true,
  ignorePatterns: [],
  reviewFocus: [
    'logic bugs',
    'security vulnerabilities',
    'data loss or race conditions',
    'breaking changes',
    'API misuse',
    'high-impact performance problems',
  ],
  ignoreAdvice: [
    'pure formatting',
    'subjective style preferences',
    'issues not visible from this diff',
  ],
};

const SEVERITY_RANK = new Map([
  ['low', 1],
  ['medium', 2],
  ['high', 3],
  ['critical', 4],
]);

const CATEGORY_ALLOWLIST = new Set([
  'bug',
  'security',
  'performance',
  'reliability',
  'maintainability',
  'test',
  'breaking-change',
  'api-misuse',
]);

function log(message, fields = undefined) {
  const suffix = fields ? ` ${JSON.stringify(fields)}` : '';
  console.log(`[deepseek-review] ${message}${suffix}`);
}

function warn(message, fields = undefined) {
  const suffix = fields ? ` ${JSON.stringify(fields)}` : '';
  console.warn(`[deepseek-review] WARN: ${message}${suffix}`);
}

function fail(message) {
  console.error(`[deepseek-review] ERROR: ${message}`);
  process.exitCode = 1;
}

function readJsonFile(path) {
  if (!path || !fs.existsSync(path)) return undefined;
  const raw = fs.readFileSync(path, 'utf8');
  return JSON.parse(raw);
}

function readConfig() {
  const configPath = process.env.REVIEW_CONFIG_PATH || '.github/deepseek-reviewer.json';
  let loaded = {};
  try {
    loaded = readJsonFile(configPath) || {};
    log(`Loaded config from ${configPath}`);
  } catch (error) {
    warn(`Could not parse ${configPath}; using defaults`, {
      error: String(error.message || error),
    });
  }

  const merged = { ...DEFAULT_CONFIG, ...loaded };
  if (Array.isArray(DEFAULT_CONFIG.reviewFocus) || Array.isArray(loaded.reviewFocus)) {
    merged.reviewFocus = loaded.reviewFocus || DEFAULT_CONFIG.reviewFocus;
  }
  if (Array.isArray(DEFAULT_CONFIG.ignoreAdvice) || Array.isArray(loaded.ignoreAdvice)) {
    merged.ignoreAdvice = loaded.ignoreAdvice || DEFAULT_CONFIG.ignoreAdvice;
  }
  if (Array.isArray(DEFAULT_CONFIG.ignorePatterns) || Array.isArray(loaded.ignorePatterns)) {
    merged.ignorePatterns = loaded.ignorePatterns || DEFAULT_CONFIG.ignorePatterns;
  }

  if (process.env.DEEPSEEK_MODEL) merged.model = process.env.DEEPSEEK_MODEL;
  if (process.env.DEEPSEEK_BASE_URL) merged.baseUrl = process.env.DEEPSEEK_BASE_URL;
  if (process.env.DRY_RUN) merged.dryRun = String(process.env.DRY_RUN).toLowerCase() === 'true';

  return merged;
}

function readEvent() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath || !fs.existsSync(eventPath)) {
    throw new Error(
      'GITHUB_EVENT_PATH is missing; this script is intended to run inside GitHub Actions.',
    );
  }
  return JSON.parse(fs.readFileSync(eventPath, 'utf8'));
}

function resolveRepository(event) {
  const fullName = process.env.GITHUB_REPOSITORY || event?.repository?.full_name;
  if (!fullName || !fullName.includes('/')) {
    throw new Error('Cannot resolve repository from GITHUB_REPOSITORY.');
  }
  const [owner, repo] = fullName.split('/');
  return { owner, repo };
}

function resolvePullNumber(event) {
  if (event?.pull_request?.number) return Number(event.pull_request.number);
  if (event?.issue?.pull_request && event?.issue?.number) return Number(event.issue.number);
  if (event?.inputs?.pull_number) return Number(event.inputs.pull_number);
  if (process.env.PR_NUMBER) return Number(process.env.PR_NUMBER);
  throw new Error('Cannot resolve pull request number from event.');
}

function ensureEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function truncate(text, maxChars) {
  const s = String(text ?? '');
  if (s.length <= maxChars) return s;
  return `${s.slice(0, Math.max(0, maxChars - 80))}\n\n…[truncated by reviewer, original length ${s.length} chars]`;
}

function sha1(text) {
  return crypto.createHash('sha1').update(text).digest('hex');
}

function normalizeSeverity(value) {
  const normalized = String(value || '')
    .toLowerCase()
    .trim();
  return SEVERITY_RANK.has(normalized) ? normalized : 'low';
}

function severityMeetsThreshold(severity, threshold) {
  const rank = SEVERITY_RANK.get(normalizeSeverity(severity)) || 0;
  const min = SEVERITY_RANK.get(normalizeSeverity(threshold)) || 2;
  return rank >= min;
}

function globToRegex(pattern) {
  let out = '^';
  for (let i = 0; i < pattern.length; i += 1) {
    const char = pattern[i];
    const next = pattern[i + 1];
    if (char === '*' && next === '*') {
      const after = pattern[i + 2];
      if (after === '/') {
        out += '(?:.*/)?';
        i += 2;
      } else {
        out += '.*';
        i += 1;
      }
    } else if (char === '*') {
      out += '[^/]*';
    } else if (char === '?') {
      out += '[^/]';
    } else if ('\\^$+?.()|{}[]'.includes(char)) {
      out += `\\${char}`;
    } else {
      out += char;
    }
  }
  out += '$';
  return new RegExp(out);
}

function createIgnoreMatcher(patterns) {
  const regexes = (patterns || []).map(globToRegex);
  return (path) => regexes.some((regex) => regex.test(path));
}

function normalizeDiffPath(pathText) {
  let s = String(pathText || '').trim();
  if (!s || s === '/dev/null') return null;

  // Git may quote paths containing special characters. Keep this conservative.
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1).replace(/\\t/g, '\t').replace(/\\n/g, '\n').replace(/\\"/g, '"');
  }

  if (s.startsWith('a/') || s.startsWith('b/')) return s.slice(2);
  return s;
}

function parseUnifiedDiff(diffText) {
  const files = [];
  const lines = String(diffText || '').split('\n');
  let file = null;
  let hunk = null;
  let oldLine = 0;
  let newLine = 0;

  function finishFile() {
    if (file) files.push(file);
  }

  for (const rawLine of lines) {
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine;

    if (line.startsWith('diff --git ')) {
      finishFile();
      file = {
        oldPath: null,
        newPath: null,
        path: null,
        isBinary: false,
        hunks: [],
      };
      hunk = null;
      continue;
    }

    if (!file) continue;

    if (line.startsWith('Binary files ') || line.startsWith('GIT binary patch')) {
      file.isBinary = true;
      continue;
    }

    if (line.startsWith('--- ')) {
      file.oldPath = normalizeDiffPath(line.slice(4));
      continue;
    }

    if (line.startsWith('+++ ')) {
      file.newPath = normalizeDiffPath(line.slice(4));
      file.path = file.newPath || file.oldPath;
      continue;
    }

    const hunkMatch = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)$/.exec(line);
    if (hunkMatch) {
      oldLine = Number(hunkMatch[1]);
      newLine = Number(hunkMatch[3]);
      hunk = {
        path: file.path,
        header: line,
        oldStart: oldLine,
        newStart: newLine,
        lines: [],
        addedLines: [],
        deletedLines: [],
      };
      file.hunks.push(hunk);
      continue;
    }

    if (!hunk) continue;
    if (line.startsWith('\\ No newline')) continue;

    const prefix = line[0] || ' ';
    const content = line.length > 0 ? line.slice(1) : '';

    if (prefix === '+') {
      hunk.lines.push({ type: 'add', oldLine: null, newLine, content, raw: line });
      hunk.addedLines.push(newLine);
      newLine += 1;
    } else if (prefix === '-') {
      hunk.lines.push({ type: 'del', oldLine, newLine: null, content, raw: line });
      hunk.deletedLines.push(oldLine);
      oldLine += 1;
    } else {
      hunk.lines.push({ type: 'ctx', oldLine, newLine, content, raw: line });
      oldLine += 1;
      newLine += 1;
    }
  }

  finishFile();
  return files.filter((f) => f.path);
}

function compactHunkLines(hunk, contextLines, maxLines) {
  if (hunk.lines.length <= maxLines) return hunk.lines;

  const includeIndexes = new Set();
  hunk.lines.forEach((line, index) => {
    if (line.type !== 'add') return;
    for (
      let i = Math.max(0, index - contextLines);
      i <= Math.min(hunk.lines.length - 1, index + contextLines);
      i += 1
    ) {
      includeIndexes.add(i);
    }
  });

  let indexes = [...includeIndexes].sort((a, b) => a - b);
  if (indexes.length > maxLines) {
    // Prefer retaining all additions and a small amount of nearest context.
    const additionIndexes = hunk.lines
      .map((line, index) => (line.type === 'add' ? index : -1))
      .filter((index) => index >= 0);
    const reduced = new Set(additionIndexes);
    for (const addIndex of additionIndexes) {
      if (reduced.size >= maxLines) break;
      if (addIndex > 0) reduced.add(addIndex - 1);
      if (reduced.size >= maxLines) break;
      if (addIndex < hunk.lines.length - 1) reduced.add(addIndex + 1);
    }
    indexes = [...reduced].sort((a, b) => a - b).slice(0, maxLines);
  }

  const compacted = [];
  let previous = -1;
  for (const index of indexes) {
    if (previous >= 0 && index !== previous + 1) {
      compacted.push({
        type: 'skip',
        content: `... ${index - previous - 1} unchanged/omitted diff lines ...`,
      });
    }
    compacted.push(hunk.lines[index]);
    previous = index;
  }
  return compacted;
}

function formatHunkForModel(hunk, config) {
  const lines = compactHunkLines(hunk, config.hunkContextLines, config.maxHunkLines);
  const renderedLines = lines.map((line) => {
    if (line.type === 'skip') return `      ${line.content}`;
    if (line.type === 'add') return `R${String(line.newLine).padStart(5, ' ')} + ${line.content}`;
    if (line.type === 'del') return `L${String(line.oldLine).padStart(5, ' ')} - ${line.content}`;
    return ` ${String(line.newLine).padStart(5, ' ')}   ${line.content}`;
  });
  return truncate(`${hunk.header}\n${renderedLines.join('\n')}`, config.maxHunkChars);
}

function collectReviewableHunks(files, config) {
  const shouldIgnore = createIgnoreMatcher(config.ignorePatterns || []);
  const hunks = [];
  let totalChars = 0;

  for (const file of files) {
    const path = file.path;
    if (!path || file.isBinary) continue;
    if (shouldIgnore(path)) {
      log('Ignoring file by pattern', { path });
      continue;
    }

    for (const hunk of file.hunks) {
      if (!hunk.addedLines.length) continue;
      const rendered = formatHunkForModel({ ...hunk, path }, config);
      if (totalChars + rendered.length > config.maxDiffCharsTotal) {
        warn('Reached maxDiffCharsTotal; remaining hunks will not be reviewed', {
          maxDiffCharsTotal: config.maxDiffCharsTotal,
        });
        return hunks;
      }
      hunks.push({
        id: `${path}:${hunk.newStart}`,
        path,
        header: hunk.header,
        allowed_lines: hunk.addedLines,
        diff: rendered,
      });
      totalChars += rendered.length;
      if (hunks.length >= config.maxHunks) {
        warn('Reached maxHunks; remaining hunks will not be reviewed', {
          maxHunks: config.maxHunks,
        });
        return hunks;
      }
    }
  }

  return hunks;
}

function chunkHunks(hunks, maxPromptCharsPerRequest) {
  const groups = [];
  let current = [];
  let currentSize = 0;

  for (const hunk of hunks) {
    const size = JSON.stringify(hunk).length;
    if (current.length > 0 && currentSize + size > maxPromptCharsPerRequest) {
      groups.push(current);
      current = [];
      currentSize = 0;
    }
    current.push(hunk);
    currentSize += size;
  }

  if (current.length) groups.push(current);
  return groups;
}

function buildAllowedLineMap(hunks) {
  const map = new Map();
  for (const hunk of hunks) {
    if (!map.has(hunk.path)) map.set(hunk.path, new Set());
    const set = map.get(hunk.path);
    for (const line of hunk.allowed_lines) set.add(Number(line));
  }
  return map;
}

function buildSystemPrompt(config) {
  return [
    'You are a senior code reviewer embedded in GitHub Pull Requests.',
    'You review only the provided unified diff hunks, not the whole repository.',
    '',
    `Write review comment bodies in this language: ${config.reviewLanguage}.`,
    '',
    'Review focus:',
    ...config.reviewFocus.map((item) => `- ${item}`),
    '',
    'Ignore:',
    ...config.ignoreAdvice.map((item) => `- ${item}`),
    '',
    'Hard rules:',
    '- Only report high-confidence, actionable problems introduced or exposed by the diff.',
    '- Only comment on RIGHT-side added/changed lines listed in each hunk.allowed_lines.',
    '- Do not comment on deleted lines, unchanged context lines, formatting-only issues, or speculative issues.',
    '- Do not invent files, functions, dependencies, or behavior not visible in the diff.',
    '- Prefer fewer comments. A clean review with no comments is acceptable.',
    '- Avoid duplicate comments. Put one issue on the most relevant line.',
    '- If a suggestion is not exact, make it prose instead of a code patch.',
    '',
    'Return exactly one JSON object, no markdown fences, with this schema:',
    '{',
    '  "summary": "short summary string",',
    '  "comments": [',
    '    {',
    '      "path": "relative/path/from/hunk.path",',
    '      "line": 123,',
    '      "severity": "critical|high|medium|low",',
    '      "category": "bug|security|performance|reliability|maintainability|test|breaking-change|api-misuse",',
    '      "body": "actionable explanation",',
    '      "suggestion": "concrete fix or null",',
    '      "confidence": 0.0',
    '    }',
    '  ]',
    '}',
    '',
    'When there are no meaningful issues, return: {"summary":"No high-confidence issues found.","comments":[]}.',
  ].join('\n');
}

function buildUserPrompt({ pr, hunks, config }) {
  return JSON.stringify(
    {
      pull_request: {
        number: pr.number,
        title: pr.title,
        base_ref: pr.base?.ref,
        head_ref: pr.head?.ref,
        head_sha: pr.head?.sha,
      },
      review_policy: {
        min_severity: config.minSeverity,
        min_confidence: config.minConfidence,
        max_comments_for_this_request: Math.min(config.maxComments, 8),
        line_number_meaning:
          'R-prefixed lines are RIGHT-side new file line numbers. Only these are commentable.',
        output_language: config.reviewLanguage,
      },
      hunks,
    },
    null,
    2,
  );
}

function parseJsonObject(raw) {
  const text = String(raw || '').trim();
  if (!text) throw new Error('Empty model response.');
  try {
    return JSON.parse(text);
  } catch (_) {
    const withoutFence = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/```$/i, '')
      .trim();
    try {
      return JSON.parse(withoutFence);
    } catch (_) {
      const start = withoutFence.indexOf('{');
      const end = withoutFence.lastIndexOf('}');
      if (start >= 0 && end > start) {
        return JSON.parse(withoutFence.slice(start, end + 1));
      }
      throw new Error(`Model did not return parseable JSON: ${text.slice(0, 500)}`);
    }
  }
}

async function deepSeekChat({ messages, config }) {
  const apiKey = ensureEnv('DEEPSEEK_API_KEY');
  const baseUrl = String(config.baseUrl || 'https://api.deepseek.com').replace(/\/$/, '');
  const url = `${baseUrl}/chat/completions`;
  const payload = {
    model: config.model,
    messages,
    temperature: config.temperature,
    max_tokens: config.maxOutputTokens,
    response_format: { type: 'json_object' },
    thinking: { type: 'disabled' },
  };

  let lastError;
  const attempts = Math.max(1, Number(config.maxRetries || 1));
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.requestTimeoutMs || 90_000);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      const text = await response.text();
      clearTimeout(timeout);

      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        const message = `DeepSeek API ${response.status}: ${text.slice(0, 800)}`;
        if (retryable && attempt < attempts) {
          warn('DeepSeek request failed; retrying', { attempt, status: response.status });
          await sleep(1_000 * attempt * attempt);
          continue;
        }
        throw new Error(message);
      }

      const json = JSON.parse(text);
      const content = json?.choices?.[0]?.message?.content;
      if (!content)
        throw new Error(
          `DeepSeek response missing choices[0].message.content: ${text.slice(0, 800)}`,
        );
      return parseJsonObject(content);
    } catch (error) {
      clearTimeout(timeout);
      lastError = error;
      if (attempt < attempts) {
        warn('DeepSeek request threw; retrying', {
          attempt,
          error: String(error.message || error),
        });
        await sleep(1_000 * attempt * attempt);
        continue;
      }
    }
  }

  throw lastError;
}

function normalizeModelComments(rawObject) {
  if (!rawObject || typeof rawObject !== 'object') return { summary: '', comments: [] };
  const comments = Array.isArray(rawObject.comments)
    ? rawObject.comments
    : Array.isArray(rawObject.issues)
      ? rawObject.issues
      : [];
  return {
    summary: String(rawObject.summary || '').trim(),
    comments,
  };
}

function validateAndNormalizeComments({ rawComments, hunks, config }) {
  const allowed = buildAllowedLineMap(hunks);
  const normalized = [];
  const perFileCount = new Map();
  const seen = new Set();

  for (const raw of rawComments) {
    if (!raw || typeof raw !== 'object') continue;

    const path = String(raw.path || '').trim();
    const line = Number(raw.line);
    if (!path || !Number.isInteger(line)) {
      warn('Dropping comment with invalid path/line', { path, line });
      continue;
    }

    if (!allowed.has(path) || !allowed.get(path).has(line)) {
      warn('Dropping comment not attached to an allowed RIGHT-side line', { path, line });
      continue;
    }

    const severity = normalizeSeverity(raw.severity);
    if (!severityMeetsThreshold(severity, config.minSeverity)) continue;

    const confidence = Number(raw.confidence ?? 0);
    if (!Number.isFinite(confidence) || confidence < Number(config.minConfidence || 0)) continue;

    const categoryRaw = String(raw.category || 'bug')
      .toLowerCase()
      .trim();
    const category = CATEGORY_ALLOWLIST.has(categoryRaw) ? categoryRaw : 'bug';

    const body = String(raw.body || '').trim();
    if (body.length < 20) continue;

    const fileCount = perFileCount.get(path) || 0;
    if (fileCount >= Number(config.maxCommentsPerFile || 999)) continue;

    const dedupeKey = `${path}:${line}:${severity}:${sha1(body.slice(0, 500)).slice(0, 10)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    perFileCount.set(path, fileCount + 1);

    normalized.push({
      path,
      line,
      side: 'RIGHT',
      severity,
      category,
      body,
      suggestion: raw.suggestion == null ? null : String(raw.suggestion).trim(),
      confidence,
    });
  }

  return normalized;
}

function formatReviewComment(comment, config) {
  const icons = {
    critical: '🚨',
    high: '⚠️',
    medium: '🟡',
    low: 'ℹ️',
  };
  const title = `**${icons[comment.severity] || '💬'} DeepSeek Review · ${comment.severity} · ${comment.category}**`;
  const parts = [title, '', truncate(comment.body, 1600)];

  if (config.includeSuggestionText && comment.suggestion) {
    parts.push('', '**建议修复**', truncate(comment.suggestion, 1200));
  }

  parts.push(
    '',
    `<sub>hunk-level inline reviewer · confidence ${comment.confidence.toFixed(2)}</sub>`,
  );

  const markerHash = sha1(
    `${comment.path}:${comment.line}:${comment.severity}:${comment.category}:${comment.body}`,
  );
  parts.push(`<!-- deepseek-inline-review:${markerHash} -->`);
  return parts.join('\n');
}

function extractMarkers(comments) {
  const markers = new Set();
  const regex = /<!--\s*deepseek-inline-review:([a-f0-9]{40})\s*-->/g;
  for (const comment of comments || []) {
    const body = String(comment.body || '');
    for (const match of body.matchAll(regex)) markers.add(match[1]);
  }
  return markers;
}

function markerForComment(comment) {
  return sha1(
    `${comment.path}:${comment.line}:${comment.severity}:${comment.category}:${comment.body}`,
  );
}

class GitHubClient {
  constructor({ token }) {
    this.token = token;
    this.baseUrl = (process.env.GITHUB_API_URL || 'https://api.github.com').replace(/\/$/, '');
    this.apiVersion = process.env.GITHUB_API_VERSION || '2022-11-28';
  }

  async request(
    path,
    { method = 'GET', accept = 'application/vnd.github+json', body = undefined } = {},
  ) {
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: {
        Accept: accept,
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': this.apiVersion,
        'User-Agent': 'deepseek-inline-reviewer',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`${method} ${path} failed with ${response.status}: ${text.slice(0, 1200)}`);
    }

    if (accept.includes('diff')) return text;
    if (!text) return null;
    return JSON.parse(text);
  }

  async paginate(path, { accept = 'application/vnd.github+json' } = {}) {
    const results = [];
    for (let page = 1; page <= 10; page += 1) {
      const separator = path.includes('?') ? '&' : '?';
      const chunk = await this.request(`${path}${separator}per_page=100&page=${page}`, { accept });
      if (!Array.isArray(chunk) || chunk.length === 0) break;
      results.push(...chunk);
      if (chunk.length < 100) break;
    }
    return results;
  }
}

async function fetchPullRequest(github, owner, repo, pullNumber) {
  return github.request(`/repos/${owner}/${repo}/pulls/${pullNumber}`);
}

async function fetchPullRequestDiff(github, owner, repo, pullNumber) {
  return github.request(`/repos/${owner}/${repo}/pulls/${pullNumber}`, {
    accept: 'application/vnd.github.v3.diff',
  });
}

async function fetchExistingReviewComments(github, owner, repo, pullNumber) {
  return github.paginate(`/repos/${owner}/${repo}/pulls/${pullNumber}/comments`);
}

function makeReviewBody({ pr, reviewedHunkCount, finalCommentCount, summaries }) {
  const summaryLines = summaries
    .filter(Boolean)
    .slice(0, 5)
    .map((s) => `- ${truncate(s, 250)}`);
  return [
    '## 🤖 DeepSeek Inline Review',
    '',
    `已按 hunk 审查 PR #${pr.number} 的 ${reviewedHunkCount} 个 diff hunk，提交 ${finalCommentCount} 条高置信度 inline 评论。`,
    '',
    summaryLines.length ? '**模型摘要**' : '',
    ...summaryLines,
    '',
    '<sub>仅评论本次 diff 的 RIGHT-side 新增/修改行；低置信度与纯风格建议已过滤。</sub>',
  ]
    .filter((line) => line !== '')
    .join('\n');
}

async function postInlineReview({ github, owner, repo, pr, comments, body, config }) {
  const reviewComments = comments.map((comment) => ({
    path: comment.path,
    line: comment.line,
    side: 'RIGHT',
    body: formatReviewComment(comment, config),
  }));

  if (config.dryRun) {
    log('DRY_RUN=true, not posting review', { comments: reviewComments });
    return;
  }

  const payload = {
    commit_id: pr.head.sha,
    event: 'COMMENT',
    body,
    comments: reviewComments,
  };

  try {
    await github.request(`/repos/${owner}/${repo}/pulls/${pr.number}/reviews`, {
      method: 'POST',
      body: payload,
    });
    log('Posted grouped inline review', { comments: reviewComments.length });
  } catch (error) {
    warn('Grouped review failed; falling back to individual review comments', {
      error: String(error.message || error).slice(0, 600),
    });

    let posted = 0;
    const failed = [];
    for (const comment of reviewComments) {
      try {
        await github.request(`/repos/${owner}/${repo}/pulls/${pr.number}/comments`, {
          method: 'POST',
          body: {
            commit_id: pr.head.sha,
            path: comment.path,
            line: comment.line,
            side: 'RIGHT',
            body: comment.body,
          },
        });
        posted += 1;
      } catch (commentError) {
        failed.push({
          path: comment.path,
          line: comment.line,
          error: String(commentError.message || commentError).slice(0, 300),
        });
      }
    }

    if (posted > 0) {
      log('Posted fallback individual inline comments', { posted, failed: failed.length });
      return;
    }

    warn('All inline comment attempts failed; posting a non-inline fallback summary', { failed });
    const fallbackBody = [
      body,
      '',
      '> GitHub 没有接受这些 inline comment 的 line mapping，因此这里退回为普通 PR 评论。',
      '',
      ...comments.map((comment) =>
        [
          `### ${comment.path}:${comment.line} · ${comment.severity} · ${comment.category}`,
          '',
          comment.body,
          comment.suggestion ? `\n**建议修复**\n${comment.suggestion}` : '',
        ].join('\n'),
      ),
    ].join('\n');

    await github.request(`/repos/${owner}/${repo}/issues/${pr.number}/comments`, {
      method: 'POST',
      body: { body: truncate(fallbackBody, 60000) },
    });
  }
}

async function maybePostNoIssuesComment({ github, owner, repo, pr, reviewedHunkCount, config }) {
  if (!config.postNoIssuesComment) return;
  const body = [
    '## 🤖 DeepSeek Inline Review',
    '',
    `已按 hunk 审查 PR #${pr.number} 的 ${reviewedHunkCount} 个 diff hunk，未发现达到阈值的高置信度问题。`,
    '',
    '<sub>仅评论本次 diff 的 RIGHT-side 新增/修改行；低置信度与纯风格建议已过滤。</sub>',
  ].join('\n');

  if (config.dryRun) {
    log('DRY_RUN=true, not posting no-issues comment');
    return;
  }

  await github.request(`/repos/${owner}/${repo}/issues/${pr.number}/comments`, {
    method: 'POST',
    body: { body },
  });
}

async function main() {
  const config = readConfig();
  if (!config.enabled) {
    log('Reviewer disabled by config.');
    return;
  }

  const event = readEvent();
  const { owner, repo } = resolveRepository(event);
  const pullNumber = resolvePullNumber(event);
  const github = new GitHubClient({ token: ensureEnv('GITHUB_TOKEN') });

  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error(
      'DEEPSEEK_API_KEY secret is missing. Add it under Settings → Secrets and variables → Actions.',
    );
  }

  log('Starting review', {
    owner,
    repo,
    pullNumber,
    model: config.model,
    dryRun: Boolean(config.dryRun),
  });

  const pr = await fetchPullRequest(github, owner, repo, pullNumber);
  if (pr.draft) {
    log('Skipping draft PR.');
    return;
  }

  const diffText = await fetchPullRequestDiff(github, owner, repo, pullNumber);
  if (!diffText.trim()) {
    log('Empty diff; nothing to review.');
    return;
  }

  const files = parseUnifiedDiff(diffText);
  const hunks = collectReviewableHunks(files, config);
  if (!hunks.length) {
    log('No reviewable added-line hunks after filters.');
    await maybePostNoIssuesComment({ github, owner, repo, pr, reviewedHunkCount: 0, config });
    return;
  }

  log('Collected reviewable hunks', { files: files.length, hunks: hunks.length });
  const groups = chunkHunks(hunks, Number(config.maxPromptCharsPerRequest || 26_000));
  log('Chunked hunks for model calls', { groups: groups.length });

  const allComments = [];
  const summaries = [];

  for (let index = 0; index < groups.length; index += 1) {
    const group = groups[index];
    log('Reviewing hunk group', {
      group: index + 1,
      totalGroups: groups.length,
      hunks: group.length,
    });
    const responseObject = await deepSeekChat({
      config,
      messages: [
        { role: 'system', content: buildSystemPrompt(config) },
        { role: 'user', content: buildUserPrompt({ pr, hunks: group, config }) },
      ],
    });

    const { summary, comments } = normalizeModelComments(responseObject);
    if (summary) summaries.push(summary);

    const validated = validateAndNormalizeComments({ rawComments: comments, hunks: group, config });
    log('Validated model comments', {
      group: index + 1,
      raw: comments.length,
      accepted: validated.length,
    });
    allComments.push(...validated);

    if (allComments.length >= Number(config.maxComments || 12)) break;
  }

  const existingComments = await fetchExistingReviewComments(github, owner, repo, pullNumber);
  const existingMarkers = extractMarkers(existingComments);

  const finalComments = [];
  const seenGlobal = new Set();
  for (const comment of allComments) {
    const marker = markerForComment(comment);
    const key = `${comment.path}:${comment.line}:${marker}`;
    if (seenGlobal.has(key)) continue;
    seenGlobal.add(key);
    if (existingMarkers.has(marker)) {
      log('Skipping duplicate existing comment', { path: comment.path, line: comment.line });
      continue;
    }
    finalComments.push(comment);
    if (finalComments.length >= Number(config.maxComments || 12)) break;
  }

  if (!finalComments.length) {
    log('No new comments to post after validation/deduplication.');
    await maybePostNoIssuesComment({
      github,
      owner,
      repo,
      pr,
      reviewedHunkCount: hunks.length,
      config,
    });
    return;
  }

  const body = makeReviewBody({
    pr,
    reviewedHunkCount: hunks.length,
    finalCommentCount: finalComments.length,
    summaries,
  });

  await postInlineReview({ github, owner, repo, pr, comments: finalComments, body, config });
}

main().catch((error) => {
  fail(String(error.stack || error.message || error));
});
