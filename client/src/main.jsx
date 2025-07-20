import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthProvider from "./context/AuthContext.jsx";
import { Toaster } from "react-hot-toast";

const clientId = "280455534344-88ke0uiaorctl65dsrvmv0p5ri2ssjj7.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <GoogleOAuthProvider clientId={clientId}>
        <App />
        <Toaster
          position="top-center"
          reverseOrder={false}
        />
      </GoogleOAuthProvider>
    </AuthProvider>
  </StrictMode>
);
