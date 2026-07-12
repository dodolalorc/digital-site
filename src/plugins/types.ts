import type { defineConfig } from 'astro/config';
import type { NavfolioPageModule } from '../modules/types';

type AstroUserConfig = Parameters<typeof defineConfig>[0];
type AstroMarkdownConfig = NonNullable<AstroUserConfig['markdown']>;

export type MathRenderer = 'katex' | 'mathjax';

export interface NavfolioPluginContext {
  mathRenderer: MathRenderer;
}

export interface NavfolioAstroPluginConfig {
  integrations?: NonNullable<AstroUserConfig['integrations']>;
  remarkPlugins?: NonNullable<AstroMarkdownConfig['remarkPlugins']>;
  rehypePlugins?: NonNullable<AstroMarkdownConfig['rehypePlugins']>;
}

export interface NavfolioPlugin {
  name: string;
  enabled?: boolean;
  astro?:
    NavfolioAstroPluginConfig | ((context: NavfolioPluginContext) => NavfolioAstroPluginConfig);
}

export interface NavfolioConfig {
  plugins?: NavfolioPlugin[];
  modules?: NavfolioPageModule[];
}
