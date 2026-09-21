import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      include: ['lib/**', 'models/**']
    }
  }
})
