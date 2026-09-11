"use client"
import React, { useEffect, useRef, useState } from "react";
/// good for testing
import {
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useSocket } from "@/hooks/useStomp";
import { FormattedMessage } from "react-intl";

const NotificationModal = ({ onClose, userId }) => {
  const stompClient = useSocket();
  const [notifData, setNotifData] = useState([]);
  useEffect(() => {
    if (stompClient && stompClient.connected && userId) {
      const subscription = stompClient.subscribe(`/topic/notification/getAllNotifications/${userId}`, (message) => {
        const rawData = JSON.parse(message.body);
        // console.log("Received WebSocket data:", rawData);
        const notifsArray = rawData.data ? rawData.data : rawData;

        if (Array.isArray(notifsArray)) {
          setNotifData((prevNotifs) => {
            const combinedNotifs = [...notifsArray, ...prevNotifs];
            const uniqueNotifs = combinedNotifs.filter(
              (notif, index, self) => index === self.findIndex(n => n.id === notif.id)
            );
            return uniqueNotifs;
          });
        }
      });

      stompClient.publish({
        destination: `/app/notification/getAllNotifications/${userId}`,
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [stompClient, userId]);
  const modalRef = useRef(null); // Ref to track modal content

  // Handle clicks outside of the modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-end items-start z-[999]" onClick={onClose}>
      {/* Modal Content */}
      <div
        ref={modalRef} // Attach ref to modal box
        className="bg-white shadow-xl w-full md:w-[400px] flex flex-col rounded-2xl overflow-y-auto border border-primary mt-14 mr-6"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2} className="bg-gray-100">
          <div className="flex items-center gap-2">
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
            <div className="text-primary text-lg font-semibold">
              <FormattedMessage id='notifs' />
            </div>
          </div>
        </Box>
        <Divider />
        <List className="p-2 space-y-1 overflow-y-auto max-h-[50vh]">
          {notifData.length > 0 ? (
            notifData.map((notification, i) => (
              <ListItem key={i} className={`${notification.isRead ? 'bg-gray-100' : 'bg-blue-100'} shadow-sm`}>
                <ListItemText
                  primary={
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">{notification.title}</span>
                      <span className="text-medium text-gray-800">{notification.body}</span>
                    </div>
                  }
                  secondary={<span className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>}
                />
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" className="text-center p-4">
              <FormattedMessage id='nonotifs' />
            </Typography>
          )}
        </List>
      </div>
    </div>
  );
};

export default NotificationModal;
