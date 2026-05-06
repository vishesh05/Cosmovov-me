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
            // Remove all console.* statements in production
            drop_console: isProd,
            drop_debugger: isProd,
            // Dead code elimination
            dead_code: true,
            passes: 3,
          },
          mangle: {
            // Aggressively rename all variables/functions
            toplevel: true,
            properties: {
              // Mangle private properties (starting with _)
              regex: /^_/,
            },
          },
          format: {
            // Remove all comments
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
