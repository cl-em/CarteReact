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
  // console.log("login")
  // console.log(req.body);
  const { id, password } = req.body;

  // row c'est un tableau de réponse
  db.all('SELECT * FROM users WHERE  = ? AND password = ?', [id, password], (err, rows) => {
    if (err) {
        throw err;
    }
    // console.log(rows);
    if (rows.length > 0 && pass) {
      
      //const name = rows[0].pseudo;
      // console.log(`User ${name} logged in`);
      // const token = jwt.sign({name}, "secret", { expiresIn: '1h' });
      // res.cookie('token', token, { httpOnly: true });

      

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


//-------------------------------Verify login-----------------------------------------------

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.send({ validation: false });
  }
  else {
    jwt.verify(token, "secret", (err, decoded) => {
      if (err) {
        res.send({ validation: false });
      } else {
        next();
      }
    }
  )}
};
app.get('/verify', verifyUser, (req, res) => {
  return res.send({ validation: true });
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

const getUserById = (id)=>{
  const db = new sqlite3.Database("cards_game.sqlite");
  db.all("SELECT pseudo FROM users WHERE idU = ?",[id],(err,rows)=>{
    if(rows.length>0){
      return rows.pseudo;
    }else{
      return null;
    }
  });
}


//-------------------------------Sockets-----------------------------------------------
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);


  socket.on("salut",()=>{
    console.log("salut");
  });

  socket.on("login",(data)=>{
    // data : {id,password}
    const db = new sqlite3.Database('cards_game.sqlite');

    db.all('SELECT * FROM users WHERE idU = ? AND password = ?', [data.id,data.password], (err, rows) => {
        if(rows.length >0){
          // si l'id et le mdp sont bon alors j'envoie true
          socket.emit("login",true);
        }else {
          socket.emit("login",false);
        }
    });

    db.close();

  });

  socket.on("creerCompte",(data)=>{
    // data : {pseudo,password}
    const db = new sqlite3.Database("cards_game.sqlite");
    console.log("ouai ça creer un compte");


    db.all("SELECT * FROM users WHERE pseudo = ?",[data.pseudo],(err,rows)=>{
      if(rows.length >0) socket.emit("creerCompte",false);
      
      else{

        let id = parseInt(Math.random()*10**8);
        // db.prepare("INSERT INTO users VALUES(?,?,?)").run([id,data.pseudo,data.password]).finalize();
        db.run("INSERT INTO users(idU,pseudo,password) VALUES(?,?,?)",[id,data.pseudo,data.password],(err)=>{
          console.log(err);
        });
        socket.emit("creerCompte",true);
      }
    });
    db.close();
    
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

//-------------------------------Verify login-----------------------------------------------

});
