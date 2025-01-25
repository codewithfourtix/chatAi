import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]); // Added scrollToBottom to dependencies

  const generateResponse = async () => {
    if (inputMessage.trim() === "") return;

    setIsLoading(true);
    const userMessage = { type: "user", content: inputMessage };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");

    try {
      const API_URL = import.meta.env.VITE_GEMINI_API_URL;
      const response = await axios({
        url: API_URL,
        method: "post",
        data: {
          contents: [
            {
              parts: [{ text: inputMessage }],
            },
          ],
        },
      });

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      const aiMessage = { type: "ai", content: aiResponse };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage = {
        type: "error",
        content: "An error occurred. Please try again.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateResponse();
    }
  };

  return (
    <div className="chat-app">
      <div className="chat-header">
        <h1>AI Chat Assistant</h1>
        <div className="creator-info">
          <p className="creator-name">Built by Ali Zulfiqar</p>
          <p className="creator-email">
            For improvements, contact:
            <a href="mailto:codewithfourtix@gmail.com">
              codewithfourtix@gmail.com
            </a>
          </p>
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="message ai">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message here..."
          rows="3"
        />
        <button
          onClick={generateResponse}
          disabled={isLoading || inputMessage.trim() === ""}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default App;
