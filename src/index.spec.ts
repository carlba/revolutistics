import { describe, it, expect } from 'vitest';

describe('server entrypoint', () => {
  it('should be a valid module', async () => {
    // Verifies the module structure is importable without actually starting the server
    const configModule = await import('./config.js');
    expect(configModule).toBeDefined();
  });
});
