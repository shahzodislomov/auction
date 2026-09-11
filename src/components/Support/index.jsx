"use client"
import { getStorageItem } from "@/utils/storage";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSocket } from "@/hooks/useStomp";
import { markChatAsRead, sendMessageToUser } from "@/queries/chat";
import { useQueryClient } from "@tanstack/react-query";
import { Divider, IconButton, Paper, Typography, CircularProgress } from "@mui/material";
import { AccessTime, ArrowBack, Check, Close, Send } from "@mui/icons-material";
import { useIntl } from "react-intl";

const SupportChat = () => {
  const { userSenderId } = useParams();
  const [chat, setChat] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Loading state added
  const stompClient = useSocket();
  const queryClient = useQueryClient();
  const userId = parseInt(getStorageItem("userId"));
  const router = useRouter();
  const messagesEndRef = useRef(null);
  const intl = useIntl();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!stompClient || !userSenderId) return;

    setIsLoading(true); // Start loading

    const subscription = stompClient.subscribe(
      `/topic/chat/getAllChatMessagesSupportToUser/${userSenderId}/${userId}`,
      (message) => {
        const rawData = JSON.parse(message.body);
        const bidsArray = rawData.data ? rawData.data : rawData;
        setChat(bidsArray);
        setMessages(bidsArray.messages);
        setIsLoading(false); // Stop loading
      }
    );

    stompClient.publish({
      destination: `/app/chat/getAllChatMessagesSupportToUser/${userSenderId}/${userId}`,
    });

    return () => subscription.unsubscribe();
  }, [stompClient, userSenderId, userId, queryClient]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !userSenderId) return;

    const tempMessage = {
      messageOwner: "SUPPORT",
      message: newMessage,
      createdAt: new Date().toISOString(),
      status: "pending"
    };

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const response = await sendMessageToUser({
        receiverId: userSenderId,
        chatId: chat.chatId,
        message: newMessage
      });

      if (response.status === 200) {
        setMessages((prev) =>
          prev?.map((msg, index) =>
            index === prev.length - 1 ? { ...msg, status: "success" } : msg
          )
        );
      }
    } catch (error) {
      setMessages((prev) =>
        prev?.map((msg, index) =>
          index === prev.length - 1 ? { ...msg, status: "error" } : msg
        )
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      markChatAsRead(chat.chatId, userId);
    }
  };

  return (
    <Paper sx={{ flex: 1, display: "flex", flexDirection: "column", height: '90vh', width: '100%' }}>
      <div className="flex px-2 h-[64px] items-center gap-2">
        <IconButton onClick={() => router.push('/support')}>
          <ArrowBack fontSize="small" />
        </IconButton>
        <Typography variant="h6">{chat.senderName}</Typography>
      </div>
      <Divider />

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center flex-1">
          <CircularProgress />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages?.map((msg, index) => (
            <div key={index} className={`flex ${msg.messageOwner === 'SUPPORT' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${msg.messageOwner === 'SUPPORT' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'} 
                        px-3 py-2 rounded-lg relative max-w-[80%] break-words`}>
                <span>{msg.message}</span>
                <div className="flex justify-between items-end mt-1 text-xs">
                  <span className={msg.messageOwner === 'SUPPORT' ? "text-white/50" : 'text-gray-400'}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {msg.messageOwner === "SUPPORT" && (
                    <>
                      {msg.status === 'pending' && <AccessTime fontSize="small" className="text-white ml-1" />}
                      {msg.status === 'success' && <Check fontSize="small" className="text-white ml-1" />}
                      {msg.status === 'error' && <Close fontSize="small" className="text-red-500 ml-1" />}
                    </>
                  )}
                </div>
              </div>
              <div ref={messagesEndRef} />
            </div>
          ))}
        </div>
      )}

      <Divider />
      <div className="py-2 px-3 border mx-3 my-4 rounded-full flex items-center">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          className="outline-none bg-transparent w-full"
          placeholder={intl.formatMessage({ id: 'writemessage' })}
        />
        <Send className="text-primary cursor-pointer" onClick={sendMessage} />
      </div>
    </Paper>
  );
};

export default SupportChat;
