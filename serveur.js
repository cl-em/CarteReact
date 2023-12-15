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

app.get('/carte/:nomFichier', function(request, response) {
  console.log("renvoi de "+request.params.nomFichier);
  response.sendFile(request.params.nomFichier, {root: __dirname+"/CartesAJouer/"});
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
//-------------------------------Variables-----------------------------------------------
var partiesOuvertes = []
var partiesEnCours = []


//-------------------------------Classes-----------------------------------------------
const { Game,Bataille } = require('./Game.js');
const { Joueur } = require('./Joueur.js');
const { Carte } = require('./Carte.js');


//-------------------------------Fonctions-----------------------------------------------
console.log("-------------------------TESTS DU JEU PAR ELOUAND----------------------------------")

var game = new Bataille(12345678,2);
var game2 = new Bataille(123435678,2);
var game3 = new Bataille(122345678,5);

game2.addPlayer(9999)
game2.addPlayer(2)


partiesOuvertes.push(game);
partiesOuvertes.push(game2);
partiesOuvertes.push(game3);

console.log(partiesOuvertes,partiesEnCours);


console.log("|------------un tour d'égalité passe--------------|")
/*ça a l'air fonctionnel :)*/
console.log("------------------------------------------------------------------------------------")

const getUserById = (id)=>{
  let retour;

  const db = new sqlite3.Database("cards_game.sqlite");
  db.all("SELECT pseudo FROM users WHERE idU = ?",[id],(err,rows)=>{
    if(rows.length>0){
      retour = rows[0].pseudo;
    }else{
      retour =  false;
    }
  });

  return retour;
}

const existeId = (id)=>{

  let retour;
  const db = new sqlite3.Database("cards_game.sqlite");
  db.all("SELECT * FROM users WHERE idU = ?",[id],(err,rows)=>{
    retour =  rows.length>=1;
  });
  return retour
}


//-------------------------------Sockets-----------------------------------------------
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);


  // socket.on("salut",()=>{
  //   console.log("salut");
  // });

  socket.on("infosLobby",date=>{
    
  })

  socket.on('demandepartiesouvertes',data=>{
    var retour = []
    for (var partie of partiesOuvertes){
      if (partie.type==data){retour.push({"id":partie.id,"joueursActuels":partie.joueurs.length,"joueursMax":partie.joueursMax})}
    }
    socket.emit('parties ouvertes bataille', retour);
  });

  socket.on("login",(data)=>{
    // data : {id,password}
    const db = new sqlite3.Database('cards_game.sqlite');

    db.all('SELECT * FROM users WHERE pseudo = ? AND password = ?', [data.pseudo,data.password], (err, rows) => {
      // console.log(rows.idU);
      console.log(rows);
        if(rows.length==1){
          // si l'id et le mdp sont bon alors j'envoie true
          socket.emit("login",rows[0].idU);
        }else {
          socket.emit("login",false);
        }
    });

    db.close();

  });

  socket.on("register",(data)=>{
    // data : {pseudo,password}
    const db = new sqlite3.Database("cards_game.sqlite");
    


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

  socket.on('message', data => {
    // verif que idJoueur soit dans idPartie et que joueur soit authentifié
    console.log(data);
    io.emit('message '.concat(data.idPartie), (data.idJoueur).toString().concat(" : ").concat(data.message));
});

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  //Création d'une partie

      
  socket.on("creer partie bataille",data=>{
    if (!existeId(data.idJoueur)){
      socket.emit("creer partie bataille",false);console.log((data.idJoueur));return;
    }
    var joueursMax = data.joueursMax;
    if (joueursMax>8){
      joueursMax=8
    }
    let partie = new Bataille(data.idJoueur,joueursMax)
    partiesOuvertes.push(partie)
    socket.emit("creer partie bataille",partie.id)
  })
  //Sockets de la partie----------------------------------


  socket.on("wantCarte",data=>{
    var main = [];
    var infosJoueurs = []
    for (var partie of partiesEnCours){
      if (partie.id == data.idPartie){
        for (var joueur in partie.joueurs){//Renvoi de la main du joueur
          if (partie.joueurs[joueur].idJoueur==data.idJoueur){
              main = partie.joueurs[joueur].main;
          }
          else{
            infosJoueurs.push({"pseudo":getUserById(joueur.idJoueur),"tailleMain":partie.joueurs[joueur].main.length,"taillePaquets":partie.paquets[joueur].length})
          }
        }
      }
    }
    socket.emit("getCarte",{"main":main,"infosJoueurs":infosJoueurs})
  })
  

//------------------------------------REJOINDRE UNE PARTIE------------------------------------------

socket.on("rejoindre partie bataille", data=>{
for (var partie of partiesOuvertes){ 
  if (data.idPartie==partie.id && partie.joueurs.length<partie.joueursMax){
    partie.addPlayer(data.idJoueur)
    socket.emit("rejoindre partie bataille",partie.id)
    return;
  }
}

  socket.emit("rejoindre partie bataille",false);
  return;


})


//Demande d'actualisation des infos bataille

socket.on('infosLobby',data=>{
  var partie;

  for (var g of partiesOuvertes){//On sélectionne la bonne partie
    if (g.id==data.idPartie){partie=g} 
  }

  var retour = []; 
  for (var j of partie.joueurs){//On renvoie la liste des joueurs
    retour.push(getUserById(j.idJoueur))
  }

  socket.emit('infosLobby',{'joueurs':retour,'nbJoueurs':partie.joueurs.length,'joueursMax':partie.joueursMax,'host':partie.hosts})
})

//-------------------------------Verify login-----------------------------------------------

});
