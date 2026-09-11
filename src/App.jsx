import React, { useState, useEffect } from "react";
import { Router, Routes, Route, useLocation } from "react-router-dom";
import { IntlProvider } from "react-intl";
import { messages } from "./locales";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PrivacyPolicy from "./pages/auth/Privacy";
import Navbar from "./components/Header/Navbar";
import Dashboard from "./pages/cabinet/Dashboard";
import Notfound from "./pages/Notfound";
import Admin from "./pages/Admin/Admin";
import { LangSwitch } from "./context/LangSwitch";
import Loader from "./components/Loader";
import Profile from "./pages/cabinet/Profile";
import Contact from "./pages/Contact";
import About from "./pages/About";
import LotDetail from "./components/Lots/id";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Auctions from "./pages/Auctions";
import Sell from "./pages/Sell";
import Bidding from "./pages/Bid/Bidding";
import { QueryClient, QueryClientProvider } from "react-query";
import ForgotPassword from "./pages/auth/ForgotPassword";
import useCheckUserStatus from "./hooks/checkUserStatus";
import ChatComp from "./components/Chat";
import introImg from './assets/intro.png'
import HowItWorks from "./components/Home/HowItWorks";
import Support from "./components/Support/Support";
import SupportChat from "./components/Support";
import { generateToken, messaging } from "./firebase";
import { onMessage } from "firebase/messaging";
import { toast } from "react-toastify";
import { useUserContext } from "./context/UserContext";

function App() {
  const [currentLang, setCurrentLang] = useState(
    localStorage.getItem("language") || "uz"
  );

  useEffect(() => {
    localStorage.setItem("language", currentLang);
  }, [currentLang]);
  const [showIntro, setShowIntro] = useState(true);
  useCheckUserStatus();
  const { isLoading } = useUserContext();
  const queryClient = new QueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const lastIntroTime = localStorage.getItem("introTimestamp");
  const currentTime = Date.now();

  // Reset if it's been more than 24 hours (86400000 ms)
  if (!lastIntroTime || currentTime - lastIntroTime > 86400000) {
    localStorage.removeItem("hasSeenIntro");
  }

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");

    if (!hasSeenIntro) {
      const timer = setTimeout(() => {
        setShowIntro(false);
        localStorage.setItem("hasSeenIntro", "true");
        localStorage.setItem("introTimestamp", Date.now()); // Store time
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowIntro(false);
    }
  }, []);

  useEffect(() => {
    generateToken();
    onMessage(messaging, (payload) => {
      toast.info(payload);
    });
  }, [])

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        // console.log("Service Worker registered:", registration);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  }

  return (
    <LangSwitch.Provider value={{ currentLang, setCurrentLang }}>
      <IntlProvider locale={currentLang} messages={messages[currentLang]}>
        <QueryClientProvider client={queryClient}>
          {isLoading && <Loader />}
          <div className="z-[100] relative">
            {!isLoading && <ConditionalNavbar />}
          </div>
          {!isLoading && <ConditionalChat />}
          {showIntro &&
            <div className="intro-image">
              <img src={introImg} alt="" />
            </div>
          } {/* Intro Screen */}

          <Routes>
            <Route index element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgotpassword" element={<ForgotPassword />} />
            <Route path="/register" element={<Register />} />
            <Route path="/privacypolicy" element={<PrivacyPolicy />} />
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<HowItWorks />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/support/*" element={<Support />} />
            {/* <Route path="/support/:id" element={<SupportChat />} /> */}
            <Route path="/lots/:id" element={<LotDetail />} />
            <Route path="/lots/bidding/:id" element={<Bidding />} />
            <Route path="/404" element={<Notfound />} />
            <Route path="*" element={<Notfound />} />
          </Routes>
        </QueryClientProvider>
      </IntlProvider>
    </LangSwitch.Provider>
  );
}

function ConditionalNavbar() {
  const location = useLocation();

  const hiddenNavbarRoutes = ["/login", "/register", "/forgotpassword", "/privacypolicy"];
  const isAdminOrDashboardRoute = location.pathname.startsWith("/admin") || location.pathname.startsWith("/dashboard");
  const shouldHideNavbar = hiddenNavbarRoutes.includes(location.pathname) || isAdminOrDashboardRoute;

  return shouldHideNavbar ? null : <Navbar />;
}

function ConditionalChat() {
  const location = useLocation();
  // const user = localStorage.getItem('token') || null;
  const { user } = useUserContext();

  const hiddenChatRoutes = ["/login", "/register", "/forgotpassword", "/privacypolicy", "/support"];
  const isAdminOrDashboardRoute = location.pathname.startsWith("/admin");

  const userHasAdminOrSupportRole = user?.roles?.some(role =>
    role.name === "ADMIN" || role.name === "SUPPORT"
  );

  const shouldHideChat = hiddenChatRoutes.includes(location.pathname) || isAdminOrDashboardRoute || userHasAdminOrSupportRole;

  return shouldHideChat ? null : <ChatComp />;
}



export default App;
