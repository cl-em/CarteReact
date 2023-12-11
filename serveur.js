// const express = require('express');
// const app = express();
// const cors = require('cors');



// const http = require('http');
// // const { isNumberObject } = require('util/types');
// const server = http.createServer(app);


// const io = require("socket.io")(http, {
//   allowRequest: (req, callback) => {
//     const noOriginHeader = req.headers.origin === undefined;
//     callback(null, noOriginHeader);
//   }
// });
// app.use(cors());
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
// const { Server } = require("socket.io");
const io = require('socket.io')(server, {
  cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true
  },
  allowEIO3: true
});


const PORT = 8888;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/fichier/:nomFichier', function(request, response) {
  console.log("renvoi de "+request.params.nomFichier);
  response.sendFile(request.params.nomFichier, {root: __dirname});
});

app.get('/socket.io/', (req, res) => {
  res.send('Server is running.');
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Ajoutez ici les gestionnaires d'événements Socket.IO

  socket.on("salut",()=>{
    console.log("salut");
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
