import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@app': path.resolve(__dirname, './src/app'),
            '@core': path.resolve(__dirname, './src/core'),
            '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
            '@application': path.resolve(__dirname, './src/application'),
            '@presentation': path.resolve(__dirname, './src/presentation'),
            '@shared': path.resolve(__dirname, './src/shared'),
            '@components': path.resolve(__dirname, './src/presentation/components'),
            '@pages': path.resolve(__dirname, './src/presentation/pages'),
            '@hooks': path.resolve(__dirname, './src/presentation/hooks'),
            '@context': path.resolve(__dirname, './src/presentation/context'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@styles': path.resolve(__dirname, './src/styles'),
            '@config': path.resolve(__dirname, './src/config'),
        },
    },
    server: {
        port: 3000,
        open: true,
    },
    preview: {
        port: 4173,
    },
})