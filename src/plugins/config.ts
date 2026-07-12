import type { NavfolioAstroPluginConfig, NavfolioConfig, NavfolioPluginContext } from './types';
import { projectsModule, vibeModule } from '../modules';
import type {
  NavfolioPageModule,
  NavfolioPageModuleId,
  ResolvedNavfolioPageModule,
} from '../modules/types';

const defaultPluginContext: NavfolioPluginContext = {
  mathRenderer: 'katex',
};

const defaultPageModules = [projectsModule(), vibeModule()] satisfies NavfolioPageModule[];

export function defineNavfolioConfig(config: NavfolioConfig): NavfolioConfig {
  return config;
}

export function normalizeModuleRoute(route: string): string {
  const trimmed = route.trim();

  if (!trimmed) {
    throw new Error('Navfolio page module route cannot be empty.');
  }

  const withoutSlashes = trimmed.replace(/^\/+|\/+$/g, '');

  if (!withoutSlashes) return '/';

  return `/${withoutSlashes}`;
}

export function getConfiguredPageModules(config: NavfolioConfig): NavfolioPageModule[] {
  return config.modules ?? defaultPageModules;
}

export function getResolvedPageModules(config: NavfolioConfig): ResolvedNavfolioPageModule[] {
  const modules = getConfiguredPageModules(config);
  const routeOwners = new Map<string, string>();

  return modules.flatMap((module) => {
    if (module.enabled === false) return [];

    const route = normalizeModuleRoute(module.route);
    const existingOwner = routeOwners.get(route);

    if (existingOwner) {
      throw new Error(
        `Duplicate Navfolio page module route "${route}" for "${existingOwner}" and "${module.id}".`,
      );
    }

    routeOwners.set(route, module.id);

    return [
      {
        ...module,
        enabled: true,
        route,
        nav: {
          ...module.nav,
          href: route,
        },
      },
    ];
  });
}

export function getResolvedPageModule(
  config: NavfolioConfig,
  moduleId: NavfolioPageModuleId,
): ResolvedNavfolioPageModule | undefined {
  return getResolvedPageModules(config).find((module) => module.id === moduleId);
}

export function getPageModuleRoute(config: NavfolioConfig, moduleId: NavfolioPageModuleId): string {
  return getResolvedPageModule(config, moduleId)?.route ?? `/${moduleId}`;
}

export function isPageModuleEnabled(
  config: NavfolioConfig,
  moduleId: NavfolioPageModuleId,
): boolean {
  return getResolvedPageModule(config, moduleId) !== undefined;
}

function createPageModuleRoutesIntegration(
  config: NavfolioConfig,
): NonNullable<Required<NavfolioAstroPluginConfig>['integrations']>[number] {
  const modules = getResolvedPageModules(config);

  return {
    name: '@navfolio/page-modules',
    hooks: {
      'astro:config:setup': ({ injectRoute }) => {
        for (const module of modules) {
          if (module.id === 'vibe') {
            injectRoute({
              pattern: module.route,
              entrypoint: new URL('../modules/routes/vibe.astro', import.meta.url),
              prerender: true,
            });
          }

          if (module.id === 'projects') {
            injectRoute({
              pattern: module.route,
              entrypoint: new URL('../modules/routes/projects-index.astro', import.meta.url),
              prerender: true,
            });
            injectRoute({
              pattern: `${module.route}/[...slug]`,
              entrypoint: new URL('../modules/routes/project-detail.astro', import.meta.url),
              prerender: true,
            });
          }
        }
      },
    },
  };
}

export function getAstroPluginConfig(
  config: NavfolioConfig,
  context: NavfolioPluginContext = defaultPluginContext,
): Required<NavfolioAstroPluginConfig> {
  const astroConfigs = (config.plugins ?? []).flatMap((plugin) => {
    if (plugin.enabled === false) return [];
    if (!plugin.astro) return [];

    return typeof plugin.astro === 'function' ? plugin.astro(context) : plugin.astro;
  });

  return {
    integrations: [
      createPageModuleRoutesIntegration(config),
      ...astroConfigs.flatMap((pluginConfig) => pluginConfig.integrations ?? []),
    ],
    remarkPlugins: astroConfigs.flatMap((pluginConfig) => pluginConfig.remarkPlugins ?? []),
    rehypePlugins: astroConfigs.flatMap((pluginConfig) => pluginConfig.rehypePlugins ?? []),
  };
}
