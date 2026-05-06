import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { existsSync } from 'node:fs';
import {
  isValidOpenClawdCloudKey,
  storeOpenClawdCloudKey,
  hasExistingOpenClawdCloudKey,
} from '../../../src/utils/get-config';

describe('OpenClawd Cloud Configuration', () => {
  let testTmpDir: string;
  let testEnvPath: string;

  beforeEach(async () => {
    testTmpDir = await mkdtemp(join(tmpdir(), 'openclawd-cloud-test-'));
    testEnvPath = join(testTmpDir, '.env');
    // Clear any existing env vars
    delete process.env.OPENCLAWD_API_KEY;
  });

  afterEach(async () => {
    if (testTmpDir) {
      try {
        await rm(testTmpDir, { recursive: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
    // Clean up env vars
    delete process.env.OPENCLAWD_API_KEY;
  });

  describe('isValidOpenClawdCloudKey', () => {
    it('should return true for valid OpenClawd Cloud API keys', () => {
      expect(isValidOpenClawdCloudKey('openclawd_abc123def456')).toBe(true);
      expect(isValidOpenClawdCloudKey('openclawd_1234567890abcdef')).toBe(true);
      expect(isValidOpenClawdCloudKey('openclawd_test_key_12345')).toBe(true);
    });

    it('should return false for keys without openclawd_ prefix', () => {
      expect(isValidOpenClawdCloudKey('sk-abc123def456')).toBe(false);
      expect(isValidOpenClawdCloudKey('abc123def456')).toBe(false);
      expect(isValidOpenClawdCloudKey('OPENCLAWD_abc123')).toBe(false);
    });

    it('should return false for keys that are too short', () => {
      expect(isValidOpenClawdCloudKey('openclawd_')).toBe(false);
      expect(isValidOpenClawdCloudKey('openclawd_abc')).toBe(false);
      expect(isValidOpenClawdCloudKey('openclawd_1234')).toBe(false);
    });

    it('should return false for empty or invalid inputs', () => {
      expect(isValidOpenClawdCloudKey('')).toBe(false);
      expect(isValidOpenClawdCloudKey(null as any)).toBe(false);
      expect(isValidOpenClawdCloudKey(undefined as any)).toBe(false);
      expect(isValidOpenClawdCloudKey(123 as any)).toBe(false);
    });
  });

  describe('storeOpenClawdCloudKey', () => {
    it('should create .env file with API key if it does not exist', async () => {
      await storeOpenClawdCloudKey('openclawd_test123456789', testEnvPath);

      expect(existsSync(testEnvPath)).toBe(true);
      const content = await readFile(testEnvPath, 'utf8');
      expect(content).toContain('OPENCLAWD_API_KEY=openclawd_test123456789');
    });

    it('should append API key to existing .env file', async () => {
      await writeFile(testEnvPath, 'EXISTING_VAR=value\n');

      await storeOpenClawdCloudKey('openclawd_test123456789', testEnvPath);

      const content = await readFile(testEnvPath, 'utf8');
      expect(content).toContain('EXISTING_VAR=value');
      expect(content).toContain('OPENCLAWD_API_KEY=openclawd_test123456789');
    });

    it('should replace existing API key in .env file', async () => {
      await writeFile(testEnvPath, 'OPENCLAWD_API_KEY=openclawd_old_key\n');

      await storeOpenClawdCloudKey('openclawd_new_key12345', testEnvPath);

      const content = await readFile(testEnvPath, 'utf8');
      expect(content).not.toContain('openclawd_old_key');
      expect(content).toContain('OPENCLAWD_API_KEY=openclawd_new_key12345');
    });

    it('should set process.env.OPENCLAWD_API_KEY', async () => {
      await storeOpenClawdCloudKey('openclawd_test123456789', testEnvPath);

      expect(process.env.OPENCLAWD_API_KEY).toBe('openclawd_test123456789');
    });

    it('should not store empty key', async () => {
      await storeOpenClawdCloudKey('', testEnvPath);

      expect(existsSync(testEnvPath)).toBe(false);
    });
  });

  describe('hasExistingOpenClawdCloudKey', () => {
    it('should return true if valid key exists in process.env', async () => {
      process.env.OPENCLAWD_API_KEY = 'openclawd_valid_key123';

      const result = await hasExistingOpenClawdCloudKey(testEnvPath);

      expect(result).toBe(true);
    });

    it('should return true if valid key exists in .env file', async () => {
      await writeFile(testEnvPath, 'OPENCLAWD_API_KEY=openclawd_from_file123\n');

      const result = await hasExistingOpenClawdCloudKey(testEnvPath);

      expect(result).toBe(true);
    });

    it('should return false if key is invalid format', async () => {
      process.env.OPENCLAWD_API_KEY = 'invalid_key';

      const result = await hasExistingOpenClawdCloudKey(testEnvPath);

      expect(result).toBe(false);
    });

    it('should return false if no key exists', async () => {
      const result = await hasExistingOpenClawdCloudKey(testEnvPath);

      expect(result).toBe(false);
    });

    it('should return false if .env file has empty key', async () => {
      await writeFile(testEnvPath, 'OPENCLAWD_API_KEY=\n');

      const result = await hasExistingOpenClawdCloudKey(testEnvPath);

      expect(result).toBe(false);
    });
  });
});

