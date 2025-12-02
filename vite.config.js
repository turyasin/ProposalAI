import { defineConfig } from 'vite'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// Copy platform directory to dist after build
function copyPlatformPlugin() {
    return {
        name: 'copy-platform',
        closeBundle() {
            const copyDir = (src, dest) => {
                mkdirSync(dest, { recursive: true })
                const entries = readdirSync(src, { withFileTypes: true })

                for (const entry of entries) {
                    const srcPath = join(src, entry.name)
                    const destPath = join(dest, entry.name)

                    if (entry.isDirectory()) {
                        copyDir(srcPath, destPath)
                    } else {
                        copyFileSync(srcPath, destPath)
                    }
                }
            }

            copyDir('platform', 'dist/platform')
            copyDir('public', 'dist')
            console.log('✓ Copied platform/ and public/ to dist/')
        }
    }
}

export default defineConfig({
    base: '/',
    plugins: [copyPlatformPlugin()],
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                about: 'about.html',
                casestudies: 'casestudies.html'
            }
        }
    },
    server: {
        allowedHosts: true
    }
})
