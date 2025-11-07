import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "@ant-design/v5-patch-for-react-19";
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
