import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';
import { NextUIProvider } from '@nextui-org/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import NotificationProvider from './components/NotificationBar.tsx';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <NextUIProvider>
      <NextThemesProvider attribute="class" defaultTheme="light">
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </NextThemesProvider>
    </NextUIProvider>
  </React.StrictMode>
);
