import React, { useState, useEffect } from 'react';
import SocketContext from './SocketContext';

function Chat() {
  const currentUrl = window.location.href;
  const urlParts = currentUrl.split('?idPartie=');
  const idPartie = urlParts[urlParts.length - 1];
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const maxMessages = 50;
  const maxMessageLength = 250;
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

    const handleShadow = (messageShadow)=>{
      if(messageShadow.idPartie==idPartie){
        handleMessage(messageShadow.Message);
      }
    }

    socket.on('message '.concat(idPartie), handleMessage);

    socket.on("tourPasse",handleShadow);

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

  const [accessibilite,setAccessibilite] = useState(false);


  return (
    <div className={accessibilite?"accessibilite":"chat"}>
      <ul className={"messages"}>
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <div className={"input-area"}>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' ? sendMessage() : null}
          maxLength={maxMessageLength}
        />
        {/* <button onClick={sendMessage}>Envoyer</button><br></br>
        <button onClick={()=>{setAccessibilite(!accessibilite)}}>Accessibilite</button> */}
      </div>
    </div>

  );
}

export default Chat;
