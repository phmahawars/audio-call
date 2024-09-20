import React, { useState, useEffect } from "react";
import io from "socket.io-client";

// Replace with the actual backend URL or IP
const SOCKET_SERVER_URL = "http://localhost:5000";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  // Connect to the Socket.IO server when the component mounts
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    // Listen for incoming messages
    newSocket.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Cleanup when the component is unmounted
    return () => newSocket.disconnect();
  }, []);

  // Function to handle sending messages
  const sendMessage = (e) => {
    e.preventDefault();

    if (message.trim()) {
      socket.emit("message", message); // Send the message to the server
      setMessages((prevMessages) => [...prevMessages, message]); // Add your own message to the list
      setMessage(""); // Clear the input field
    }
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.messagesContainer}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.message}>
            {msg}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={styles.form}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Send
        </button>
      </form>
    </div>
  );
};

const styles = {
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100vh",
    padding: "20px",
  },
  messagesContainer: {
    flexGrow: 1,
    overflowY: "auto",
    padding: "10px",
    backgroundColor: "#f1f1f1",
    borderRadius: "5px",
    marginBottom: "10px",
  },
  message: {
    padding: "10px",
    backgroundColor: "#4caf50",
    color: "#fff",
    borderRadius: "5px",
    marginBottom: "5px",
  },
  form: {
    display: "flex",
    justifyContent: "space-between",
  },
  input: {
    flexGrow: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    marginRight: "10px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#4caf50",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Chat;
