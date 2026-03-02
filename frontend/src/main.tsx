import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import VisualizationPage from './pages/VisualizationPage.tsx'
import ProjectListPage from './pages/ProjectListPage.tsx'
import ProjectEditorPage from './pages/ProjectEditorPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route path="/" element={<VisualizationPage />} />
          <Route path="/admin" element={<ProjectListPage />} />
          <Route path="/admin/:id" element={<ProjectEditorPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
