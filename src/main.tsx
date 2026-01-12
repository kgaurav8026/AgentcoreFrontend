// ============================================
// Application Entry Point
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

async function bootstrap() {
  if (import.meta.env.DEV) {
    // Start MSW in dev so the browser will return mocked API responses
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
    });
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

bootstrap();

