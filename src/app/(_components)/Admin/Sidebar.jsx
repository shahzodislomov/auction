import React, { useState } from "react";
import { List, ListItemIcon, ListItemText, ListItem, Collapse } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import SourceIcon from "@mui/icons-material/Source";
import PaymentIcon from "@mui/icons-material/Payment";
import NextLink from "next/link";
import { AccountToggle } from "./AccountToggle";
import { useIntl } from "react-intl";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab, user }) => {
    const [open, setOpen] = useState(true);
    const intl = useIntl();

    const adminMenu = [
        { icon: <DashboardIcon />, text: "Dashboard", slug: "" },
        { icon: <PeopleIcon />, text: "Users", slug: "users" },
        { icon: <SettingsIcon />, text: "Managelots", slug: "managelots" },
        { icon: <SettingsIcon />, text: "VehicleDictionaries", slug: "vehicle-references" },
        {
            icon: <SettingsIcon />,
            text: "Managelottypes",
            slug: "managelottypes",
            subMenu: [
                { text: "lottypes", slug: "managelottypes" },
                { text: "subtypes", slug: "managelottypes/subtypes" },
                { text: "attributes", slug: "managelottypes/attributes" },
            ]
        },
        { icon: <SettingsIcon />, text: "Managebids", slug: "managebids" },
        { icon: <SourceIcon />, text: "Moderatecontent", slug: "moderatecontent" },
        { icon: <PaymentIcon />, text: "Paymenthistory", slug: "paymenthistory" },
    ];

    return (
        <div
            className={`fixed top-0 left-0 h-full p-2 md:p-0 transition-transform bg-gray-100 shadow-lg ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                } lg:relative lg:translate-x-0 lg:shadow-none`}
            style={{ width: 320, overflowY: "auto", zIndex: 20 }}
            onClick={(e) => e.stopPropagation()}
        >
            <AccountToggle user={user} />
            <List>
                {adminMenu.map((navItem) => (
                    <React.Fragment key={navItem.slug}>
                        <ListItem button
                            onClick={() => {
                                if (navItem.subMenu) {
                                    setOpen(!open);
                                } else {
                                    setActiveTab(navItem.slug);
                                }
                                setIsSidebarOpen(false);
                            }}
                            component={NextLink}
                            href={!navItem.subMenu ? `/admin/${navItem.slug}` : "#"}
                            className={`${activeTab === navItem.slug ? 'bg-gray-100' : ''}`}
                        >
                            <ListItemIcon>{navItem.icon}</ListItemIcon>
                            <ListItemText primary={intl.formatMessage({ id: navItem.text })} />
                            {navItem.subMenu && (open ? <ExpandLess /> : <ExpandMore />)}
                        </ListItem>

                        {/* Submenu items */}
                        {navItem.subMenu && (
                            <Collapse in={open} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {navItem.subMenu.map((sub) => (
                                        <ListItem
                                            onClick={() => {
                                                setActiveTab(sub.slug);
                                            }}
                                            button
                                            key={sub.slug}
                                            component={NextLink}
                                            href={`/admin/${sub.slug}`}
                                            sx={{ pl: 8 }}
                                            className={`${activeTab === sub.slug ? "bg-gray-100" : ""}`}
                                        >
                                            <ListItemText primary={intl.formatMessage({ id: sub.text })} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </React.Fragment>
                )
                    //   navItem.subMenu ? (
                    //     <Accordion key={i} disableGutters>
                    //       <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    //         <ListItemIcon>{navItem.icon}</ListItemIcon>
                    //         <ListItemText primary={navItem.text} />
                    //       </AccordionSummary>
                    //       <AccordionDetails>
                    //         <List disablePadding>
                    //           {navItem.subMenu.map((subItem, j) => (
                    //             <ListItemButton
                    //               key={j}
                    //               selected={activeTab === subItem.slug}
                    //               onClick={() => {
                    //                 navigate(`/admin/${subItem.slug}`);
                    //                 setActiveTab(subItem.slug);
                    //                 setIsSidebarOpen(false);
                    //               }}
                    //               sx={{ pl: 4 }}
                    //             >
                    //               <ListItemText primary={subItem.text} />
                    //             </ListItemButton>
                    //           ))}
                    //         </List>
                    //       </AccordionDetails>
                    //     </Accordion>
                    //   ) : (
                    //     <ListItemButton
                    //       key={i}
                    //       selected={activeTab === navItem.slug}
                    //       onClick={() => {
                    //         navigate(`/admin/${navItem.slug}`);
                    //         setActiveTab(navItem.slug);
                    //         setIsSidebarOpen(false);
                    //       }}
                    //     >
                    //       <ListItemIcon>{navItem.icon}</ListItemIcon>
                    //       <ListItemText primary={navItem.text} />
                    //     </ListItemButton>
                    //   )
                )}
            </List>
        </div>
    );
};

export default Sidebar;
