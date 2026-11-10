import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminApp from './components/AdminApp.jsx'
import SupportApp from './components/SupportApp.jsx'

const path = window.location.pathname
const admin = path === "/admin" || path.startsWith("/admin/")
const supportDesk = path === "/support" || path.startsWith("/support/")

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {admin ? <AdminApp /> : supportDesk ? <SupportApp /> : <App />}
  </StrictMode>,
)
