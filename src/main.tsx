import './styles.css'
import './i18n'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import { forwardConsole } from './utils/helpers/tauriHelpers.ts'

window.addEventListener('contextmenu', (e) => e.preventDefault(), false)

window.addEventListener('unhandledrejection', function (event) {
  console.error('[Unhandled Rejection]', event.reason)
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

forwardConsole('log')
forwardConsole('debug')
forwardConsole('info')
forwardConsole('error')
