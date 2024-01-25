import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import {BrowserRouter} from 'react-router-dom'
import { NextUIProvider } from '@nextui-org/react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import NotificationProvider from './components/NotificationBar'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <NextUIProvider>
        <NextThemesProvider attribute="class" defaultTheme="light">
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </NextThemesProvider>
      </NextUIProvider>
    </BrowserRouter>
  </React.StrictMode>
)
