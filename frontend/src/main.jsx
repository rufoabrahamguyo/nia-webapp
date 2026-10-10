import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminApp from './components/AdminApp.jsx'

const admin = window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/")

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {admin ? <AdminApp /> : <App />}
  </StrictMode>,
)
