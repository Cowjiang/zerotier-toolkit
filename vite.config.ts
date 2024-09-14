import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import PreprocessorDirectives from 'unplugin-preprocessor-directives/vite'

function checkPlatform(viteMode: string) {
  const { platform, env } = process
  if (viteMode === 'utools') {
    env.UTOOLS = 'true'
  }
  if (platform === 'darwin') {
    env.MAC_OS = 'true'
  } else if (platform === 'win32') {
    env.WINDOWS = 'true'
  } else if (platform === 'linux') {
    env.LINUX = 'true'
  }
}

export default defineConfig(async ({ mode }) => {
  checkPlatform(mode)
  return {
    base: './',
    plugins: [react(), PreprocessorDirectives()],
    clearScreen: false,
    server: {
      port: 8000,
      strictPort: true,
      watch: {
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
  }
})
