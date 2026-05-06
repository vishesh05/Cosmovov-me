import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';
    return {
      // CRITICAL for Capacitor: use relative paths so Android WebView can load assets
      base: './',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // SECURITY: No source maps in production — prevents code inspection
        sourcemap: false,
        
        // Use terser for aggressive minification + obfuscation
        minify: 'terser' as const,
        terserOptions: {
          compress: {
            drop_debugger: isProd,
            dead_code: true,
            passes: 2,
          },
          mangle: true,
          format: {
            comments: false,
          },
        },

        // Chunk splitting for better caching + harder to trace
        rollupOptions: {
          output: {
            // Randomize chunk names in production
            chunkFileNames: isProd ? 'assets/c-[hash].js' : 'assets/[name]-[hash].js',
            entryFileNames: isProd ? 'assets/e-[hash].js' : 'assets/[name]-[hash].js',
            assetFileNames: isProd ? 'assets/a-[hash][extname]' : 'assets/[name]-[hash][extname]',
            
            manualChunks: {
              // Split vendor code separately
              'vendor-react': ['react', 'react-dom'],
              'vendor-astro': ['astronomy-engine'],
            },
          },
        },

        // Increase chunk warning limit for astrology engine files
        chunkSizeWarningLimit: 1000,
      },
    };
});
