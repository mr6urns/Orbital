import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Main.tsx loading...');

const rootElement = document.getElementById('root') || (() => {
  console.log('Creating root element...');
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  return root;
})();

console.log('Root element:', rootElement);

createRoot(rootElement).render(
  <StrictMode>
    {console.log('Rendering App component...')}
    <App />
  </StrictMode>
);