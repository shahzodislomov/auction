"use client"
import { getStorageItem } from "@/utils/storage";
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Drawer,
  CssBaseline,
  Toolbar,
  IconButton,
  Divider,
  Collapse,
  Chip,
  Breadcrumbs,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountBalance,
  Gavel,
  Favorite,
  Close,
  ManageAccounts,
  ExpandLess,
  ExpandMore,
  FiberManualRecord,
  Logout,
  SpaceDashboard,
  Person,
  CircleNotifications,
  Payment,
  VerifiedUser,
  DirectionsCar,
} from "@mui/icons-material";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { usePathname, useRouter } from "next/navigation";
import NextLink from "next/link";
import Profile from "./Profile";
import Likes from "./Likes";
import Transactions from "./Transactions";
import MyAuctions from "./MyAuctions";
import Mylots from "./Mylots";
import Kyc from "./Kyc";
import { VehicleCreate, VehicleDetail, VehicleEdit, VehicleList } from "./Vehicles";
import { FormattedMessage, useIntl } from "react-intl";
import Createlot from "@/components/Lots/create/Createlot";
import LangSwitch from "@/components/Header/LangSwitch";
import useAuthRedirect from '@/hooks/authRedirect'
import UserDashboard from "./UserDashboard";
import NotificationModal from "./NotificationsModal";
import { AnimatePresence, motion } from 'framer-motion';
// import { useNotifications } from "@/context/NotificationProvider";
import MySwal from "sweetalert2";
import { useUserContext } from "@/context/UserContext";
import RoleChips from "@/components/user-v2/RoleChips";
import { hasUserRole } from "@/features/user-v2/roles.mjs";


const drawerWidth = 240;

