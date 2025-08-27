@@ .. @@
 const rootElement = document.getElementById('root');
 if (!rootElement) {
   const root = document.createElement('div');
   root.id = 'root';
   document.body.appendChild(root);
+  
+  createRoot(root).render(
+    <StrictMode>
+      <App />
+    </StrictMode>
+  );
+} else {
+  createRoot(rootElement).render(
+    <StrictMode>
+      <App />
+    </StrictMode>
+  );
 }
-
-createRoot(rootElement || document.getElementById('root')!).render(
-  <StrictMode>
-    <App />
-  </StrictMode>
-);