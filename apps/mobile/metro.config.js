const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// apps/mobile is the project root; monorepo root is two levels up
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so Metro picks up changes in packages/shared
config.watchFolders = [monorepoRoot];

// Resolve node_modules from the app first, then fall back to the monorepo root
// (needed because pnpm hoists most packages to the root node_modules)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = config;
