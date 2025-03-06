
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
    
    // Kill any existing process on port 3005 (Windows compatible)
    const findProcess = spawn('npx', ['kill-port', '3005'], {
      stdio: 'inherit',
      shell: true
    });
    
    findProcess.on('close', () => {
      console.log('🔄 Porta liberada, iniciando servidor...');
      
      // Start the server with a delay to ensure port is free
      setTimeout(() => {
        // Using direct node command instead of npm script
        const serverProcess = spawn('node', ['server.js'], {
          stdio: 'inherit',
          shell: true,
          env: { ...process.env, PORT: '3005' }
        });
        
        serverProcess.on('error', (error) => {
          console.error('❌ Erro ao iniciar o servidor de backend:', error);
        });
        
        process.on('exit', () => {
          console.log('🛑 Encerrando o servidor de backend...');
          serverProcess.kill();
        });
      }, 1000);
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
          rewrite: (path) => path,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, res) => {
              console.log('Proxy error:', err);
              const htmlResponse = `
                <!DOCTYPE html>
                <html>
                  <body>
                    <h1>Erro de conexão com o servidor</h1>
                    <p>O servidor de backend não está respondendo. Aguarde alguns instantes enquanto ele inicia.</p>
                  </body>
                </html>
              `;
              if (res.headersSent) return;
              res.writeHead(500, { 'Content-Type': 'text/html' });
              res.end(htmlResponse);
            });
          }
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
