import * as fs from 'node:fs';
import * as path from 'node:path';
import { UserEnvironment } from './user-environment';

export interface DirectoryInfo {
  type:
    | 'openclawd-project'
    | 'openclawd-plugin'
    | 'openclawd-monorepo'
    | 'openclawd-subdir'
    | 'non-openclawd-dir';
  hasPackageJson: boolean;
  hasOpenClawdDependencies: boolean;
  packageName?: string;
  openclawdPackageCount: number;
  monorepoRoot?: string;
}

interface PackageJson {
  name?: string;
  keywords?: string[];
  main?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: string[] | { packages?: string[] };
  packageType?: string;
  agentConfig?: {
    pluginType?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

/**
 * Detects the type of directory and provides comprehensive information about it
 * @param dir The directory path to analyze
 * @returns DirectoryInfo object with detection results
 */
export function detectDirectoryType(dir: string): DirectoryInfo {
  // Check if directory exists and is readable
  if (!fs.existsSync(dir)) {
    return {
      type: 'non-openclawd-dir',
      hasPackageJson: false,
      hasOpenClawdDependencies: false,
      openclawdPackageCount: 0,
    };
  }

  try {
    fs.readdirSync(dir);
  } catch (error) {
    return {
      type: 'non-openclawd-dir',
      hasPackageJson: false,
      hasOpenClawdDependencies: false,
      openclawdPackageCount: 0,
    };
  }

  // Check for monorepo root
  const monorepoRoot = UserEnvironment.getInstance().findMonorepoRoot(dir) ?? undefined;

  // Check for package.json
  const packageJsonPath = path.join(dir, 'package.json');
  const hasPackageJson = fs.existsSync(packageJsonPath);

  if (monorepoRoot) {
    // If the current directory IS the monorepo root, classify as monorepo
    if (path.resolve(dir) === path.resolve(monorepoRoot)) {
      return {
        type: 'openclawd-monorepo',
        hasPackageJson,
        hasOpenClawdDependencies: false,
        openclawdPackageCount: 0,
        monorepoRoot,
      };
    }

    // If we're inside the monorepo but don't have package.json, it's a subdirectory
    if (!hasPackageJson) {
      return {
        type: 'openclawd-subdir',
        hasPackageJson: false,
        hasOpenClawdDependencies: false,
        openclawdPackageCount: 0,
        monorepoRoot,
      };
    }
  } else if (!hasPackageJson) {
    // Not in monorepo and no package.json
    return {
      type: 'non-openclawd-dir',
      hasPackageJson: false,
      hasOpenClawdDependencies: false,
      openclawdPackageCount: 0,
      monorepoRoot,
    };
  }

  // Parse package.json
  let packageJson: PackageJson;
  try {
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    packageJson = JSON.parse(packageJsonContent);
  } catch (error) {
    return {
      type: 'non-openclawd-dir',
      hasPackageJson: true,
      hasOpenClawdDependencies: false,
      openclawdPackageCount: 0,
      monorepoRoot,
    };
  }

  // Create result object
  const result: DirectoryInfo = {
    type: 'non-openclawd-dir', // Default, will be updated below
    hasPackageJson: true,
    hasOpenClawdDependencies: false,
    openclawdPackageCount: 0,
    packageName: packageJson.name,
    monorepoRoot,
  };

  // Check for OpenClawd dependencies
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const openclawdPackages = Object.keys(dependencies).filter((pkg) => pkg.startsWith('@openclawdsolana/'));
  result.openclawdPackageCount = openclawdPackages.length;
  result.hasOpenClawdDependencies = openclawdPackages.length > 0;

  // Determine if this is an OpenClawd plugin
  const isPlugin = isOpenClawdPlugin(packageJson);
  if (isPlugin) {
    result.type = 'openclawd-plugin';
    return result;
  }

  // Determine if this is an OpenClawd project
  const isProject = isOpenClawdProject(packageJson, dir, monorepoRoot);
  if (isProject) {
    result.type = 'openclawd-project';
    return result;
  }

  // If inside monorepo and not a project or plugin → openclawd-subdir
  // If outside monorepo and not a project or plugin → non-openclawd-dir
  if (monorepoRoot) {
    result.type = 'openclawd-subdir';
  } else {
    result.type = 'non-openclawd-dir';
  }

  return result;
}

/**
 * Checks if a package.json indicates an OpenClawd plugin
 */
function isOpenClawdPlugin(packageJson: PackageJson): boolean {
  // 1. EXPLICIT indicators first (most reliable)

  // Check packageType field (used in plugin templates)
  if (packageJson.packageType === 'plugin') {
    return true;
  }

  // Check keywords
  const keywords = packageJson.keywords || [];
  if (keywords.includes('plugin')) {
    return true;
  }

  // Check agentConfig.pluginType field
  if (packageJson.agentConfig?.pluginType?.includes('plugin')) {
    return true;
  }

  // 2. FALLBACK to package name patterns
  const packageName = packageJson.name || '';
  if (
    packageName.startsWith('@openclawdsolana/plugin-') ||
    packageName.startsWith('plugin-') ||
    packageName.includes('/plugin-') ||
    (packageName.includes('plugin') && packageName.includes('openclawd'))
  ) {
    return true;
  }

  // 3. OTHER heuristics (least reliable)
  if (
    packageJson.main &&
    (packageJson.main.includes('plugin') ||
      packageJson.main === 'src/index.ts' ||
      packageJson.main === 'dist/index.js')
  ) {
    // Additional check for plugin-like dependencies
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const hasOpenClawdCore = Object.keys(allDeps).some((dep) => dep.startsWith('@openclawdsolana/core'));
    if (hasOpenClawdCore && keywords.length > 0) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if a package.json and directory structure indicates an OpenClawd project
 */
function isOpenClawdProject(packageJson: PackageJson, dir: string, monorepoRoot?: string): boolean {
  // 1. EXPLICIT indicators first (most reliable)

  // Check packageType field (used in project templates)
  if (packageJson.packageType === 'project') {
    return true;
  }

  // Check keywords
  const keywords = packageJson.keywords || [];
  if (keywords.includes('project')) {
    return true;
  }

  // Check agentConfig for project indicators
  if (packageJson.agentConfig?.pluginType?.includes('project')) {
    return true;
  }

  // 2. FALLBACK to package name patterns
  const packageName = packageJson.name || '';
  if (
    packageName.startsWith('@openclawdsolana/project-') ||
    packageName.startsWith('project-') ||
    packageName.includes('/project-') ||
    (packageName.includes('project') && packageName.includes('openclawd'))
  ) {
    return true;
  }

  // 3. OTHER heuristics (only when outside monorepo to avoid false positives)
  if (!monorepoRoot) {
    // Check src/index.ts content
    const srcIndexPath = path.join(dir, 'src', 'index.ts');
    if (fs.existsSync(srcIndexPath)) {
      try {
        const indexContent = fs.readFileSync(srcIndexPath, 'utf8');
        if (
          indexContent.includes('export const project') ||
          indexContent.includes('Project') ||
          indexContent.includes('agents')
        ) {
          return true;
        }
      } catch {
        // Ignore read errors
      }
    }

    // Check for character files (common in OpenClawd projects)
    const characterFiles = ['character.json', 'characters.json', 'characters'];
    for (const file of characterFiles) {
      if (fs.existsSync(path.join(dir, file))) {
        return true;
      }
    }

    // Check for project-specific directories
    const projectDirs = ['characters', 'agents', '.openclawd'];
    for (const dirName of projectDirs) {
      if (fs.existsSync(path.join(dir, dirName))) {
        const stat = fs.statSync(path.join(dir, dirName));
        if (stat.isDirectory()) {
          return true;
        }
      }
    }

    // Check for project dependencies pattern
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    const hasOpenClawdCore = Object.keys(allDeps).some((dep) => dep.startsWith('@openclawdsolana/core'));
    const hasMultipleOpenClawdPackages =
      Object.keys(allDeps).filter((dep) => dep.startsWith('@openclawdsolana/')).length >= 2;

    if (hasOpenClawdCore && hasMultipleOpenClawdPackages) {
      return true;
    }
  }

  return false;
}

/**
 * Checks if the directory is suitable for OpenClawd package updates
 */
export function isValidForUpdates(info: DirectoryInfo): boolean {
  return (
    info.type === 'openclawd-project' ||
    info.type === 'openclawd-plugin' ||
    info.type === 'openclawd-monorepo' ||
    info.type === 'openclawd-subdir'
  );
}
