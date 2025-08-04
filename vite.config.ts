import react from '@vitejs/plugin-react'
import PreprocessorDirectives from 'unplugin-preprocessor-directives/vite'
import { defineConfig } from 'vite'

function checkPlatform() {
  const { platform, env } = process
  if (platform === 'darwin') {
    env.MAC_OS = 'true'
  } else if (platform === 'win32') {
    env.WINDOWS = 'true'
  } else if (platform === 'linux') {
    env.LINUX = 'true'
  }
}

checkPlatform()

export default defineConfig(async () => ({
  plugins: [react(), PreprocessorDirectives()],
  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 8000,
    strictPort: true,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ['**/src-tauri/**']
    }
  },
  test: {
    root: './src',
    include: ['**/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./utils/testUtils/setupTest.tsx'],
    coverage: {
      exclude: ['**/__mocks__/**', '**/__tests__/**', '**/typings/**', '**/i18n/**', '**/services/**', '**/*.d.ts']
    }
  }
}))
