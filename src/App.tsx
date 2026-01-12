// ============================================
// Main App Component
// ============================================

import React from 'react';
import { AppProviders } from '@/app/providers';
import { AppRouter } from '@/routes';

export const App: React.FC = () => {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
};

export default App;