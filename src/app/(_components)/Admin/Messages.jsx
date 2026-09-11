import { getStorageItem } from "@/utils/storage";
import React, { useState } from "react";
import { List, ListItem, ListItemText, Paper, Typography, Divider, Box, Avatar, IconButton } from "@mui/material";
import { AccessTime, ArrowBack, Check, Close, FiberManualRecord, Send } from "@mui/icons-material";
import { useAllCHats, useSupportChats } from "@/queries/chat";
import { markChatAsRead, sendMessageToUser } from "@/queries/chat";
import { useQueryClient } from "@tanstack/react-query";

export default function AdminMessenger() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  // const userId = parseInt(getStorageItem("userId"));
  // const { data: chatsData } = useSupportChats(userId);
  const { data: chatsData } = useAllCHats();

  const handleChatSelect = async (chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);

    // try {
    //   // Use the query function to mark chat as read
    //   await markChatAsRead(chat.chatId, userId);
    //   queryClient.invalidateQueries('supportChats');

    //   // Update chat as read locally
    //   if (chatsData) {
    //     const updatedChats = chatsData.map((c) =>
    //       c.chatId === chat.chatId ? { ...c, isRead: true } : c
    //     );
    //     // Update the state if needed
    //   }
    // } catch (error) {
    //   console.error("Failed to mark chat as read:", error);
    // }
  };

  // const sendMessage = async () => {
  //   if (!newMessage.trim() || !selectedChat) return;

  //   const tempMessage = {
  //     sender: "SUPPORT",
  //     message: newMessage,
  //     createdAt: new Date().toISOString(),
  //     status: "pending"
  //   };

  //   setMessages((prev) => [...prev, tempMessage]);
  //   setNewMessage("");

  //   try {
  //     // Use the query function to send the message
  //     const response = await sendMessageToUser({
  //       receiverId: selectedChat.userSenderId,
  //       chatId: selectedChat.chatId,
  //       message: newMessage
  //     });

  //     if (response.status === 200) {
  //       setMessages((prev) =>
  //         prev.map((msg, index) =>
  //           index === prev.length - 1 ? { ...msg, status: "success" } : msg
  //         )
  //       );
  //     }
  //   } catch (error) {
  //     setMessages((prev) =>
  //       prev.map((msg, index) =>
  //         index === prev.length - 1 ? { ...msg, status: "error" } : msg
  //       )
  //     );
  //   }
  // };

  // const handleKeyPress = (e) => {
  //   if (e.key === "Enter") {
  //     e.preventDefault();
  //     sendMessage();
  //   }
  // };

  return (
    <Box display="flex" height="83vh">
      <Paper sx={{ width: "30%", overflowY: "auto" }}>
        <div className="py-4">
          <Typography variant="h6" sx={{ textAlign: "center" }}>Chatlar</Typography>
        </div>
        <Divider />
        <List>
          {chatsData && chatsData.length > 0 ? (
            chatsData.map((chat) => (
              <ListItem
                button
                key={chat.chatId}
                onClick={() => handleChatSelect(chat)}
                selected={selectedChat?.chatId === chat.chatId}
                className={`transition-all duration-200 ease-in-out mb-2 border-b cursor-pointer ${selectedChat?.chatId === chat.chatId
                  ? "bg-gray-100 shadow-md"
                  : "hover:bg-blue-100"
                  }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <Avatar sx={{ width: 40, height: 40 }} />
                  <ListItemText
                    primary={<Typography variant="body1" className="font-medium">{chat.senderName}</Typography>}
                  />
                </div>
              </ListItem>
            ))
          ) : (
            <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>Chatlar mavjud emas.</Typography>
          )}
        </List>
      </Paper>

      <Paper sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {selectedChat ? (
          <>
            <div className="flex px-2 h-[64px] items-center gap-2">
              <IconButton onClick={() => setSelectedChat(null)}>
                <ArrowBack fontSize="small" />
              </IconButton>
              <Typography variant="h6">{selectedChat.senderName}</Typography>
            </div>
            <Divider />
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.senderName === 'SUPPORT' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${msg.senderName === 'SUPPORT' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'} 
                      px-3 py-2 rounded-lg relative max-w-[80%] break-words`}>
                    <span>{msg.message}</span>
                    <div className="flex justify-between items-end mt-1 text-xs">
                      <span className={msg.senderName === 'SUPPORT' ? "text-white/50" : 'text-gray-400'}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.senderName === "SUPPORT" && (
                        <>
                          {msg.status === 'pending' && <AccessTime fontSize="small" className="text-white ml-1" />}
                          {msg.status === 'success' && <Check fontSize="small" className="text-white ml-1" />}
                          {msg.status === 'error' && <Close fontSize="small" className="text-red-500 ml-1" />}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* <Divider />
            <div className="py-2 px-3 border mx-3 my-4 rounded-full flex items-center">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                className="outline-none bg-transparent w-full"
                placeholder="Type a message..."
              />
              <Send className="text-primary cursor-pointer" onClick={sendMessage} />
            </div> */}
          </>
        ) : (
          <Typography variant="h6" sx={{ p: 4, textAlign: "center" }}>Suhbatni boshlash uchun chatni tanlang!</Typography>
        )}
      </Paper>
    </Box>
  );
}
