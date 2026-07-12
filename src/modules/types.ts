export type NavfolioPageModuleId = string;

export type NavfolioPageModuleBuiltinId = 'projects' | 'vibe';

export type NavfolioContentExtension = 'md' | 'mdx';

export interface NavfolioScaffoldTemplateContext {
  title: string;
  slug: string;
  isoDate: string;
  now: Date;
}

export interface NavfolioPageModuleNav {
  label: string;
  href: string;
}

export interface NavfolioPageModuleScaffold {
  command: string;
  collection: string;
  directory: string;
  defaultExtension?: NavfolioContentExtension;
  fileName?: (slug: string, now: Date) => string;
  template?: 'article' | 'project' | 'vibe';
  frontmatter?: (context: NavfolioScaffoldTemplateContext) => string;
  body?: (context: NavfolioScaffoldTemplateContext) => string;
}

export interface NavfolioPageModule {
  id: NavfolioPageModuleId;
  enabled?: boolean;
  route: string;
  nav: NavfolioPageModuleNav;
  collections: string[];
  scaffold?: NavfolioPageModuleScaffold;
}

export interface NavfolioPageModuleOptions {
  enabled?: boolean;
  route?: string;
}

export interface ResolvedNavfolioPageModule extends NavfolioPageModule {
  enabled: true;
  route: string;
  nav: NavfolioPageModuleNav;
}
