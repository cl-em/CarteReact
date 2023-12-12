const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
      transports: ['websocket', 'polling'],
      credentials: true
  },
  allowEIO3: true
});
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

//-------------------------------Express-----------------------------------------------
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

//-------------------------------SQL-----------------------------------------------
const sqlite3 = require('sqlite3').verbose();


//-------------------------------Login-----------------------------------------------
app.use(express.json());
app.use(cookieParser());

app.post('/login', (req, res) => {
  const db = new sqlite3.Database('cards_game.sqlite');
  console.log("login")
  console.log(req.body);
  const { username, password } = req.body;
  db.all('SELECT * FROM users WHERE pseudo = ? AND password = ?', [username, password], (err, rows) => {
    if (err) {
        throw err;
    }
    console.log(rows);
    if (rows.length > 0) {
      const name = rows[0].pseudo;
      console.log(`User ${name} logged in`);
      const token = jwt.sign({name}, "secret", { expiresIn: '1h' });
      res.cookie('token', token, { httpOnly: true });
      res.send({ validation: true });
    } else {
      res.send({ validation: false });
    }
  }
)


db.close((err) => {
  if (err) {
      console.error(err.message);
  }
  console.log('Connexion à la base de données SQLite fermée.');
});
});



//-------------------------------Classes-----------------------------------------------
const { Game,Bataille } = require('./Game.js');
const { Joueur } = require('./Joueur.js');
const { Carte } = require('./Carte.js');


//-------------------------------Fonctions-----------------------------------------------
console.log("-------------------------TESTS DU JEU PAR ELOUAND----------------------------------")
var game = new Bataille(12345678,io);
game.createDeck();
game.shuffleDeck();
console.log(game.deck.length);
console.log(game.drawCarte());
console.log(game.deck.length);
console.log("Id de la game: "+game.id)
console.log("------------------------------------------------------------------------------------")


//-------------------------------Sockets-----------------------------------------------
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);


  socket.on("salut",()=>{
    console.log("salut");
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

//-------------------------------Verify login-----------------------------------------------

  socket.on('login',data=>{

  })
});
