import React from 'react'
import ReactDOM from 'react-dom/client'
import { WindowContextProvider, menuItems } from '@/lib/window'
import App from './app'
import './styles/app.css'

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <WindowContextProvider titlebar={{ title: 'Electron React App',  menuItems }}>
      <App />
    </WindowContextProvider>
  </React.StrictMode>
)
