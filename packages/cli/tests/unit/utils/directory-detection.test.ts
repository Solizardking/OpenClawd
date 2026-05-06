import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { detectDirectoryType, isValidForUpdates } from '../../../src/utils/directory-detection';

// Test fixtures for consistent test data
const TestFixtures = {
  packageJson: {
    openclawdProject: {
      name: 'my-project',
      packageType: 'project',
      dependencies: {
        '@openclawdsolana/core': '^1.0.0',
      },
    },
    openclawdPlugin: {
      name: '@openclawdsolana/plugin-test',
      packageType: 'plugin',
      dependencies: {
        '@openclawdsolana/core': '^1.0.0',
      },
    },
    openclawdPluginByKeywords: {
      name: 'custom-plugin',
      keywords: ['plugin', 'openclawd'],
      dependencies: {
        '@openclawdsolana/core': '^1.0.0',
      },
    },
    monorepoRoot: {
      name: 'monorepo-root',
      workspaces: ['packages/*'],
      // Explicitly no OpenClawd dependencies to avoid project classification
    },
    multipleOpenClawdDeps: {
      name: 'my-project',
      dependencies: {
        '@openclawdsolana/core': '^1.0.0',
        '@openclawdsolana/cli': '^1.0.0',
        '@openclawdsolana/plugin-discord': '^1.0.0',
      },
    },
    regularProject: {
      name: 'regular-project',
      dependencies: {
        express: '^4.0.0',
        react: '^18.0.0',
      },
    },
  },

  paths: {
    testPath: '/test/path',
    testPlugin: '/test/plugin',
    testMonorepo: '/test/monorepo',
    testSubdir: '/test/monorepo/subdir',
    testRegular: '/test/regular',
    testMissing: '/test/missing',
    testInvalid: '/test/invalid',
    testUnreadable: '/test/unreadable',
  },

  directoryInfo: {
    openclawdProject: {
      type: 'openclawd-project' as const,
      hasPackageJson: true,
      hasOpenClawdDependencies: true,
      openclawdPackageCount: 1,
    },
    openclawdPlugin: {
      type: 'openclawd-plugin' as const,
      hasPackageJson: true,
      hasOpenClawdDependencies: true,
      openclawdPackageCount: 1,
    },
    openclawdMonorepo: {
      type: 'openclawd-monorepo' as const,
      hasPackageJson: true,
      hasOpenClawdDependencies: false,
      openclawdPackageCount: 0,
    },
    openclawdSubdir: {
      type: 'openclawd-subdir' as const,
      hasPackageJson: false,
      hasOpenClawdDependencies: false,
      openclawdPackageCount: 0,
    },
    nonOpenClawdDir: {
      type: 'non-openclawd-dir' as const,
      hasPackageJson: true,
      hasOpenClawdDependencies: false,
      openclawdPackageCount: 0,
    },
  },
};

// Mock fs
mock.module('node:fs', () => ({
  existsSync: mock(() => true),
  readFileSync: mock(() => '{}'),
  statSync: mock(() => ({ isDirectory: () => true })),
  readdirSync: mock(() => []),
}));

// Mock UserEnvironment - need to mock the singleton instance
const mockFindMonorepoRoot = mock();
const mockUserEnvironmentInstance = {
  findMonorepoRoot: mockFindMonorepoRoot,
};

mock.module('../../../src/utils/user-environment', () => ({
  UserEnvironment: {
    getInstance: mock(() => mockUserEnvironmentInstance),
  },
}));

