import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import ShopContextProvider from './context/ShopContext.jsx' // Si tu as un provider de contexte
import { BrowserRouter } from 'react-router-dom'
// 1. Importe le composant Google
import { GoogleOAuthProvider } from '@react-oauth/google';
const googleLogin = import.meta.env.VITE_GOOGLE_CLIENT_ID; // Assure-toi que cette variable est définie dans ton .env

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 2. Colle ton Client ID Google ici */}
      <GoogleOAuthProvider clientId={googleLogin}>
        <ShopContextProvider>
          <App />
        </ShopContextProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)