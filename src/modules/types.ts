export type NavfolioPageModuleId = 'projects' | 'vibe';

export interface NavfolioPageModuleNav {
  label: string;
  href: string;
}

export interface NavfolioPageModuleScaffold {
  command: string;
  directory: string;
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
