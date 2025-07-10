import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const injectedEnv = Object.keys(env).reduce((acc, key) => {
    acc[key] = JSON.stringify(env[key]);
    return acc;
  }, {});

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['primereact', 'primeicons'],
      include: ['prop-types'],
    },
    define: {
      'process.env': injectedEnv,
    },
  };
});