describe('directory-detection', () => {
  let mocks: {
    findMonorepoRoot: any;
    existsSync: any;
    readFileSync: any;
    readdirSync: any;
    statSync: any;
  };

  beforeEach(() => {
    // Systematically reset all mocks
    mockFindMonorepoRoot.mockClear();
    (fs.existsSync as any).mockClear();
    (fs.readFileSync as any).mockClear();
    (fs.readdirSync as any).mockClear();
    (fs.statSync as any).mockClear();

    // Store mock references for easy access
    mocks = {
      findMonorepoRoot: mockFindMonorepoRoot,
      existsSync: fs.existsSync as any,
      readFileSync: fs.readFileSync as any,
      readdirSync: fs.readdirSync as any,
      statSync: fs.statSync as any,
    };

    // Set default successful mocks
    mocks.existsSync.mockReturnValue(true);
    mocks.readFileSync.mockReturnValue('{}');
    mocks.readdirSync.mockReturnValue([]);
    mocks.statSync.mockReturnValue({ isDirectory: () => true });
    mocks.findMonorepoRoot.mockReturnValue(null);
  });

  describe('detectDirectoryType', () => {
    it('should detect openclawd project', () => {
      // Setup mocks using test fixtures
      mocks.existsSync.mockReturnValue(true);
      mocks.readFileSync.mockReturnValue(JSON.stringify(TestFixtures.packageJson.openclawdProject));
      mocks.readdirSync.mockReturnValue([]);
      mocks.findMonorepoRoot.mockReturnValue(null);

      const result = detectDirectoryType(TestFixtures.paths.testPath);

      expect(result.type).toBe('openclawd-project');
      expect(result.hasPackageJson).toBe(true);
      expect(result.hasOpenClawdDependencies).toBe(true);
      expect(result.openclawdPackageCount).toBe(1);
    });

    it('should detect openclawd plugin', () => {
      // Setup mocks using test fixtures
      mocks.existsSync.mockReturnValue(true);
      mocks.readFileSync.mockReturnValue(JSON.stringify(TestFixtures.packageJson.openclawdPlugin));
      mocks.readdirSync.mockReturnValue([]);
      mocks.findMonorepoRoot.mockReturnValue(null);

      const result = detectDirectoryType(TestFixtures.paths.testPlugin);

      expect(result.type).toBe('openclawd-plugin');
      expect(result.hasPackageJson).toBe(true);
    });

    it('should detect monorepo root', () => {
      // Setup monorepo-specific file system mocking
      mocks.existsSync.mockImplementation((filepath) => {
        const pathStr = String(filepath);
        return pathStr.includes('package.json') || pathStr === TestFixtures.paths.testMonorepo;
      });
      mocks.readFileSync.mockReturnValue(JSON.stringify(TestFixtures.packageJson.monorepoRoot));
      mocks.readdirSync.mockReturnValue(['packages']);
      mocks.statSync.mockReturnValue({ isDirectory: () => true });
      mocks.findMonorepoRoot.mockReturnValue(TestFixtures.paths.testMonorepo);

      const result = detectDirectoryType(TestFixtures.paths.testMonorepo);

      expect(result.type).toBe('openclawd-monorepo');
      expect(result.monorepoRoot).toBe(TestFixtures.paths.testMonorepo);
    });

    it('should detect openclawd subdirectory in monorepo', () => {
      // Setup subdirectory-specific file system mocking
      mocks.existsSync.mockImplementation((filepath) => {
        const pathStr = String(filepath);
        if (pathStr.includes('package.json')) {
          return false; // No package.json in subdirectory
        }
        return pathStr === TestFixtures.paths.testSubdir;
      });
      mocks.readdirSync.mockReturnValue(['some-file.txt']);
      mocks.statSync.mockReturnValue({ isDirectory: () => true });
      mocks.findMonorepoRoot.mockReturnValue(TestFixtures.paths.testMonorepo);

      const result = detectDirectoryType(TestFixtures.paths.testSubdir);

      expect(result.type).toBe('openclawd-subdir');
      expect(result.hasPackageJson).toBe(false);
      expect(result.monorepoRoot).toBe(TestFixtures.paths.testMonorepo);
    });

    it('should return non-openclawd-dir for regular project', () => {
      // Setup regular project mocking
      mocks.existsSync.mockImplementation((filepath) => {
        const pathStr = String(filepath);
        return pathStr.includes('package.json');
      });
      mocks.readFileSync.mockReturnValue(JSON.stringify(TestFixtures.packageJson.regularProject));
      mocks.readdirSync.mockReturnValue([]);
      mocks.statSync.mockReturnValue({ isDirectory: () => true });
      mocks.findMonorepoRoot.mockReturnValue(null);

      const result = detectDirectoryType(TestFixtures.paths.testRegular);

      expect(result.type).toBe('non-openclawd-dir');
      expect(result.hasOpenClawdDependencies).toBe(false);
    });

    it('should handle missing directory', () => {
      mocks.existsSync.mockReturnValue(false);

      const result = detectDirectoryType(TestFixtures.paths.testMissing);

      expect(result.type).toBe('non-openclawd-dir');
      expect(result.hasPackageJson).toBe(false);
    });

    it('should handle invalid JSON in package.json', () => {
      mocks.existsSync.mockReturnValue(true);
      mocks.readFileSync.mockReturnValue('invalid json');
      mocks.readdirSync.mockReturnValue([]);
      mocks.findMonorepoRoot.mockReturnValue(null);

      const result = detectDirectoryType(TestFixtures.paths.testInvalid);

      expect(result.type).toBe('non-openclawd-dir');
      expect(result.hasPackageJson).toBe(true);
    });

    it('should count multiple openclawd packages', () => {
      mocks.existsSync.mockReturnValue(true);
      mocks.readFileSync.mockReturnValue(
        JSON.stringify(TestFixtures.packageJson.multipleOpenClawdDeps)
      );
      mocks.readdirSync.mockReturnValue([]);
      mocks.findMonorepoRoot.mockReturnValue(null);

      const result = detectDirectoryType(TestFixtures.paths.testPath);

      expect(result.openclawdPackageCount).toBe(3);
      expect(result.hasOpenClawdDependencies).toBe(true);
    });

    it('should detect plugin by keywords', () => {
      mocks.existsSync.mockReturnValue(true);
      mocks.readFileSync.mockReturnValue(
        JSON.stringify(TestFixtures.packageJson.openclawdPluginByKeywords)
      );
      mocks.readdirSync.mockReturnValue([]);
      mocks.findMonorepoRoot.mockReturnValue(null);

      const result = detectDirectoryType(TestFixtures.paths.testPlugin);

      expect(result.type).toBe('openclawd-plugin');
    });

    it('should handle unreadable directory', () => {
      mocks.existsSync.mockReturnValue(true);
      mocks.readdirSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = detectDirectoryType(TestFixtures.paths.testUnreadable);

      expect(result.type).toBe('non-openclawd-dir');
      expect(result.hasPackageJson).toBe(false);
    });
  });

  describe('isValidForUpdates', () => {
    it('should return true for openclawd-project', () => {
      expect(isValidForUpdates(TestFixtures.directoryInfo.openclawdProject)).toBe(true);
    });

    it('should return true for openclawd-plugin', () => {
      expect(isValidForUpdates(TestFixtures.directoryInfo.openclawdPlugin)).toBe(true);
    });

    it('should return true for openclawd-monorepo', () => {
      expect(isValidForUpdates(TestFixtures.directoryInfo.openclawdMonorepo)).toBe(true);
    });

    it('should return true for openclawd-subdir', () => {
      expect(isValidForUpdates(TestFixtures.directoryInfo.openclawdSubdir)).toBe(true);
    });

    it('should return false for non-openclawd-dir', () => {
      expect(isValidForUpdates(TestFixtures.directoryInfo.nonOpenClawdDir)).toBe(false);
    });
  });
});
