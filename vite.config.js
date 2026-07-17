import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Dev-only shim: runs Vercel-style /api serverless functions inside the
// Vite dev server so `npm run dev` matches production without needing
// `vercel dev` (which requires an interactive login).
function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) return next();

        const route = req.url.split('?')[0].replace('/api/', '');
        let handler;
        try {
          const mod = await server.ssrLoadModule(`/api/${route}.js`);
          handler = mod.default;
        } catch {
          return next();
        }

        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const raw = Buffer.concat(chunks).toString();
        req.body = raw ? JSON.parse(raw) : {};

        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (obj) => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        };

        await handler(req, res);
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), vercelApiDevPlugin()],
  };
})
