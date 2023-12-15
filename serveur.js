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

  const { id, password } = req.body;

  // row c'est un tableau de réponse
  db.all('SELECT * FROM users WHERE  = ? AND password = ?', [id, password], (err, rows) => {
    if (err) {
        throw err;
    }
  
    if (rows.length > 0 && pass) {


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
var pseudos = {};





//-------------------------------Classes-----------------------------------------------
const { Game,Bataille } = require('./Game.js');
const { Joueur } = require('./Joueur.js');
const { Carte } = require('./Carte.js');


//-------------------------------Fonctions-----------------------------------------------
//Obtension de la liste des pseudos des joueurs
const getpseudos = () => {
    const db = new sqlite3.Database("cards_game.sqlite");
    db.all("SELECT idU, pseudo FROM users", (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      rows.forEach((row) => {
        pseudos[row.idU] = row.pseudo;
      });
    });
    db.close(); 
  }


  getpseudos();
  console.log(pseudos)

//Démarrage d'une partie

function lancerPartie(idPartie){
  for (var partie in partiesOuvertes){
    if (partiesOuvertes[partie].id==idPartie){
      partiesOuvertes[partie].initGame();
      partiesEnCours.push(partiesOuvertes[partie]);
      partiesOuvertes.splice(partie)
      console.log("lancement de la partie "+idPartie)
    }
  }
}



console.log("-------------------------TESTS DU JEU PAR ELOUAND----------------------------------")

var game = new Bataille(1,2);

var game3 = new Bataille(1,5);



partiesOuvertes.push(game);
partiesOuvertes.push(game2);
partiesOuvertes.push(game3);


console.log("|------------un tour d'égalité passe--------------|")
/*ça a l'air fonctionnel :)*/
console.log("------------------------------------------------------------------------------------")

const getUserById = (id)=>{//FONCTION A NE PAS UTILISER MARCHE PAS MERCI
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

const existeId = (id) => {
  var retour;
  const db = new sqlite3.Database("cards_game.sqlite");
  db.all("SELECT * FROM users WHERE idU = ?",[id],(err,rows)=>{
    retour = rows.length>=1;
  });
  return retour;
};


//-------------------------------Sockets-----------------------------------------------
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);


  // socket.on("salut",()=>{
  //   console.log("salut");
  // });

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

    getpseudos();
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
    
    const db = new sqlite3.Database("cards_game.sqlite");
    db.all("SELECT * FROM users WHERE idU = ?",[data.idJoueur],(err,rows)=>{
    
    if (rows.length<1){
      socket.emit("creer partie bataille",false);
      return;
    }
    else{
      var joueursMax = data.joueursMax;
      if (!Number.isInteger(joueursMax)||joueursMax>8){
        joueursMax=8
      }
      let partie = new Bataille(data.idJoueur,joueursMax)
      partiesOuvertes.push(partie)
      console.log("Création d'une partie par "+data.idJoueur+" dont l'id sera "+partie.id)
    socket.emit("creer partie bataille",partie.id)}
    })
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
            infosJoueurs.push({"pseudo":pseudos[partie.joueurs[joueur].idJoueur],"tailleMain":partie.joueurs[joueur].main.length,"taillePaquets":partie.paquets[joueur].length})
          }
        }
      }
    }
    console.log(main)
    socket.emit("getCarte",{"main":main,"infosJoueurs":infosJoueurs})
  })
  
  
  //------------------------------------REJOINDRE UNE PARTIE------------------------------------------
  
socket.on("rejoindre partie bataille", data=>{
for (var partie of partiesOuvertes){ 
  if (data.idPartie==partie.id && partie.joueurs.length<partie.joueursMax){
    if (partie.addPlayer(data.idJoueur)!=false){
    socket.emit("rejoindre partie bataille",partie.id);
    if (partie.joueurs.length==partie.joueursMax){
      lancerPartie(partie.id)
      socket.emit("gameStarting",{"idPartie":data.idPartie})
    }
    return;}
  }
}

  socket.emit("rejoindre partie bataille",false);
  return;


})
//-----------------------------------------JOUER UNE CARTE-----------------------

socket.on('carteJouée',data=>{//Je veux recevoir {idPartie,idJoueur, et choix={valeur,couleur}}
  
  for (var partie of partiesEnCours){
    if (partie.id==data.idPartie){
      for (var joueur of partie.joueurs){
        if (joueur.idJoueur==partie){
//PAS FINI A FINIR
          if (joueur.setChoice(data.choix.valeur,data.choix.couleur)==true){
            socket.emit('carteJouée',true);
            if (partie.canTour()){
              partie.tour();

              io.emit('tourPassé',{"idPartie":partie.id,"égalité":partie.égalité})

            }

          }
          else{
            socket.emit('carteJouée',false)
          }




        }
      }
    }
  }

}
)



//Demande d'actualisation des infos bataille

socket.on('infosLobby',data=>{


  for (var partie of partiesOuvertes){//On sélectionne la bonne partie

    if (partie.id==data.idPartie){ 

  var retour = []; 
  for (var j of partie.joueurs){//On renvoie la liste des joueurs
    
    retour.push(pseudos[j.idJoueur])
  }
  socket.emit('infosLobby',{'joueurs':retour,'nbJoueurs':partie.joueurs.length,'joueursMax':partie.joueursMax,'host':partie.hosts})
  return
}
}
})


});