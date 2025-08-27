// vite.config.ts
import { defineConfig } from "file:///home/project/ORBITAL/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/ORBITAL/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import legacy from "file:///home/project/ORBITAL/project/node_modules/@vitejs/plugin-legacy/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "not IE 11"]
    })
  ],
  optimizeDeps: {
    include: ["three", "simplex-noise"]
  },
  server: {
    port: 3e3
  },
  publicDir: "public"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L09SQklUQUwvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC9PUkJJVEFML3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvcHJvamVjdC9PUkJJVEFML3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgbGVnYWN5IGZyb20gJ0B2aXRlanMvcGx1Z2luLWxlZ2FjeSc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGxlZ2FjeSh7XG4gICAgICB0YXJnZXRzOiBbJ2RlZmF1bHRzJywgJ25vdCBJRSAxMSddLFxuICAgIH0pLFxuICBdLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBpbmNsdWRlOiBbJ3RocmVlJywgJ3NpbXBsZXgtbm9pc2UnXSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogMzAwMFxuICB9LFxuICBwdWJsaWNEaXI6ICdwdWJsaWMnLFxufSk7Il0sCiAgIm1hcHBpbmdzIjogIjtBQUF5USxTQUFTLG9CQUFvQjtBQUN0UyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxZQUFZO0FBRW5CLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFNBQVMsQ0FBQyxZQUFZLFdBQVc7QUFBQSxJQUNuQyxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLFNBQVMsZUFBZTtBQUFBLEVBQ3BDO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsV0FBVztBQUNiLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
