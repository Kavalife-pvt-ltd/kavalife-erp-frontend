import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from '@/routes/AppRouter';
import { AuthProvider } from '@/contexts/AuthProvider';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
