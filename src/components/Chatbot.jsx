import { useState, useRef, useEffect } from "react";
import chatbotApi from "../services/chatbotApi";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatResponse = (text) => {
    // Convert markdown-like formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // Bold
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // Italic
      .replace(/\n/g, "<br />") // Line breaks
      .replace(/\*\s(.*?)(?=\n|$)/g, "• $1<br />") // Bullet points
      .replace(/\d+\.\s(.*?)(?=\n|$)/g, "<br />$&") // Numbered lists
      .replace(/```(.*?)```/gs, "<pre><code>$1</code></pre>"); // Code blocks
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const botResponse = await chatbotApi.sendMessage(input, messages);
      setMessages((m) => [
        ...m,
        {
          text: botResponse,
          sender: "bot",
          formattedText: formatResponse(botResponse),
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((m) => [
        ...m,
        {
          text: "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          formattedText: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md mb-4 text-center">
        <h1 className="text-2xl font-bold text-gray-800">AI Chatbot</h1>
      </div>
      
      <div className="flex flex-col w-full max-w-md border border-gray-200 rounded-lg overflow-hidden shadow-lg bg-white" style={{ height: "70vh" }}>
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`mb-3 rounded-lg p-3 ${
                msg.sender === "user"
                  ? "ml-auto bg-blue-600 text-white rounded-br-none"
                  : "mr-auto bg-gray-100 rounded-bl-none"
              }`}
              style={{
                maxWidth: "80%",
                width: "fit-content",
              }}
            >
              {msg.formattedText ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: msg.formattedText }}
                />
              ) : (
                msg.text
              )}
            </div>
          ))}

          {loading && (
            <div
              className="mr-auto bg-gray-100 rounded-lg p-3"
              style={{
                maxWidth: "80%",
                width: "fit-content",
              }}
            >
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-3 bg-white border-t border-gray-200"
        >
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 px-4 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors cursor-pointer"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;