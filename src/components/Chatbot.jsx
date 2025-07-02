import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import chatbotApi from '../services/chatbotApi';

const Chatbot = () => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatbot-messages');
    return saved ? JSON.parse(saved) : [
      { 
        text: 'Hello! How can I help you today?', 
        sender: 'bot', 
        timestamp: new Date().toISOString() 
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: 'Chat 1', preview: 'New chat', timestamp: new Date().toISOString() }
  ]);
  const [activeChat, setActiveChat] = useState(1);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('chatbot-messages', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { 
      text: input, 
      sender: 'user',
      timestamp: new Date().toISOString() 
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const botText = await chatbotApi.sendMessage(input, messages);
      setMessages(prev => [...prev, { 
        text: botText, 
        sender: 'bot',
        timestamp: new Date().toISOString() 
      }]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages(prev => [...prev, { 
        text: "Sorry, I encountered an error. Please try again.", 
        sender: 'bot',
        timestamp: new Date().toISOString() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    const newChatId = Date.now();
    setMessages([
      { 
        text: 'Hello! How can I help you today?', 
        sender: 'bot', 
        timestamp: new Date().toISOString() 
      }
    ]);
    setActiveChat(newChatId);
    setChatHistory(prev => [
      ...prev,
      {
        id: newChatId,
        title: `Chat ${prev.length + 1}`,
        preview: 'New chat',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Sidebar - Fully integrated left panel */}
      <div className="w-64 bg-[#202123] text-gray-200 flex flex-col border-r border-gray-700">
        {/* New Chat Button */}
        <button 
          onClick={startNewChat}
          className="mx-3 mt-3 p-3 rounded-md border border-gray-600 hover:bg-gray-700 transition-colors flex items-center gap-3 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New chat
        </button>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <h3 className="px-3 py-2 text-xs font-medium text-gray-400">Today</h3>
          {chatHistory.map(chat => (
            <motion.div 
              key={chat.id}
              whileHover={{ backgroundColor: '#2A2B32' }}
              className={`px-3 py-3 rounded-md cursor-pointer text-sm ${
                activeChat === chat.id ? 'bg-gray-800' : ''
              }`}
              onClick={() => setActiveChat(chat.id)}
            >
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <div className="truncate">{chat.title}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-700">
          <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-700 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <span className="text-xs">U</span>
            </div>
            <div className="text-sm">My Profile</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">AI Chatbot</h2>
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4"
              >
                <div 
                  className={`px-4 py-3 rounded-lg max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'ml-auto bg-[#40414F] text-white rounded-br-none' 
                      : 'mr-auto bg-gray-100 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
                <div 
                  className={`text-xs mt-1 ${
                    message.sender === 'user' ? 'text-right' : 'text-left'
                  } text-gray-500`}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mr-auto mb-3 px-4 py-3 bg-gray-100 rounded-lg rounded-bl-none max-w-[80%]"
            >
              <div className="flex space-x-2">
                {[0, 0.2, 0.4].map((delay) => (
                  <motion.div
                    key={delay}
                    className="w-2 h-2 bg-gray-500 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <form 
            onSubmit={handleSubmit} 
            className="flex items-center rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-[#40414F]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 outline-none bg-transparent rounded-l-lg"
              autoFocus
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="px-4 py-3 text-gray-400 hover:text-[#40414F] disabled:opacity-50 rounded-r-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;