import { describe, expect, test } from 'bun:test';

import {
  defineNavfolioConfig,
  getAstroPluginConfig,
  getPageModuleRoute,
  getResolvedPageModules,
  isPageModuleEnabled,
  normalizeModuleRoute,
} from './config';
import { projectsModule, vibeModule } from '../modules';
import type { NavfolioPlugin } from './types';

describe('navfolio plugin config', () => {
  test('collects astro markdown plugins and integrations from enabled plugins', () => {
    const remarkPlugin = () => undefined;
    const rehypePlugin = () => undefined;
    const integration = { name: 'demo-integration', hooks: {} };
    const plugin: NavfolioPlugin = {
      name: 'demo',
      astro: {
        integrations: [integration],
        remarkPlugins: [remarkPlugin],
        rehypePlugins: [rehypePlugin],
      },
    };

    const config = defineNavfolioConfig({ plugins: [plugin] });
    const astro = getAstroPluginConfig(config);

    expect(astro.integrations).toContainEqual(integration);
    expect(astro.integrations.some((item) => item.name === '@navfolio/page-modules')).toBe(true);
    expect(astro.remarkPlugins).toEqual([remarkPlugin]);
    expect(astro.rehypePlugins).toEqual([rehypePlugin]);
  });

  test('skips disabled plugins', () => {
    const remarkPlugin = () => undefined;
    const plugin: NavfolioPlugin = {
      name: 'disabled-demo',
      enabled: false,
      astro: {
        remarkPlugins: [remarkPlugin],
      },
    };

    const config = defineNavfolioConfig({ plugins: [plugin] });
    const astro = getAstroPluginConfig(config);

    expect(astro.remarkPlugins).toEqual([]);
  });

  test('enables built-in page modules by default', () => {
    const config = defineNavfolioConfig({});
    const modules = getResolvedPageModules(config);

    expect(modules.map((module) => module.id)).toEqual(['projects', 'vibe']);
    expect(getPageModuleRoute(config, 'projects')).toBe('/projects');
    expect(getPageModuleRoute(config, 'vibe')).toBe('/vibe');
  });

  test('normalizes page module routes', () => {
    expect(normalizeModuleRoute('vibe')).toBe('/vibe');
    expect(normalizeModuleRoute('/space/')).toBe('/space');
  });

  test('supports disabled page modules', () => {
    const config = defineNavfolioConfig({
      modules: [projectsModule(), vibeModule({ enabled: false })],
    });

    expect(isPageModuleEnabled(config, 'projects')).toBe(true);
    expect(isPageModuleEnabled(config, 'vibe')).toBe(false);
    expect(getResolvedPageModules(config).map((module) => module.id)).toEqual(['projects']);
  });

  test('supports custom page module routes', () => {
    const config = defineNavfolioConfig({
      modules: [projectsModule({ route: '/work' }), vibeModule({ route: '/space' })],
    });

    expect(getPageModuleRoute(config, 'projects')).toBe('/work');
    expect(getPageModuleRoute(config, 'vibe')).toBe('/space');
  });

  test('rejects duplicate page module routes', () => {
    const config = defineNavfolioConfig({
      modules: [projectsModule({ route: '/space' }), vibeModule({ route: '/space' })],
    });

    expect(() => getResolvedPageModules(config)).toThrow('Duplicate Navfolio page module route');
  });
});
