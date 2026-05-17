import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './layout/Layout'
import './App.css'
import CreateLead from './component/CreateLead'
import LeadInfo from './layout/LeadInfo'
import Login from './component/Login'
import { useAuth } from './context/AuthContext'
import Register from './component/Register'

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="/" 
        element={
          isAuthenticated ? (
            <Layout>
              <CreateLead />
              <LeadInfo />
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App

