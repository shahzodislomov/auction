"use client"
import { getStorageItem } from "@/utils/storage";
import React, { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Divider,
  Box,
  Avatar,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useSocket } from "@/hooks/useStomp";
import SupportChat from ".";
import { markChatAsRead } from "@/queries/chat";
import { Edit, Settings, SettingsOutlined, SupportAgent } from "@mui/icons-material";
import { FormattedMessage } from "react-intl";
import { useUserContext } from "@/context/UserContext";

export default function Support() {
  const [chatsData, setChatsData] = useState([]);
  const stompClient = useSocket();
  const userId = parseInt(getStorageItem("userId"));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // Detect mobile screen
  const { userSenderId } = useParams(); // Get the opened chat ID
  const pathname = usePathname(); // Get the current location
  const isChatOpen = pathname.includes("/support/"); // Determine if a chat is open based on the URL

  const { user } = useUserContext();

  useEffect(() => {
    if (stompClient && stompClient.connected) {
      const subscription = stompClient.subscribe("/topic/chat/getSupportChats", (message) => {
        const rawData = JSON.parse(message.body);
        // console.log("Received WebSocket data:", rawData);

        const bidsArray = rawData.data ? rawData.data : rawData;
        if (bidsArray && bidsArray.chats) {
          setChatsData(bidsArray.chats);
        } else {
          // console.warn("No chats found in WebSocket response:", bidsArray);
          setChatsData([]);
        }
      });

      // Fetch initial chats data
      stompClient.publish({
        destination: "/app/chat/getSupportChats",
        body: JSON.stringify({
          senderId: userId,
        }),
      });

      // Cleanup subscription on component unmount
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [stompClient, userId]);

  return (
    <Box display="flex" height="90vh" mt='64px'>
      {/* Chat list - Fully hidden on mobile when a chat is open */}
      {!(isMobile && isChatOpen) && (
        <Paper
          sx={{
            width: { xs: "100%", sm: "30%" }, // Full width on mobile, 30% on larger screens
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            bgcolor: "#e5e7eb",
          }}
        >
          <div className="p-4 flex items-center justify-between gap-2">
            <div className="bg-primary text-white p-2 rounded-full">
              <SupportAgent />
            </div>
            <div className="flex flex-col">
              {user && (
                <div className="text-primary font-semibold">
                  {user.firstname + " " + user.lastname}
                </div>
              )}
              <Chip label="Support" size="small" />
            </div>
            <Link href="/dashboard/profile" className="ml-auto">
              <IconButton>
                <Settings sx={{ color: "gray", justifyContent: "flex-end" }} />
              </IconButton>
            </Link>
          </div>
          <Divider />
          <List>
            {chatsData && chatsData.length > 0 ? (
              chatsData.map((chat) => (
                <Link
                  href={`/support/${chat.userSenderId}`}
                  onClick={() => markChatAsRead(chat.chatId, userId)}
                  key={chat.userSenderId}
                >
                  <ListItem button className="transition-all duration-200 ease-in-out mb-2 border-b cursor-pointer">
                    <div className="flex items-center gap-3 w-full justify-between">
                      <Avatar sx={{ width: 40, height: 40 }} />
                      <ListItemText
                        primary={
                          <div className="block">
                            <Typography variant="body1" className="font-medium">
                              {chat.senderName || "User"}
                            </Typography>
                            <div className="text-[14px] text-gray-500">
                              {chat?.messages[0]?.message}
                            </div>
                          </div>
                        }
                      />
                      <div className="flex flex-col justify-start items-end">
                        <div className="text-gray-500 text-[12px]">
                          {chat?.messages[0]?.createdAt?.split(" ")[1].slice(0, 5)}
                        </div>
                        {!chat.isRead && <div className="bg-primary w-2 h-2 rounded-full"></div>}
                      </div>
                    </div>
                  </ListItem>
                </Link>
              ))
            ) : (
              <Typography variant="body2" sx={{ p: 2, textAlign: "center" }}>
                <FormattedMessage id="nochats" />
              </Typography>
            )}
          </List>
        </Paper>
      )}

      {/* Chat window - Takes full width on mobile when open */}
      <Box sx={{ flex: 1, width: { xs: "100%", sm: "70%" } }}>
        {userSenderId && <SupportChat />}
      </Box>
    </Box>
  );
}