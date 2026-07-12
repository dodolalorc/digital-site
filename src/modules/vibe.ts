import type { NavfolioPageModule, NavfolioPageModuleOptions } from './types';

export function vibeModule(options: NavfolioPageModuleOptions = {}): NavfolioPageModule {
  const route = options.route ?? '/vibe';

  return {
    id: 'vibe',
    enabled: options.enabled,
    route,
    nav: {
      label: 'Vibe',
      href: route,
    },
    collections: ['vibe'],
    scaffold: {
      command: 'vibe',
      directory: 'src/content/vibe',
    },
  };
}