export default function SidebarMenu() {
  // Fetch user data
  const { user, logout } = useUserContext();
  // const user = userResponse?.data || {};
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const intl = useIntl();
  const userId = getStorageItem('userId')
  const [notifs, setNotifs] = useState(false);

  // const { hasNewNotifications } = useNotifications();

  useAuthRedirect();


  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const cabinetMenu = [
    { icon: <SpaceDashboard />, slug: "", intl: "Dashboard" },
    ...(hasUserRole(user)
      ? [{ icon: <Gavel />, text: "My lots", slug: "my-lots", intl: "Mylots" }]
      : []),
    {
      icon: <AccountBalance />,
      slug: "my-auctions",
      intl: "Myauctions",
      submenu: [
        { intl: "MyAActive", slug: "my-auctions", color: "primary" },
        { intl: "MyAPending", slug: "my-auctions/pending", color: "warning" },
        { intl: "MyAWinning", slug: "my-auctions/winning", color: "success" },
        // { text: "Finished", slug: "my-auctions/finished", color: "" },
        // { text: "Canceled", slug: "my-auctions/canceled", color: "error" },
      ],
    },
    { icon: <Favorite />, slug: "likes", intl: "Likedlots" },
    { icon: <Payment />, slug: "transactions", intl: "Myfinance" },
    { icon: <DirectionsCar />, slug: "vehicles", intl: "vehicle.menu" },
    { icon: <VerifiedUser />, slug: "kyc", intl: "kyc.menu" },
    { icon: <ManageAccounts />, slug: "profile", intl: "Profile" },
  ];



  const basePath = '/dashboard';
  // Set the default active tab based on the current path or fallback to the first tab
  const getDefaultActiveTab = () => {
    // Get the path excluding basePath (e.g., '/dashboard')
    const currentPath = location.replace(basePath, "").replace("/", "");

    // Check if the path matches the main slug or a submenu path
    const matchingTab = cabinetMenu.find((menu) => {
      // Check if the path matches the main menu slug
      if (menu.slug === currentPath) return true;
      if (menu.slug && currentPath.startsWith(`${menu.slug}/`)) return true;

      // Check if the path matches any submenu path
      return menu.submenu && menu.submenu.some((sub) => sub.slug === currentPath);
    });

    return matchingTab ? matchingTab.slug : cabinetMenu[0].slug;
  };

  const [activeTab, setActiveTab] = useState(getDefaultActiveTab());

  useEffect(() => {
    setActiveTab(getDefaultActiveTab());
  }, [location]);

  const handleLogout = () => {
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

  const getBreadcrumbs = (activeTab) => {
    const [slug, subslug] = activeTab.split('/');

    // Find the main menu item
    const mainMenuItem = cabinetMenu.find(item => item.slug === slug);

    // Check if main menu exists
    if (!mainMenuItem) {
      return (
        <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ color: 'white', flexWrap: 'wrap' }}>
          <NextLink href='/'>
            <FormattedMessage id="Home" />
          </NextLink>
          <NextLink>
            <FormattedMessage id="Dashboard" />
          </NextLink>
        </Breadcrumbs>
      );
    }

    // Check if submenu exists and subslug is present
    if (mainMenuItem.submenu && subslug) {
      const subMenuItem = mainMenuItem.submenu.find(sub => sub.slug === `${slug}/${subslug}`);
      if (subMenuItem) {
        return (
          <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ color: 'white', flexWrap: 'wrap' }}>
            <NextLink href='/'>
              <FormattedMessage id='Home' />
            </NextLink>
            <NextLink href='/dashboard'>
              <FormattedMessage id='Dashboard' />
            </NextLink>
            <NextLink href={`/${mainMenuItem.slug}`}>
              <FormattedMessage id={mainMenuItem.intl} />
            </NextLink>
            <Typography>
              <FormattedMessage id={subMenuItem.intl} />
            </Typography>
          </Breadcrumbs>
        );
      }
    }

    // If no submenu or subslug
    return (
      <Breadcrumbs separator="›" aria-label="breadcrumb" sx={{ color: 'white', flexWrap: 'wrap' }}>
        <NextLink href='/'>
          <FormattedMessage id='Home' />
        </NextLink>
        {
          mainMenuItem.intl !== "Dashboard" && (
            <NextLink href='/dashboard'>
              <FormattedMessage id='Dashboard' />
            </NextLink>
          )
        }
        <Typography>
          <FormattedMessage id={mainMenuItem.intl} />
        </Typography>
      </Breadcrumbs>
    );
  };

  const drawer = (
    <Box sx={{
      overflow: "scroll",
      scrollbarWidth: "none", /* Firefox */
      "&::-webkit-scrollbar": { display: "none" },
    }}>
      <NextLink href='/'>
        <Box sx={{ px: 2, textAlign: "center" }} className="bg-primary text-white">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              sx={{ mr: 2 }}
            >
              <ArrowBackIosNewIcon />
            </IconButton>
            <Typography variant="h8" noWrap>
              <FormattedMessage id="Home" />
            </Typography>
          </Toolbar>
        </Box>
      </NextLink>
      <Divider />
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Chip
          label={
            <div className="text-[18px]">
              {user?.firstname || 'User'}
            </div>}
          icon={<Person />}
          sx={{ cursor: 'pointer' }}
          component={NextLink}
          href='/dashboard/profile'
        />
      </Box>
      <Divider />
      <List>
        {cabinetMenu.map((item) => (
          <React.Fragment key={item.slug}>
            <ListItem button
              onClick={() => {
                if (item.submenu) {
                  setOpen(!open); // Toggle submenu if clicked
                } else {
                  setActiveTab(item.slug); // Set active tab for main menu item
                }
                setMobileOpen(false)
              }}
              component={NextLink}
              href={!item.submenu ? `${basePath}/${item.slug}` : "#"}
              className={`${activeTab === item.slug ? "bg-gray-100" : ""}`} // Apply active class for main menu
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={intl.formatMessage({ id: item.intl })} />
              {item.submenu && (open ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>

            {/* Submenu Items */}
            {item.submenu && (
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((sub) => (
                    <ListItem
                      onClick={() => {
                        setActiveTab(sub.slug); // Set active tab for submenu item
                      }}
                      button
                      key={sub.slug}
                      component={NextLink}
                      href={`${basePath}/${sub.slug}`}
                      sx={{ pl: 8 }}
                      className={`${activeTab === sub.slug ? "bg-gray-100" : ""}`} // Apply active class for submenu
                    >
                      <FiberManualRecord color={sub.color} sx={{ mr: 1 }} />
                      <ListItemText primary={intl.formatMessage({ id: sub.intl })} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
        <ListItem button
          onClick={handleLogout}
          className="cursor-pointer"
        >
          <ListItemIcon><Logout /></ListItemIcon>
          <ListItemText primary={intl.formatMessage({ id: 'Logout' })} />
        </ListItem>
      </List>
    </Box >
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />
      <Box
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "#1E88E5",
          padding: 0,
          zIndex: 999
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', position: 'relative', width: "100%", px: { xs: 1, sm: 2 } }}>
          <div className="flex items-center">
            <IconButton
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mx: 1, display: { md: "none" }, color: 'white' }}
            >
              {mobileOpen ? <Close /> : <MenuIcon />}
            </IconButton>
            <Typography variant="h6" noWrap sx={{ display: { xs: 'none', md: 'flex' } }}>
              {getBreadcrumbs(activeTab)}
            </Typography>
          </div>
          <div className="flex items-center relative gap-2">
            <Box sx={{ bgcolor: 'white', color: 'black', borderRadius: 1, px: 1, py: 0.5, maxWidth: { xs: 140, sm: 320 } }}>
              <RoleChips roles={user?.roles || []} />
            </Box>
            <LangSwitch Tcolor="text-white" />

            <Chip
              sx={{ bgcolor: 'white', cursor: 'pointer', ":hover": { bgcolor: '#e5e7eb' } }}
              icon={
                <CircleNotifications color="primary" />
              }
              label={<div className="text-primary text-[16px]"><FormattedMessage id='notifs' /></div>}
              onClick={() => setNotifs((prev) => !prev)}
            />
          </div>
        </Toolbar>
      </Box>
      <AnimatePresence>
        {notifs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: "easeInOut" }}
            className="fixed bottom-0 right-0 z-[99999] p-2 sm:p-4"
          >
            <NotificationModal
              onClose={() => setNotifs(false)}
              userId={userId}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { sm: 0 }, zIndex: 999 }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              height: '100vh',
              top: 0,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          p: { xs: 1, sm: 3 },
          mt: { xs: '56px', sm: '64px' },
        }}
      >
        {(() => {
          const path = location.replace(basePath, "").replace("/", "");
          // Handle nested paths like "my-auctions/pending"
          if (path.startsWith("my-auctions")) return <MyAuctions />;
          if (path === "vehicles") return <VehicleList />;
          if (path === "vehicles/create") return <VehicleCreate />;
          if (path.startsWith("vehicles/") && path.endsWith("/edit")) {
            return <VehicleEdit vehicleId={path.replace("vehicles/", "").replace("/edit", "")} />;
          }
          if (path.startsWith("vehicles/")) {
            return <VehicleDetail vehicleId={path.replace("vehicles/", "")} />;
          }
          switch(path) {
            case "profile": return <Profile />;
            case "my-lots": return <Mylots />;
            case "kyc": return <Kyc />;
            case "createlot": return <Createlot />;
            case "transactions": return <Transactions />;
            case "likes": return <Likes />;
            default: return <UserDashboard balance={user?.balance} userId={userId} />;
          }
        })()}
      </Box>
    </Box>
  );
}
