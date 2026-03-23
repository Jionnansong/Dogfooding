
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('%c MiaostarsAPlay ', 'background: #6366f1; color: #fff; border-radius: 4px; padding: 2px 6px; font-weight: bold;', '系统已启动 | v1.0.0-Production');

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
