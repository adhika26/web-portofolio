import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(fileURLToPath(import.meta.url))
const sectionsDir = resolve(rootDir, 'src/sections')

function htmlPartials() {
  return {
    name: 'html-partials',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        return html.replace(/<!--\s*include:([\w-]+)\s*-->/g, (match, name) => {
          try {
            return readFileSync(resolve(sectionsDir, `${name}.html`), 'utf-8')
          } catch {
            console.warn(`[html-partials] Section "${name}" tidak ditemukan`)
            return match
          }
        })
      },
    },
  }
}

export default defineConfig({
  base: '/web-portofolio/',
  plugins: [
    htmlPartials(),
    tailwindcss(),
  ],
})
