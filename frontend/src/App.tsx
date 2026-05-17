import Layout from './layout/Layout'
import './App.css'
import CreateLead from './component/CreateLead'
import LeadInfo from './layout/LeadInfo'
import Login from './component/Login'
import { useAuth } from './context/AuthContext'

import Register from './component/Register'

function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    if (window.location.pathname === '/register') {
      return <Register />;
    }
    return <Login />;
  }

  return (
    <Layout>
      <CreateLead />
      <LeadInfo />
    </Layout>
  )
}

export default App

