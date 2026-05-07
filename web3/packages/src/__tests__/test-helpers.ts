export function createMockAdapter() {
  return {
    db: {},
    init: async () => undefined,
    close: async () => undefined,
  };
}
