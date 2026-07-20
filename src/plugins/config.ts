import {
  getConfiguredPageModules,
  getResolvedPageModuleI18n,
  getPageModuleRoute,
  getResolvedPageModule,
  getResolvedPageModuleScaffolds,
  getResolvedPageModules,
  isPageModuleEnabled,
  normalizeModuleRoute,
  type NavfolioPageModuleRoute,
} from '@navfolio/pages';
import type { NavfolioAstroPluginConfig, NavfolioConfig, NavfolioPluginContext } from './types';

export {
  getConfiguredPageModules,
  getResolvedPageModuleI18n,
  getPageModuleRoute,
  getResolvedPageModule,
  getResolvedPageModuleScaffolds,
  getResolvedPageModules,
  isPageModuleEnabled,
  normalizeModuleRoute,
} from '@navfolio/pages';

const defaultPluginContext: NavfolioPluginContext = {
  mathRenderer: 'katex',
};

export function defineNavfolioConfig(config: NavfolioConfig): NavfolioConfig {
  return config;
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
          if (module.routes?.length) {
            for (const route of module.routes) {
              injectRoute({
                pattern: getModuleRoutePattern(route, module.route),
                entrypoint: route.entrypoint,
                prerender: route.prerender ?? true,
              });
            }

            continue;
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

function getModuleRoutePattern(route: NavfolioPageModuleRoute, moduleRoute: string): string {
  if (typeof route.pattern === 'function') {
    return route.pattern(moduleRoute);
  }

  return route.pattern ?? moduleRoute;
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
