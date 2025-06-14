import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'; 
import './index.css'
import App from './App.jsx'
import AuthProvider from './context/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Toaster
      position="top-center"
      reverseOrder={false}
    />
    <App />
  </AuthProvider>)
  
