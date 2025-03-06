
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { spawn } from "child_process";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Start the backend server when Vite starts
  if (mode === 'development') {
    console.log('🚀 Iniciando o servidor de backend...');
    const serverProcess = spawn('npm', ['start'], {
      stdio: 'inherit',
      shell: true
    });
    
    serverProcess.on('error', (error) => {
      console.error('❌ Erro ao iniciar o servidor de backend:', error);
    });
    
    process.on('exit', () => {
      console.log('🛑 Encerrando o servidor de backend...');
      serverProcess.kill();
    });
  }

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:3005',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        }
      }
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
});
