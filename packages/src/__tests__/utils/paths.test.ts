import { describe, expect, test, beforeEach, afterEach } from 'bun:test';
import {
  getOpenClawdPaths,
  getDataDir,
  getDatabaseDir,
  getCharactersDir,
  getGeneratedDir,
  getUploadsAgentsDir,
  getUploadsChannelsDir,
  getAllOpenClawdPaths,
  resetPaths,
} from '../../utils/paths';
import path from 'node:path';

describe('OpenClawdPaths', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset singleton before each test
    resetPaths();
    // Clear environment variables
    process.env = { ...originalEnv };
    delete process.env.OPENCLAWD_DATA_DIR;
    delete process.env.OPENCLAWD_DATABASE_DIR;
    delete process.env.OPENCLAWD_DATA_DIR_CHARACTERS;
    delete process.env.OPENCLAWD_DATA_DIR_GENERATED;
    delete process.env.OPENCLAWD_DATA_DIR_UPLOADS_AGENTS;
    delete process.env.OPENCLAWD_DATA_DIR_UPLOADS_CHANNELS;
    delete process.env.PGLITE_DATA_DIR;
  });

  afterEach(() => {
    process.env = originalEnv;
    resetPaths();
  });

  describe('Default paths', () => {
    test('should use default base directory', () => {
      const dataDir = getDataDir();
      expect(dataDir).toBe(path.join(process.cwd(), '.openclawd'));
    });

    test('should use default database directory', () => {
      const dbDir = getDatabaseDir();
      expect(dbDir).toBe(path.join(process.cwd(), '.openclawd', '.openclawddb'));
    });

    test('should use default characters directory', () => {
      const charsDir = getCharactersDir();
      expect(charsDir).toBe(path.join(process.cwd(), '.openclawd', 'data', 'characters'));
    });

    test('should use default generated directory', () => {
      const genDir = getGeneratedDir();
      expect(genDir).toBe(path.join(process.cwd(), '.openclawd', 'data', 'generated'));
    });

    test('should use default uploads agents directory', () => {
      const uploadsDir = getUploadsAgentsDir();
      expect(uploadsDir).toBe(path.join(process.cwd(), '.openclawd', 'data', 'uploads', 'agents'));
    });

    test('should use default uploads channels directory', () => {
      const uploadsDir = getUploadsChannelsDir();
      expect(uploadsDir).toBe(path.join(process.cwd(), '.openclawd', 'data', 'uploads', 'channels'));
    });
  });

  describe('Custom paths via environment variables', () => {
    test('should use custom base directory from OPENCLAWD_DATA_DIR', () => {
      process.env.OPENCLAWD_DATA_DIR = '/custom/data';
      resetPaths(); // Reset to pick up new env

      const dataDir = getDataDir();
      expect(dataDir).toBe('/custom/data');
    });

    test('should use custom database directory from OPENCLAWD_DATABASE_DIR', () => {
      process.env.OPENCLAWD_DATABASE_DIR = '/custom/db';
      resetPaths();

      const dbDir = getDatabaseDir();
      expect(dbDir).toBe('/custom/db');
    });

    test('should use PGLITE_DATA_DIR as fallback for database', () => {
      process.env.PGLITE_DATA_DIR = '/pglite/db';
      resetPaths();

      const dbDir = getDatabaseDir();
      expect(dbDir).toBe('/pglite/db');
    });

    test('should prefer OPENCLAWD_DATABASE_DIR over PGLITE_DATA_DIR', () => {
      process.env.OPENCLAWD_DATABASE_DIR = '/openclawd/db';
      process.env.PGLITE_DATA_DIR = '/pglite/db';
      resetPaths();

      const dbDir = getDatabaseDir();
      expect(dbDir).toBe('/openclawd/db');
    });

    test('should use custom characters directory', () => {
      process.env.OPENCLAWD_DATA_DIR_CHARACTERS = '/custom/characters';
      resetPaths();

      const charsDir = getCharactersDir();
      expect(charsDir).toBe('/custom/characters');
    });

    test('should use custom generated directory', () => {
      process.env.OPENCLAWD_DATA_DIR_GENERATED = '/custom/generated';
      resetPaths();

      const genDir = getGeneratedDir();
      expect(genDir).toBe('/custom/generated');
    });

    test('should use custom uploads directories', () => {
      process.env.OPENCLAWD_DATA_DIR_UPLOADS_AGENTS = '/custom/uploads/agents';
      process.env.OPENCLAWD_DATA_DIR_UPLOADS_CHANNELS = '/custom/uploads/channels';
      resetPaths();

      expect(getUploadsAgentsDir()).toBe('/custom/uploads/agents');
      expect(getUploadsChannelsDir()).toBe('/custom/uploads/channels');
    });

    test('should respect base directory for relative paths', () => {
      process.env.OPENCLAWD_DATA_DIR = '/custom/base';
      resetPaths();

      // When specific dirs are not set, they should use the base
      expect(getCharactersDir()).toBe('/custom/base/data/characters');
      expect(getGeneratedDir()).toBe('/custom/base/data/generated');
      expect(getUploadsAgentsDir()).toBe('/custom/base/data/uploads/agents');
      expect(getUploadsChannelsDir()).toBe('/custom/base/data/uploads/channels');
    });
  });

  describe('getAllPaths', () => {
    test('should return all paths in a single object', () => {
      const paths = getAllOpenClawdPaths();

      expect(paths).toHaveProperty('dataDir');
      expect(paths).toHaveProperty('databaseDir');
      expect(paths).toHaveProperty('charactersDir');
      expect(paths).toHaveProperty('generatedDir');
      expect(paths).toHaveProperty('uploadsAgentsDir');
      expect(paths).toHaveProperty('uploadsChannelsDir');

      expect(paths.dataDir).toBe(getDataDir());
      expect(paths.databaseDir).toBe(getDatabaseDir());
      expect(paths.charactersDir).toBe(getCharactersDir());
      expect(paths.generatedDir).toBe(getGeneratedDir());
      expect(paths.uploadsAgentsDir).toBe(getUploadsAgentsDir());
      expect(paths.uploadsChannelsDir).toBe(getUploadsChannelsDir());
    });
  });

  describe('Singleton behavior', () => {
    test('should return the same instance', () => {
      const instance1 = getOpenClawdPaths();
      const instance2 = getOpenClawdPaths();

      expect(instance1).toBe(instance2);
    });

    test('should cache values between calls', () => {
      // First call
      const dir1 = getDataDir();

      // Change env (but don't reset)
      process.env.OPENCLAWD_DATA_DIR = '/changed';

      // Should still return cached value
      const dir2 = getDataDir();
      expect(dir2).toBe(dir1);

      // After reset, should pick up new value
      resetPaths();
      const dir3 = getDataDir();
      expect(dir3).toBe('/changed');
    });
  });
});
