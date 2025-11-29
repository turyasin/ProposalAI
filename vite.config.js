import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
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
