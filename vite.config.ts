import { defineConfig } from 'vite'
import { voidPlugin } from 'void'
import { voidReact } from '@void/react/plugin'
import { typstPrecompile } from './src/build/typst-precompile'

export default defineConfig({
  plugins: [typstPrecompile(), voidPlugin(), voidReact()],
})
