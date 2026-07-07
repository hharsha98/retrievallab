import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Shell from './components/Shell'
import Landing from './pages/Landing'
import Inspector from './pages/Inspector'
import Compare from './pages/Compare'
import Eval from './pages/Eval'
import Docs from './pages/Docs'

const router = createBrowserRouter([
  { path: '/', element: <Landing /> },
  {
    element: <Shell />,
    children: [
      { path: '/inspector', element: <Inspector /> },
      { path: '/compare', element: <Compare /> },
      { path: '/eval', element: <Eval /> },
      { path: '/docs', element: <Docs /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
