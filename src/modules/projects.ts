import type { NavfolioPageModule, NavfolioPageModuleOptions } from './types';

export function projectsModule(options: NavfolioPageModuleOptions = {}): NavfolioPageModule {
  const route = options.route ?? '/projects';

  return {
    id: 'projects',
    enabled: options.enabled,
    route,
    nav: {
      label: 'Projects',
      href: route,
    },
    collections: ['projects'],
    scaffold: {
      command: 'project',
      directory: 'src/content/projects',
    },
  };
}
