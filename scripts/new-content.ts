import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import navfolioConfig from '../navfolio.config';
import { getConfiguredPageModules, getResolvedPageModuleScaffolds } from '../src/plugins/config';
import type {
  NavfolioContentExtension,
  NavfolioPageModuleScaffold,
  NavfolioScaffoldTemplateContext,
} from '../src/modules';

type ScaffoldTemplate = NonNullable<NavfolioPageModuleScaffold['template']>;

interface ContentScaffold {
  command: string;
  collection: string;
  directory: string;
  defaultExtension: NavfolioContentExtension;
  fileName?: (slug: string, now: Date) => string;
  template: ScaffoldTemplate;
  frontmatter?: (context: NavfolioScaffoldTemplateContext) => string;
  body?: (context: NavfolioScaffoldTemplateContext) => string;
}

const coreScaffolds = [
  {
    command: 'blog',
    collection: 'blog',
    directory: 'src/content/blog',
    defaultExtension: 'md',
    template: 'article',
  },
] satisfies ContentScaffold[];

const args = process.argv.slice(2);
const commandArg = args[0];
const filenameArg = args.find((arg, index) => index > 0 && arg !== '--mdx' && arg !== '--md');

const scaffolds = getContentScaffolds();
const scaffold = scaffolds.find((item) => item.command === commandArg);

if (!scaffold) {
  const disabledScaffold = getDisabledModuleScaffold(commandArg);

  if (disabledScaffold) {
    printDisabledContentType(disabledScaffold.command);
  } else {
    printUnsupportedContentType(commandArg, scaffolds);
  }

  process.exit(1);
}

if (filenameArg === undefined) {
  printMissingFilename(scaffolds);
  process.exit(1);
}

const slug = normalizeFilename(filenameArg);

if (!slug) {
  console.error('Invalid filename.');
  process.exit(1);
}

const now = new Date();
const isoDate = now.toISOString();
const extension = resolveExtension(args, scaffold.defaultExtension);
const title = createTitle(slug);
const templateContext = {
  title,
  slug,
  isoDate,
  now,
} satisfies NavfolioScaffoldTemplateContext;
const baseName = scaffold.fileName?.(slug, now) ?? slug;
const relativePath = path.join(scaffold.directory, `${baseName}.${extension}`);
const targetPath = path.resolve(relativePath);

if (existsSync(targetPath)) {
  console.error(`File already exists: ${relativePath}`);
  process.exit(1);
}

mkdirSync(path.dirname(targetPath), { recursive: true });
writeFileSync(
  targetPath,
  `${createFrontmatter(scaffold, templateContext)}\n\n${createBody(scaffold, templateContext)}\n`,
  'utf8',
);

console.log(`Created new ${scaffold.collection} file:`);
console.log(relativePath);

function getContentScaffolds(): ContentScaffold[] {
  const moduleScaffolds = getResolvedPageModuleScaffolds(navfolioConfig).map((scaffold) => ({
    command: scaffold.command,
    collection: scaffold.collection,
    directory: scaffold.directory,
    defaultExtension: scaffold.defaultExtension,
    fileName: scaffold.fileName,
    template: scaffold.template ?? 'article',
    frontmatter: scaffold.frontmatter,
    body: scaffold.body,
  }));

  return rejectDuplicateCommands([...coreScaffolds, ...moduleScaffolds]);
}

function rejectDuplicateCommands(scaffolds: ContentScaffold[]): ContentScaffold[] {
  const commandOwners = new Set<string>();

  for (const scaffold of scaffolds) {
    if (commandOwners.has(scaffold.command)) {
      throw new Error(`Duplicate content scaffold command "${scaffold.command}".`);
    }

    commandOwners.add(scaffold.command);
  }

  return scaffolds;
}

function getDisabledModuleScaffold(command: string | undefined) {
  if (!command) return undefined;

  return getConfiguredPageModules(navfolioConfig).find(
    (module) => module.enabled === false && module.scaffold?.command === command,
  )?.scaffold;
}

function resolveExtension(
  args: string[],
  defaultExtension: NavfolioContentExtension,
): NavfolioContentExtension {
  if (args.includes('--mdx')) return 'mdx';
  if (args.includes('--md')) return 'md';

  return defaultExtension;
}

function normalizeFilename(value: string): string {
  return value
    .trim()
    .replace(/\.(mdx?|MDX?)$/, '')
    .replace(/\s+/g, '-')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .replace(/^-+|-+$/g, '');
}

function createTitle(slug: string): string {
  return slug
    .split(/[-_]+/g)
    .filter(Boolean)
    .map((part) => {
      if (!/[A-Za-z]/.test(part)) {
        return part;
      }

      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' ');
}

function createFrontmatter(
  scaffold: ContentScaffold,
  context: NavfolioScaffoldTemplateContext,
): string {
  if (scaffold.frontmatter) return scaffold.frontmatter(context);

  if (scaffold.template === 'vibe') return createVibeFrontmatter(context.title, context.isoDate);
  if (scaffold.template === 'project') {
    return createProjectFrontmatter(context.title, context.isoDate);
  }

  return createArticleFrontmatter(context.title, context.isoDate);
}

function createBody(scaffold: ContentScaffold, context: NavfolioScaffoldTemplateContext): string {
  if (scaffold.body) return scaffold.body(context);

  if (scaffold.template === 'vibe') return createVibeBody();
  if (scaffold.template === 'project') return createProjectBody(context.title);

  return createArticleBody(context.title);
}

function createArticleFrontmatter(title: string, isoDate: string): string {
  return `---
title: "${escapeYamlString(title)}"
description: ""
date: "${isoDate}"
draft: true
sticky: false
showHeroImage: false
tags: []
categories: []
series: []
comments: true
sidebar:
  enable: true
  toc: true
  relatedPosts: true
---`;
}

function createVibeFrontmatter(title: string, isoDate: string): string {
  return `---
title: "${escapeYamlString(title)}"
date: "${isoDate}"
updatedDate: "${isoDate}"
draft: true
type: text
mood: ""
location: ""
images: []
tags: []
align: left
size: md
---`;
}

function createProjectFrontmatter(title: string, isoDate: string): string {
  return `---
title: "${escapeYamlString(title)}"
description: ""
date: "${isoDate}"
draft: true
showHeroImage: false
tags: []
categories: []
series: []
comments: true
sidebar:
  enable: false
  toc: true
  relatedPosts: false
---`;
}

function createArticleBody(title: string): string {
  return `# ${title}

Start writing here.`;
}

function createVibeBody(): string {
  return 'A small note from today.';
}

function createProjectBody(title: string): string {
  return `# ${title}

Describe the project, the decisions behind it, and useful links.`;
}

function escapeYamlString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function printMissingFilename(scaffolds: ContentScaffold[]): void {
  console.error(`Please provide a filename.

Examples:
${scaffolds.map((scaffold) => `bun scripts/new-content.ts ${scaffold.command} my-slug`).join('\n')}`);
}

function printUnsupportedContentType(
  command: string | undefined,
  scaffolds: ContentScaffold[],
): void {
  console.error(`Unsupported content scaffold command: ${command ?? ''}

Supported commands:
${scaffolds.map((scaffold) => `- ${scaffold.command}`).join('\n')}`);
}

function printDisabledContentType(command: string): void {
  console.error(`The ${command} content module is disabled in navfolio.config.ts.`);
}
