import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import Loader from "./components/Loader";
import AlertProvider from "./context/AlertProvider";
import { ReactQueryDevtools } from "react-query/devtools"; // Optional: Devtools for react-query
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { UserProvider } from "./context/UserContext";
import { QueryClient, QueryClientProvider } from "react-query";
import Alert from "./components/Alert";

// Create a QueryClient instance
const queryClient = new QueryClient();
const clientId = "714963113012-n65327u5f8kjhuoq1oecj3ast2rt17oj.apps.googleusercontent.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <AlertProvider>
          <UserProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
            <Alert />
            {/* <Loader /> */}
          </UserProvider>
        </AlertProvider>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
