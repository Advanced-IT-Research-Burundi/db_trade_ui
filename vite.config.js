import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // ✅ Only load variables with VITE_ prefix
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  // ✅ Create proper define object structure
  const defineEnv = Object.keys(env).reduce((acc, key) => {
    acc[`process.env.${key}`] = JSON.stringify(env[key]);
    return acc;
  }, {});

  return {
    plugins: [react()],
    optimizeDeps: {
      exclude: ['primereact', 'primeicons'],
      include: ['prop-types'],
    },
    define: defineEnv,
  };
});