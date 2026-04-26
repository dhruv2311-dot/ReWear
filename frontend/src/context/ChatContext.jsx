import { createContext, useContext, useMemo, useState } from 'react';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [messagesBySwap, setMessagesBySwap] = useState({});

  const setSwapMessages = (swapId, messages) => {
    setMessagesBySwap(prev => ({ ...prev, [swapId]: messages }));
  };

  const addSwapMessage = (swapId, message) => {
    setMessagesBySwap(prev => ({
      ...prev,
      [swapId]: [...(prev[swapId] || []), message],
    }));
  };

  const replaceSwapMessage = (swapId, tempId, message) => {
    setMessagesBySwap(prev => ({
      ...prev,
      [swapId]: (prev[swapId] || []).map(entry => (entry._id === tempId ? message : entry)),
    }));
  };

  const value = useMemo(() => ({
    messagesBySwap,
    setSwapMessages,
    addSwapMessage,
    replaceSwapMessage,
  }), [messagesBySwap]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);