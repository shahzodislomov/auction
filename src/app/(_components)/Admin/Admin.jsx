"use client"
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Loader from '@/components/Loader';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import SourceIcon from "@mui/icons-material/Source";
import PaymentIcon from "@mui/icons-material/Payment";
import Dashboard from "./Dashboard";
import Messages from "./Messages";
import Users from "./Users";
import PaymentHistory from "./PaymentHistory";
import ModerateContent from "./ModerateContent";
import ManageBids from "./ManageBids";
import LangSwitch from "@/components/Header/LangSwitch";
import ManageLots from "./ManageLots";
import ManageLotTypes from "./lot-types/ManageLotTypes";
import VehicleReferences from "./VehicleReferences";
import { ArrowBack, Chat, DashboardOutlined, Home, Logout, LogoutOutlined, SupportAgent } from "@mui/icons-material";
import useAuthRedirect from '@/hooks/authRedirect'
import MySwal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { useUserContext } from "@/context/UserContext";
import { AccountToggle } from "./AccountToggle";
import { CalendarIcon } from "@mui/x-date-pickers";
import Sidebar from "./Sidebar";
import { hasAnyRole } from "@/features/user-v2/roles.mjs";

function Content() {
  const { user, logout } = useUserContext();
  // const user = userResponse?.data || ""
  const router = useRouter();
  const location = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const intl = useIntl()

  // Define menu items
  const adminMenu = [
    { icon: <DashboardIcon />, text: "Dashboard", slug: "" },
    { icon: <Chat />, text: "Messages", slug: "messages" },
    { icon: <PeopleIcon />, text: "Users", slug: "users" },
    { icon: <SettingsIcon />, text: "Manage lots", slug: "managelots" },
    { icon: <SettingsIcon />, text: "Vehicle dictionaries", slug: "vehicle-references" },
    { icon: <SettingsIcon />, text: "Manage lot types", slug: "managelottypes" },
    { icon: <SettingsIcon />, text: "Manage bids", slug: "managebids" },
    { icon: <SourceIcon />, text: "Moderate content", slug: "moderatecontent" },
    { icon: <PaymentIcon />, text: "Payment history", slug: "paymenthistory" },
  ];

  const basePath = "/admin";

  // Set the default active tab based on the current path or fallback to the first tab
  const getDefaultActiveTab = () => {
    const currentPath = location.replace(basePath, "").replace("/", "");
    const matchingTab = adminMenu.find((menu) => menu.slug === currentPath);
    return matchingTab ? currentPath : adminMenu[0].slug;
  };

  useAuthRedirect();

  const [activeTab, setActiveTab] = useState(getDefaultActiveTab());
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  useEffect(() => {
    setActiveTab(getDefaultActiveTab()); // Update active tab on location change
  }, [location]);

  useEffect(() => {
    if (user !== undefined) {
      setIsLoading(false);
      if (!hasAnyRole(user, ["ADMIN", "MODERATOR"])) {
        router.push('/404');
      }
    }
  }, [user, router]);

  if (isLoading) {
    return <Loader />
  }

  const handleLogout = () => {
    handleMenuClose()
    MySwal.fire({
      title: intl.formatMessage({ id: 'logouttitle' }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: intl.formatMessage({ id: 'logoutconfirm' }),
      cancelButtonText: intl.formatMessage({ id: 'cancel' })
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        router.push("/login");
      }
    });
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100 p-3">

      {/* Main Layout */}
      <div className="flex flex-grow">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity flex md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        <Sidebar
          user={user}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        {/* Sidebar
        <Box
          className={`fixed top-0 left-0 h-full p-2 md:p-0 transform transition-transform duration-300 ease-in-out bg-gray-100 shadow-lg ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            } lg:relative lg:translate-x-0 lg:shadow-none`}
          sx={{
            width: 320,
            color: "#000",
            overflowY: "auto",
            zIndex: 20,
          }}
          onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the sidebar
        >
          <AccountToggle user={user} />
          <div className="space-y-1">
            {adminMenu.map((navItem, i) => (
              <button
                key={i}
                className={`flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-[box-shadow,_background-color,_color] ${activeTab === navItem.slug
                  ? "bg-white text-stone-950 shadow"
                  : "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"
                  }`}
                onClick={() => {
                  navigate(`${basePath}/${navItem.slug}`);
                  setActiveTab(navItem.slug);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
              >
                <ListItemIcon sx={{ color: "" }}>{navItem.icon}</ListItemIcon>
                <span>{navItem.text}</span>
              </button>
            ))}
          </div>
        </Box> */}

        {/* Content Area */}
        <div className="bg-white rounded-lg pb-4 shadow w-full sm:ml-2">
          {/* Top Navbar */}
          {/* <Box
            className="py-4 px-6 bg-[#1c2536] shadow-md flex items-center justify-between"
            sx={{
              flexShrink: 0, // Prevent the navbar from shrinking
            }}
          >
            <div className="flex gap-2 items-center">
              <IconButton
                onClick={() => navigate(-1)}
                color="primary"
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
              >
                <ArrowBack />
              </IconButton>
              <IconButton
                onClick={() => setIsSidebarOpen((prev) => !prev)}
                color="primary"
                aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                sx={{
                  display: { xs: "flex", md: "none" },
                }}
              >
                {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
              <div onClick={() => navigate("/")} className="hidden md:flex cursor-pointer text-xl font-semibold text-white">
                Admin
              </div>
            </div>
            <div
              onClick={() => navigate("/")}
              className="flex md:hidden cursor-pointer text-xl font-semibold text-white"
            >
              Admin
            </div>
            <div className="flex items-center gap-2">
              <LangSwitch Tcolor="text-white" />
              {user ? (
                <>
                  <Tooltip title={<FormattedMessage id="Account" />}>
                    <IconButton
                      onClick={handleMenuOpen}
                      size="small"
                      aria-controls={open ? "account-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? "true" : undefined}
                    >
                      <Avatar alt={user?.firstname || "User"}>
                        {user?.firstname?.charAt(0)}
                      </Avatar>
                    </IconButton>
                  </Tooltip>

                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={open}
                    onClose={handleMenuClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        border: '1px solid #c2c2c2',
                        overflow: "visible",
                        mt: 1.5,
                        "&::before": {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: "background.paper",
                          transform: "translateY(-50%) rotate(45deg)",
                          zIndex: 0,
                          borderTop: '1px solid #c2c2c2',
                          borderLeft: '1px solid #c2c2c2'
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <Typography textAlign="left" pl={2} py={1}>{user?.firstname || "N/A"}</Typography>
                    <Link href="/dashboard">
                      <MenuItem onClick={handleMenuClose}>
                        <ListItemIcon><DashboardOutlined /></ListItemIcon>
                        <FormattedMessage id="Dashboard" />
                      </MenuItem>
                    </Link>

                    {user?.roles?.some((role) => role.name === "SUPPORT") && (
                      <Link href="/support">
                        <MenuItem onClick={handleMenuClose}>
                          <ListItemIcon><SupportAgent /></ListItemIcon>
                          <FormattedMessage id="Support" defaultMessage="Support" />
                        </MenuItem>
                      </Link>
                    )}

                    <Divider />

                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon><Logout /></ListItemIcon>
                      <FormattedMessage id="Logout" />
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-white bg-secondary py-1 px-4 rounded-full transition-all"
                >
                  <FormattedMessage id="Login" />
                </Link>
              )}
            </div>
          </Box> */}
          <div className="border-b px-4 mb-4 mt-2 pb-4 border-stone-200">
            <div className="flex items-center justify-between p-0.5">
              <div className="flex items-center gap-2">
                <IconButton
                  onClick={() => setIsSidebarOpen((prev) => !prev)}
                  color="primary"
                  aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
                  sx={{
                    display: { xs: "flex", md: "none" },
                  }}
                >
                  {isSidebarOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
                <div className="flex items-center gap-1">
                  <div onClick={() => router.push('/')} className="text-sm gap-2 bg-stone-100 transition-colors hover:bg-stone-200 text-primary px-3 py-1.5 rounded"><Home /></div>
                  <div className="">
                    <span className="text-sm font-bold block">Auction Admin</span>
                    <span className="text-xs block text-stone-500">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex text-sm text-primary items-center gap-2 bg-stone-100 transition-colors hover:bg-stone-200 px-3 py-1.5 rounded">
                <LogoutOutlined />
                <span><FormattedMessage id='Logout' /></span>
              </button>
            </div>
          </div>
          <Box
            // flexGrow={1}
            // className="p-6 bg-gray-100 overflow-auto"
            sx={{
              height: "calc(100vh - 64px)",
              px: 2
            }}
          >
            {(() => {
              const path = location.replace(basePath, "").replace("/", "");
              switch(path) {
                case "users": return <Users />;
                case "managelots": return <ManageLots />;
              case "vehicle-references": return <VehicleReferences />;
              case "vehicle-references/models": return <VehicleReferences />;
              case "managelottypes": return <ManageLotTypes />;
                case "managebids": return <ManageBids />;
                case "moderatecontent": return <ModerateContent />;
                case "paymenthistory": return <PaymentHistory />;
                default: return <Dashboard />;
              }
            })()}
          </Box>
        </div>
      </div>
    </div>
  );
}

export default Content;
