// src/App.js
import React, { useEffect } from 'react';
import './App.css';

import io from 'socket.io-client';

// Connectez-vous au serveur Socket.IO
const socket = io('http://localhost:8888');

function App({ socket }) {
  useEffect(() => {
    socket.emit("salut");

    return () => {
      // Nettoyez les gestionnaires d'événements lors du démontage du composant
    };
  }, [socket]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>React with Socket.IO</h1>
        <script src="/socket.io/socket.io.js"></script>
      </header>
    </div>
  );
}

export default App(socket);