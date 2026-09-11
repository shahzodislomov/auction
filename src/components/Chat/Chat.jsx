import { useState, useEffect, useRef } from "react";
import { AccessTime, Check, Close, Login, QuestionAnswer, Send, SupportAgent } from "@mui/icons-material";
import { Divider, Modal } from "@mui/material";
import { api } from "@/api/api";
import { FormattedMessage, useIntl } from "react-intl";
import { useSocket } from "@/hooks/useStomp";
import LoginModal from "@pages/auth/LoginModal";
import { useUserContext } from "@/context/UserContext";

export default function Chat({ senderId, setOpen }) {
  const [chat, setChat] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const { isAuthenticated } = useUserContext();
  const chatRef = useRef(null);
  const intl = useIntl();

  const stompClient = useSocket();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        if (isLoginModalOpen) {
          setOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  useEffect(() => {
    if (stompClient && stompClient.connected) {
      const subscription = stompClient.subscribe(`/topic/chat/getAllChatMessagesUserToSupport/${senderId}`, (message) => {
        const rawData = JSON.parse(message.body);
        // console.log("Received WebSocket data:", rawData);

        const bidsArray = rawData.data ? rawData.data : rawData;
        setChat(bidsArray.chat);
        setMessages(bidsArray.chat.messages);
      });

      stompClient.publish({
        destination: `/app/chat/getAllChatMessagesUserToSupport/${senderId}`
      });


      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [stompClient, senderId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMessage = {
      id: Date.now(),
      senderId,
      message: newMessage,
      createdAt: new Date().toISOString(),
      sender: "USER",
      status: "pending",
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const response = await api.post("/chat/sendMessageToSupport", { senderId, message: newMessage });

      if (response.status === 200) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempMessage.id ? { ...msg, status: "success" } : msg
          )
        );
      } else {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempMessage.id ? { ...msg, status: "error" } : msg
          )
        );
      }
    } catch (error) {
      // console.error("Error sending message:", error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempMessage.id ? { ...msg, status: "error" } : msg
        )
      );
    }
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="relative">
      <div ref={chatRef} className="!fixed bottom-0 md:!bottom-5 right-0 md:!right-5 !bg-gray-100 !shadow-2xl w-full md:!w-[400px] h-full md:!h-[90vh] !flex !flex-col md:!rounded-[25px] !overflow-hidden z-[999] border border-primary">
        <div className="!flex !items-center !justify-between !bg-primary !text-white !px-2 mx-3 my-3 rounded-full">
          <div className="bg-white rounded-full text-primary flex justify-center items-center p-1" onClick={() => setOpen(false)}>
            <SupportAgent fontSize="small" />
          </div>
          <div className="!py-2 !text-center !font-semibold"><FormattedMessage id="support" /></div>
          <div className="bg-white rounded-full text-primary flex justify-center items-center p-1 cursor-pointer" onClick={() => setOpen(false)}>
            <Close fontSize="small" />
          </div>
        </div>
        <Divider />
        <div
          ref={chatContainerRef}
          className="!flex-1 !overflow-y-auto !p-4 !space-y-2 scrollbar-hidden"
        >
          {isAuthenticated ? (
            messages?.length === 0 ? (
              <div className="flex flex-col items-center h-full justify-center">
                <div className="flex flex-col justify-center items-center text-gray-500">
                  <QuestionAnswer sx={{ fontSize: "70px" }} />
                </div>
                <div className="text-center text-gray-500"><FormattedMessage id="howcanwehelp" /></div>
              </div>
            ) : (
              messages?.map((msg, index) => (
                <div key={index} className={`!flex gap-1 items-end ${msg.sender === 'USER' ? '!justify-end' : '!justify-start'}`}>
                  {msg.sender !== 'USER' &&
                    <div className="h-[35px] w-[35px] bg-gray-200 text-gray-500 rounded-full flex items-center justify-center">
                      <SupportAgent />
                    </div>
                  }
                  <div className={`${msg.sender === 'USER' ? '!bg-primary !text-white' : '!bg-gray-200 !text-gray-800'} 
      !px-3 !py-2 !rounded-lg !relative !max-w-[80%] !break-words`}>
                    <span>{msg.message}</span>


                    {/* createdAt below message */}
                    <div className="flex justify-between items-end">
                      <span className={`block text-xs mt-1 ${msg.sender === 'USER' ? "text-white/50" : 'text-gray-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.sender === "USER" && (
                        <>
                          {msg.status === 'pending' && <AccessTime sx={{ fontSize: "15px" }} className="text-white ml-1" />}
                          {msg.status === 'success' && <Check sx={{ fontSize: "15px" }} className="text-white ml-1" />}
                          {msg.status === 'error' && <Close sx={{ fontSize: "15px" }} className="text-red-500 ml-1" />}
                        </>
                      )}
                    </div>
                  </div>
                  {/* {msg.sender === 'USER' &&
                    // <div className="h-[35px] w-[35px] bg-primary-light text-white rounded-full flex items-center justify-center">
                    //   <Person />
                    // </div>
                    <Avatar alt={chat.senderName || "User"} sx={{ width: '35px', height: '35px' }}>
                      {chat.senderName?.charAt(0)}
                    </Avatar>
                  } */}
                </div>

              ))
            )
          ) : (
            <div className="flex flex-col items-center h-full justify-center">
              <div className="flex flex-col justify-center items-center text-gray-500">
                <Login sx={{ fontSize: "70px" }} />
              </div>
              <div className="text-center text-gray-500"><FormattedMessage id="youneedtologin" /></div>
              <div
                className="text-white bg-primary py-1 px-4 rounded-full z-[9999] transition-all mt-4 cursor-pointer"
                onClick={() => (setLoginModalOpen(true))}
              >
                <FormattedMessage id="Login" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <Divider />
        {isAuthenticated && (
          <div className="py-2 px-3 border mx-3 my-4 rounded-full flex items-center justify-between">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="outline-none bg-transparent w-full resize-none"
              placeholder={intl.formatMessage({ id: "writemessage" })}
            />
            <Send className="text-primary cursor-pointer" onClick={sendMessage} />
          </div>
        )}
      </div>
      <Modal open={isLoginModalOpen} onClose={() => setLoginModalOpen(false)}>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setLoginModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
