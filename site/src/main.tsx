import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App'
import Dashboard from './pages/Dashboard'
import SitePage from './pages/SitePage'
import DiffPage from './pages/DiffPage'
import HealthPage from './pages/HealthPage'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="site/:siteId" element={<SitePage />} />
          <Route path="diff/:siteId/:docId/:date" element={<DiffPage />} />
          <Route path="health" element={<HealthPage />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
)
