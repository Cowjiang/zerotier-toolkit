import './styles.css'
import './i18n'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'

import App from './App'

window.addEventListener('contextmenu', (e) => e.preventDefault(), false)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    {/* #if !UTOOLS */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {/* #else  */}
    <HashRouter>
      <App />
    </HashRouter>
    {/* #endif  */}
  </React.StrictMode>,
)
