import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { DashboardPage } from './pages/DashboardPage'
import { PaymentSuccessPage } from './pages/PaymentSuccessPage'
import { TemplatesGallery } from './pages/TemplatesGallery'
import { SharedCvPage } from './pages/SharedCvPage'

const EditorPage = lazy(() => import('./pages/EditorPage'))

function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <LoadingScreen />
  return user ? children : <Navigate to="/login" />
}

function LoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0e7ff, #ede9fe, #dbeafe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter',sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width:'48px',height:'48px',background:'linear-gradient(135deg,#4f46e5,#2563eb)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'18px',fontWeight:900,margin:'0 auto 16px' }}>CV</div>
        <p style={{ color:'#64748b',fontSize:'14px',fontWeight:500 }}>Yükleniyor...</p>
      </div>
    </div>
  )
}

export default function App() {
  const init = useAuthStore(s => s.init)
  useEffect(() => { init() }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/shared/:token" element={<SharedCvPage />} />
        <Route path="/payment/success" element={<PaymentSuccessPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/templates" element={<PrivateRoute><TemplatesGallery /></PrivateRoute>} />
        <Route path="/editor/:id" element={
          <PrivateRoute>
            <Suspense fallback={<LoadingScreen />}>
              <EditorPage />
            </Suspense>
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  )
}
