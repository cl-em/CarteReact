import React, { useState, useEffect } from 'react';
import SocketContext from './SocketContext';

function Chat() {
  const currentUrl = window.location.href;
  const urlParts = currentUrl.split('?idPartie=');
  const idPartie = urlParts[urlParts.length - 1];
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const maxMessages = 50;
  const maxMessageLength = 25;
  const socket = React.useContext(SocketContext);

  useEffect(() => {
    const handleMessage = (msg) => {
      setMessages(prevMessages => {
        const updatedMessages = [...prevMessages, msg];
        if (updatedMessages.length > maxMessages) {
          return updatedMessages.slice(updatedMessages.length - maxMessages);
        }
        return updatedMessages;
      });
    };

    socket.on('message '.concat(idPartie), handleMessage);

    return () => {
      socket.off('message '.concat(idPartie), handleMessage);
    };
  }, [idPartie, socket]);

  const sendMessage = () => {
    if (message.trim() !== '' && message.length <= maxMessageLength) {
      socket.emit('message', { message, idPartie });
      setMessage('');
    }
  };

  return (
    <div class="chat">
      <ul>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' ? sendMessage() : null}
        maxLength={maxMessageLength}
      />
      <button onClick={sendMessage}>Envoyer</button>
    </div>
  );
}

export default Chat;
