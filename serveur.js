const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const cors = require('cors');
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    transports: ['websocket', 'polling'],
    credentials: true
  },
  allowEIO3: true
});
app.use(cors({
  origin: "http://localhost:3000",
  methods: ["GET", "POST"],
  credentials: true
}));
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const tokenStore = {};
//-------------------------------SQL-----------------------------------------------
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('cards_game.sqlite');
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

  response.sendFile(request.params.nomFichier, {root: __dirname+"/CartesAJouer/"});
});

app.get("/carteShadow/:nomImage",(request,response)=>{
  response.sendFile(request.params.nomImage,{root:__dirname+"/cartesShadowHunter2/"});
});

app.get("/carteShadow2/:nomImage",(request,response)=>{
  response.sendFile(request.params.nomImage,{root:__dirname+"/cartesShadowHunter2/"});
}); 

app.get('/socket.io/', (req, res) => {
  res.send('Server is running.');
});


//-------------------------------Login-----------------------------------------------
app.use(express.json());
app.use(cookieParser());
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.send({ validation: false });
  } else {
    db.get('SELECT * FROM users WHERE pseudo = ?', [username], (err, row) => {
      getpseudos();
      if (err) {
        throw err;
      }
      if (!row) {
        res.send({ validation: false });
      } else {
        const hashedPassword = row.password;
        const idJoueur = row.idU;
        bcrypt.compare(password, hashedPassword, (compareErr, result) => {
          if (compareErr || !result) {
            res.send({ validation: false });
          } else {
            const name = row.pseudo;
            const idJoueur = row.idU;
            console.log(`User ${idJoueur} logged in`);
            const token = jwt.sign({ idJoueur }, "secret", { expiresIn: '1d' });
            if (!tokenStore[idJoueur]) {
              tokenStore[idJoueur] = [];
            }
            tokenStore[idJoueur].push(token);
            res.cookie('token', token);
            res.send({ validation: true, "idJoueur":idJoueur });
          }
        });
      }
    });
  }
});
//-------------------------------Register-----------------------------------------------
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.send({ validation: false });
  } else {
    // Hasher le mot de passe
    bcrypt.hash(password, 10, (hashErr, hash) => {
      if (hashErr) {
        res.send({ validation: false });
      } else {
        db.all('SELECT * FROM users WHERE pseudo = ?', [username], (err, rows) => {
          if (err) {
            throw err;
          }
          if (rows.length > 0) {
            res.send({ validation: false });
          } else {
            db.run("INSERT INTO users(pseudo,password) VALUES(?,?)", [username, hash], (insertErr) => {
              getpseudos();

              if (insertErr) {
                console.log(insertErr);
                res.send({ validation: false });
              } else {
                res.send({ validation: true });
              }
            });
          }
        });
      }
    });
  }
});

//-------------------------------Verify login-----------------------------------------------

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  console.log(token);
  if (!token) {
    res.send({ validation: false });
  } else {
    jwt.verify(token, "secret", (err, decoded) => {
      if (err) {
        res.send({ validation: false });
      } else {
        const userId = decoded.idJoueur; // Supposons que le nom décodé soit l'identifiant de l'utilisateur
        const tokenExists = tokenStore[userId] && tokenStore[userId].includes(token);
        if (tokenExists) {
          next(); // Le token est valide pour cet utilisateur, passe à la prochaine étape
        } else {
          res.send({ validation: false }); // Le token n'existe pas dans le tokenStore pour cet utilisateur
        }
      }
    });
  }
};

app.get('/verify', verifyUser, (req, res) => {
  return res.send({ validation: true });
});
//-------------------------------Variables-----------------------------------------------
var partiesOuvertes = []
var partiesEnCours = []
var pseudos = {};

function getIdFromPseudo(pseudo){
  for (var test in pseudos){
    if (pseudos[test]==pseudo){
      return test
    }
  }
  return false
}




//-------------------------------Classes-----------------------------------------------
const { Game,Bataille,sixquiprend, shadowHunter } = require('./Game.js');
const { Joueur,JoueurShadowHunter } = require('./Joueur.js');
const { Carte,CarteShadowHunter } = require('./Carte.js');
const { Console } = require('console');
const { setTimeout } = require('timers');



//-------------------------------Fonctions-----------------------------------------------
//Obtension de la liste des pseudos des joueurs

function getpseudos(){
  var db = new sqlite3.Database("cards_game.sqlite");
  // const db = new sqlite3.Database("cards_game.sqlite");
  db.all("SELECT idU, pseudo FROM users", (err, rows) => {
    if (err) {
      reject(err);
      return;
    }
    rows.forEach((row) => {
      pseudos[row.idU] = row.pseudo;       
    });
  });
}


getpseudos();




//-------------------------------Tests Elouand-----------------------------------------------
  





//Demarrage d'une partie (d'un point de vue pûrement serveur, pas de l'objet partie)

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


// -------------------------------Sauvegardes-----------------------------------------------

// CREATE TABLE "Batailles" (
// 	"idB"	INTEGER NOT NULL UNIQUE,
// 	"idH"	INTEGER NOT NULL,
// 	"Bataille"	TEXT,
// 	PRIMARY KEY("idB")
// );

// CREATE TABLE "SixQuiPrend" (
// 	"id6"	INTEGER NOT NULL UNIQUE,
// 	"idH"	INTEGER NOT NULL,
// 	"SixQuiPrend"	TEXT,
// 	PRIMARY KEY("id6")
// );
function sauvegarderPartieBataille(idPartie, idHost, Bataille){
  Bataille = JSON.stringify(Bataille);
  db.run("INSERT OR REPLACE INTO Batailles(idB,idH,Bataille) VALUES(?,?,?)",[idPartie, idHost, Bataille],(err)=>{
    console.log(err);
  });
}

function sauvegarderPartieSixQuiPrend(idPartie, idHost, SixQuiPrend){
  SixQuiPrend = JSON.stringify(SixQuiPrend);
  db.run("INSERT OR REPLACE INTO SixQuiPrend(id6,idH,SixQuiPrend) VALUES(?,?,?)",[idPartie, idHost, SixQuiPrend],(err)=>{
    console.log(err);
  });
}

function loadPartieBatailleFromDB(idPartie){
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM Batailles WHERE idB = ?",[idPartie],(err,rows)=>{
      if(rows.length >0){
        resolve(rows[0].Bataille);
      }else{
        reject(err);
      }
    });
  });
}

function loadPartieSixQuiPrendFromDB(idPartie){
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM SixQuiPrend WHERE id6 = ?",[idPartie],(err,rows)=>{
      if(rows.length >0){
        resolve(rows[0].SixQuiPrend);
      }else{
        reject(err);
      }
    }
    );
  });
}

function supprimerPartieBataille(idPartie){
  db.run("DELETE FROM Batailles WHERE idB = ?",[idPartie],(err)=>{
    console.log(err);
  });
}

function supprimerPartieSixQuiPrend(idPartie){
  db.run("DELETE FROM SixQuiPrend WHERE id6 = ?",[idPartie],(err)=>{
    console.log(err);
  }
  );
}

function loadPartieBataille(idPartie){
  return new Promise((resolve, reject) => {
    console.log("chargement de la partie sauvegardee " + idPartie)
    loadPartieBatailleFromDB(idPartie).then((partiedb) => {
      var partie_json = JSON.parse(partiedb);
      // transformer en objet bataille
      var partie = Bataille.fromJSON(partie_json);
      if (!partiesEnCours.includes(partie)){partiesEnCours.push(partie);}
      resolve(partie); // Résoudre la promesse avec la partie chargée
    })
    .catch((err) => {
      console.log("Erreur lors du chargement de la partie");
      console.log(err);
      reject(err); // Rejeter la promesse en cas d'erreur
    });
  });
}

function loadPartieSixQuiPrend(idPartie){
  return new Promise((resolve, reject) => {
    console.log("chargement de la partie sauvegardee " + idPartie)
    loadPartieSixQuiPrendFromDB(idPartie).then((partiedb) => {
      var partie_json = JSON.parse(partiedb);
      // transformer en objet sixquiprend
      var partie = sixquiprend.fromJSON(partie_json);
      if (!partiesEnCours.includes(partie)){partiesEnCours.push(partie);}
      resolve(partie); // Résoudre la promesse avec la partie chargée
    })
    .catch((err) => {
      console.log("Erreur lors du chargement de la partie");
      console.log(err);
      reject(err); // Rejeter la promesse en cas d'erreur
    });
  });
}


function getHostPartiesBataille(idHost) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM Batailles WHERE idH = ?", [idHost], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getHostPartiesSixQuiPrend(idHost) {
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM SixQuiPrend WHERE idH = ?", [idHost], (err, rows) => {
      if (err) {
        reject(err);
      }
      else {
        resolve(rows);
      }
    });
  });
}

const getUserById = (id)=>{//FONCTION A NE PAS UTILISER MARCHE PAS MERCI
  let retour;
  
  // const db = new sqlite3.Database("cards_game.sqlite");
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
  // const db = new sqlite3.Database("cards_game.sqlite");
  db.all("SELECT * FROM users WHERE idU = ?",[id],(err,rows)=>{
    retour = rows.length>=1;
  });
  return retour;
};


//-------------------------------Sockets-----------------------------------------------
io.use((socket, next) => {
  const authToken = socket.handshake.auth.token;
  // console.log(authToken);
  if (!authToken) {
    return next(new Error('Authentication error')); // S'il n'y a pas de token, génère une erreur d'authentification
  }
  
  jwt.verify(authToken, 'secret', (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error')); // En cas d'erreur de vérification du token, génère une erreur d'authentification
    }
    
    const userId = decoded.idJoueur; // Supposons que le nom décodé soit l'identifiant de l'utilisateur
    socket.data = { "userId": userId, "pseudo" : pseudos[userId] };
    console.log(socket.data);
    const tokenExists = tokenStore[userId] && tokenStore[userId].includes(authToken);
    
    if (tokenExists) {
      console.log('User already connected')
      return next(); // Le token est valide pour cet utilisateur, passe à la connexion Socket.IO suivante
    } else {
      console.log('User not connected')
      return next(new Error('Authentication error')); // Le token n'existe pas dans le tokenStore pour cet utilisateur, génère une erreur d'authentification
    }
  });
});
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  
  //-------------------------------Leaderboard-----------------------------------------
  
  socket.on('leaderboard',data=>{
    //{"joueursTop":joueursTop,"joueurLocal":localplayer}
    //joueursTop: tableau d'objets de type {pseudo,scorebataille,classement}
    //joueurLocal: un seul objet
    let joueursTop;
    let localplayer;
    let typeJeu = data;
    let idJoueur = socket.data.userId;
    console.log("demande leaderboard "+typeJeu)
    db.all('SELECT pseudo, score' + typeJeu+', classement FROM (SELECT pseudo, score'+typeJeu+', row_number() OVER (ORDER BY score'+ typeJeu+' DESC) AS classement FROM users ) WHERE classement < 20 ORDER BY classement', (err, rows) => {
      socket.emit("leaderboard",{"joueursTop":rows,"joueurLocal":localplayer});
    })  
    
  })
  socket.on('leaderboard6',data=>{
    let joueursTop;
    let localplayer;
    let typeJeu = data;
    let idJoueur = socket.data.userId;
    db.all('SELECT pseudo, score' + typeJeu+', classement FROM (SELECT pseudo, score'+typeJeu+', row_number() OVER (ORDER BY score'+ typeJeu+' DESC) AS classement FROM users ) WHERE classement < 20 ORDER BY classement', (err, rows) => {
      socket.emit("leaderboard",{"joueursTop":rows,"joueurLocal":localplayer});
    })  
  })
  
  //-------------------------------Sauvegardes-----------------------------------------
  socket.on('sauvegarderPartieBataille', data => {
    for (let i = 0; i < partiesEnCours.length; i++) {
      if (partiesEnCours[i].id == data.idPartie) {
        sauvegarderPartieBataille(data.idPartie, socket.data.userId, partiesEnCours[i]);
        // Supprimer la partie en cours
        partiesEnCours.splice(i, 1); // Cette ligne supprime l'élément à l'index i
        // signaler la fin de la partie car sauvegardee
        io.emit("partieSauvegardee", {"idPartie" : data.idPartie}); // regler
        console.log("Partie sauvegardée");
      }
    }
  });
  socket.on('sauvegarderPartieSixQuiPrend', data => {
    for (let i = 0; i < partiesEnCours.length; i++) {
      if (partiesEnCours[i].id == data.idPartie) {
        sauvegarderPartieSixQuiPrend(data.idPartie, socket.data.userId, partiesEnCours[i]);
        // Supprimer la partie en cours
        partiesEnCours.splice(i, 1); // Cette ligne supprime l'élément à l'index i
        // signaler la fin de la partie car sauvegardee
        io.emit("partieSauvegardee", {"idPartie" : data.idPartie}); // regler
        console.log("Partie sauvegardée");
      }
    }
  });
  
  socket.on('loadPartieBataille', data => {
    //data : {idPartie}
    loadPartieBataille(data.idPartie).then((partie) => {
      lancerPartie(data.idPartie);
      io.emit('partieChargee',partie);
    }).catch((err) => {
      // Gérez l'erreur ici
      console.log(err);
    });
  }
  )
  socket.on('loadPartieSixQuiPrend', data => {
    //data : {idPartie}
    loadPartieSixQuiPrend(data.idPartie).then((partie) => {
      lancerPartie(data.idPartie);
      let listejoueurs = [];
      for (var joueur of partie.joueurs){listejoueurs.push(pseudos[joueur.idJoueur]);};
      io.emit('gameStarting',{"idPartie":data.idPartie,"lignes":partie.lignes,"joueurs":partie.joueurs});
    }).catch((err) => {
      // Gérez l'erreur ici
      console.log(err);
    });
  }
  )

  socket.on('isloaded', data => {
    //data : {idPartie}
    for (var partie of partiesEnCours){
      if (partie.id == data.idPartie){
        socket.emit('isloaded',partie);
        return;
      }
    }
    socket.emit('isloaded',false);
  })

  socket.on('supprimerPartieBataille',data=>{
    //data : {idPartie}
    supprimerPartieBataille(data.idPartie);
  })
  socket.on('supprimerPartieSixQuiPrend',data=>{
    //data : {idPartie}
    supprimerPartieSixQuiPrend(data.idPartie);
  })

  socket.on('getHostPartiesBataille',data=>{
    getHostPartiesBataille(socket.data.userId)
    .then((parties) => {
      // Traitez ici les données récupérées depuis la base de données (parties).
      socket.emit('getHostPartiesBataille',parties);
    })
    .catch((err) => {
      // Gérez les erreurs ici, si nécessaire.
    });
  })
  socket.on('getHostPartiesSixQuiPrend',data=>{
    getHostPartiesSixQuiPrend(socket.data.userId)
    .then((parties) => {
      // Traitez ici les données récupérées depuis la base de données (parties).
      socket.emit('getHostPartiesSixQuiPrend',parties);
    })
    .catch((err) => {
      // Gérez les erreurs ici, si nécessaire.
    });
  }
  )

  socket.on('demandepartiesRejointes',data=>{
    var retour = []
    for (var partie of partiesEnCours){
      // recupérer la liste des parties dans lesquelles le joueur socket.data.userId est présent
      for (joueur of partie.joueurs){
        if (joueur.idJoueur==socket.data.userId){
        retour.push({"id":partie.id,"joueursActuels":partie.joueurs.length,"joueursMax":partie.joueursMax, "type":partie.type})
        }
      }
    }
    socket.emit('partiesRejointes', retour);
  });
  
  socket.on('demandepartiesouvertes',data=>{
    var retour = []
    for (var partie of partiesOuvertes){
      if (partie.type==data){retour.push({"id":partie.id,"joueursActuels":partie.joueurs.length,"joueursMax":partie.joueursMax})}
    }
    socket.emit('partiesOuvertes', retour);
  });
  
  socket.on("login",(data)=>{
    getpseudos();
    // data : {id,password}
    // const db = new sqlite3.Database('cards_game.sqlite');
    
    db.all('SELECT * FROM users WHERE pseudo = ? AND password = ?', [data.pseudo,data.password], (err, rows) => {
      if(rows.length==1){
        // si l'id et le mdp sont bon alors j'envoie true
        socket.emit("login",rows[0].idU);
      }else {
        socket.emit("login",false);
      }
    });
    
    // db.close();
    
    getpseudos();
  });
  
  socket.on("register",(data)=>{
    // data : {pseudo,password}
    // const db = new sqlite3.Database("cards_game.sqlite");
    
    
    
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
      getpseudos()
    });
    // db.close();
    
    getpseudos()
  });
  
  socket.on('message', data => {
    // verif que idJoueur soit dans idPartie et que joueur soit authentifié
    
    io.emit('message '.concat(data.idPartie), (socket.data.pseudo).toString().concat(" : ").concat(data.message));
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  //Creation d'une partie
  
  
  socket.on("creerPartie",data=>{
    
    // cas où l'utilisateur n'est pas connecté
    db.all("SELECT * FROM users WHERE idU = ?",[socket.data.userId],(err,rows)=>{
      
      if (rows.length<1){
        socket.emit("creer partie bataille",false);
        return;
      }
      //Cas où la partie est une bataille
      if (data.type=="Bataille"){
        var joueursMax = data.joueursMax;
        if (!Number.isInteger(parseInt(joueursMax))||joueursMax>10||joueursMax<2){
          joueursMax=10
        }
        let partie = new Bataille(socket.data.userId,joueursMax)
        partiesOuvertes.push(partie)
        console.log("| Creation d'une partie de Bataille par "+socket.data.userId+" dont l'id sera "+partie.id)
        socket.emit("creerPartie",partie.id)
        return}
        
        if (data.type=="6quiprend"){
          var joueursMax = data.joueursMax;
          if (!Number.isInteger(parseInt(joueursMax))||joueursMax>10||joueursMax<2){
            joueursMax=10
          }
          let partie = new sixquiprend(socket.data.userId,joueursMax)
          partiesOuvertes.push(partie)
          console.log("| Creation d'une partie de 6quiprend par "+socket.data.userId+" ("+pseudos[socket.data.userId]+") dont l'id sera "+partie.id)
          socket.emit("creerPartie",partie.id)}

          if (data.type=="shadowHunter"){
            var joueursMax = data.joueursMax;
            if (!Number.isInteger(parseInt(joueursMax))||joueursMax>10||joueursMax<2){
              joueursMax=4
            }
            let partie = new shadowHunter(socket.data.userId,joueursMax)
            partiesOuvertes.push(partie)
            console.log("| Creation d'une partie de shadowHunter par "+socket.data.userId+" ("+pseudos[socket.data.userId]+") dont l'id sera "+partie.id)
            socket.emit("creerPartie",partie.id)}
        }
        
        )
      })
      //Sockets de la partie----------------------------------
      
      
      socket.on("wantCarte",data=>{
        
        var main = [];
        var infosJoueurs = []
        for (var partie of partiesEnCours){
          if (partie.id == data.idPartie){
            
            if (partie.type=="Bataille"){
              
              
              //Cas d'une bataille
              for (var joueur in partie.joueurs){//Renvoi de la main du joueur
                if (partie.joueurs[joueur].idJoueur==socket.data.userId){
                  main = partie.joueurs[joueur].main;
                  infosJoueurs.push({"pseudo":pseudos[partie.joueurs[joueur].idJoueur],"tailleMain":partie.joueurs[joueur].main.length,"taillePaquets":partie.paquets[joueur].length,"isLocalPlayer":true})
                }
                else{
                  infosJoueurs.push({"pseudo":pseudos[partie.joueurs[joueur].idJoueur],"tailleMain":partie.joueurs[joueur].main.length,"taillePaquets":partie.paquets[joueur].length,"isLocalPlayer":false})
                }
              }

              
              socket.emit("getCarte",{"main":main,"infosJoueurs":infosJoueurs});
            }
            
            
            if (partie.type=="6quiprend"){
              
              var choix;
              //Cas d'un 6quiprend
              for (var joueur in partie.joueurs){//Renvoi de la main du joueur
                if (partie.joueurs[joueur].idJoueur==socket.data.userId){
                  main = partie.joueurs[joueur].main;
        
                  if(partie.joueurs[joueur].choix!=null){choix=false}
                  else{choix=true}

                  infosJoueurs.push({"pseudo":pseudos[partie.joueurs[joueur].idJoueur],"isLocalPlayer":true,"tetes":partie.joueurs[joueur].score,"doitJouer":choix})
                }
                else{
                  if(partie.joueurs[joueur].choix!=null){choix=false}
                  else{choix=true}
                  infosJoueurs.push({"pseudo":pseudos[partie.joueurs[joueur].idJoueur],"isLocalPlayer":false,"tetes":partie.joueurs[joueur].score,"doitJouer":choix})
                }
              }
              io.emit("getScores",{"idPartie":partie.id,"infosJoueurs":infosJoueurs});
              socket.emit("getCarte",{"main":main,"infosJoueurs":infosJoueurs})
            }

            if (partie.type=="shadowHunter"){
              var joueurCourant;
              var joueurs = []
              
              for (var joueur of partie.joueurs){//Renvoi de la main du joueur

                if (joueur.idJoueur==socket.data.userId){//Joueur courant
                  joueurCourant = {"idJoueur":joueur.idJoueur,"dégats":joueur.hurtPoint,"révélé":joueur.révélé,"position":partie.zones[joueur.position][4],"personnage":joueur.character,"stuff":joueur.objets,"pouvoirUtilisé":joueur.pouvoirUtilisé,"couleur":joueur.couleur}
                  if (joueur.éliminé==false){
                  if (joueur.révélé==false){joueurs.push({"pseudo":pseudos[joueur.idJoueur],"dégats":joueur.hurtPoint,"position":partie.zones[joueur.position][4],"révélé":false,"stuff":joueur.objets,"pouvoirUtilisé":joueur.pouvoirUtilisé,"couleur":joueur.couleur})}
                  else{joueurs.push({"pseudo":pseudos[joueur.idJoueur],"position":partie.zones[joueur.position][4],"dégats":joueur.hurtPoint,"révélé":joueur.character,"stuff":joueur.objets,"pouvoirUtilisé":joueur.pouvoirUtilisé,"couleur":joueur.couleur})}
                  }
                }
                else{//Autres joueurs
                  if (joueur.éliminé==false){
                  if (joueur.révélé==false){joueurs.push({"pseudo":pseudos[joueur.idJoueur],"dégats":joueur.hurtPoint,"position":partie.zones[joueur.position][4],"révélé":false,"stuff":joueur.objets,"pouvoirUtilisé":joueur.pouvoirUtilisé,"couleur":joueur.couleur})}
                  else{joueurs.push({"pseudo":pseudos[joueur.idJoueur],"position":partie.zones[joueur.position][4],"dégats":joueur.hurtPoint,"révélé":joueur.character,"stuff":joueur.objets,"pouvoirUtilisé":joueur.pouvoirUtilisé,"couleur":joueur.couleur})
                  }
                }
              }
                }
              socket.emit("getCarte",{"joueurCourant":joueurCourant,"joueurs":joueurs})
            }
          }
        }
        
        
      })
      
      
      //------------------------------------REJOINDRE UNE PARTIE------------------------------------------
      
      socket.on("rejoindrePartie", data=>{
        console.log("| Le joueur "+socket.data.userId+" ("+pseudos[socket.data.userId]+") rejoint la partie "+data.idPartie)
        for (var partie of partiesOuvertes){ 
          if (data.idPartie==partie.id && partie.joueurs.length<partie.joueursMax){
            for (var z of partie.joueurs){if (z.idJoueur==socket.data.userId){return}}
            if (partie.addPlayer(socket.data.userId)!=false){
              socket.emit("rejoindrePartie",partie.id);
              if (partie.joueurs.length==partie.joueursMax){
                lancerPartie(partie.id);
                //Renvoi de choses différentes selon le type de partie
                setTimeout(() => {
                  if (partie.type=="Bataille"){io.emit("gameStarting",{"idPartie":data.idPartie})}
                }, 1000);
                
                setTimeout(() => {
                  
                  if (partie.type=="6quiprend"){
                  let listejoueurs = [];
                  for (var joueur of partie.joueurs){listejoueurs.push(pseudos[joueur.idJoueur]);};
                  console.log(partie)
                  io.emit("gameStarting",{"idPartie":data.idPartie,"lignes":partie.lignes,"joueurs":listejoueurs})}
                }, 1000);

                setTimeout(() => {
                  if (partie.type=="shadowHunter"){
                  
                  let listejoueurs = [];
                  for (var joueur of partie.joueurs){listejoueurs.push(pseudos[joueur.idJoueur])}
                  io.emit("gameStarting",{"idPartie":data.idPartie,"joueurs":listejoueurs,"zones":partie.zones})
                  setTimeout(()=>{
                    io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant,"défaut":false}},"idPartie":data.idPartie})
                    },200)}
                  }, 1000);
                
                
              }
              return;}
            }
          }
          
          socket.emit("rejoindrePartie",false);
          return;
          
          
        })
        //-----------------------------------------JOUER UNE CARTE-----------------------
        
        socket.on('carteJoueeBataille',data=>{//Je veux recevoir {idPartie,idJoueur, et choix={valeur,couleur}}
          
          
          for (var partie of partiesEnCours){
            if (partie.id==data.idPartie){
              
              for (var joueur of partie.joueurs){
                if (joueur.idJoueur==socket.data.userId){
                  if (joueur.setChoice(data.choix.valeur,data.choix.couleur)==true){  
                    socket.emit('carteJouee',{'valeur':data.choix.valeur,'couleur':data.choix.couleur,'pseudo':pseudos[socket.data.userId]});
                  }
                  else{
                    socket.emit('carteJouee',false)
                  }
                }
              }
              if (partie.égalité==true){//Si on etait dejà dans une égalité
                
                if (partie.canTourégalité()){
                  
                  var cartesJouees = [];//Les cartes jouees pendant le tour
                  for (var joueur of partie.joueurségalité){cartesJouees.push({"idJoueur":joueur.idJoueur,"pseudo":pseudos[joueur.idJoueur],"choix":joueur.choix});}
                  
                  var winner = partie.tourégalité();
                  
                  var finipartie = partie.existeWinner();
                  if (finipartie!=false){
                    db.run("UPDATE users SET scoreBataille = scoreBataille+1 WHERE idU="+finipartie.idJoueur )
                    socket.emit('partieFinie',{'gagnant':pseudos[finipartie.idJoueur]});return}
                    
                    if (winner==false){
                      io.emit('tourPasse',{"idPartie":partie.id,"cartesJouees":cartesJouees,"winner":false});
                      partie.égalité = false;
                      return
                    }
                    else{
                      
                      
                      io.emit('tourPasse',{"idPartie":partie.id,"cartesJouees":cartesJouees,"winner":pseudos[winner.idJoueur],"égalité":false})
                      partie.égalité = false;
                      return
                    }
                    
                  }
                }
                else{
                  
                  
                  if (partie.canTour()){//Cas où il n'y a pas eu d'égalité au tour précédent
                    // me dit si tous les joueurs on fait leur choix
                    
                    
                    var cartesJouees = [];//Les cartes jouees pendant le tour
                    for (var joueur of partie.joueurs){cartesJouees.push({"idJoueur":joueur.idJoueur,"pseudo":pseudos[joueur.idJoueur],"choix":joueur.choix});}
                    
                    var winner = partie.tour();
                    
                    var finipartie = partie.existeWinner();
                    if (finipartie!=false){
                      db.run("UPDATE users SET scoreBataille = scoreBataille+1 WHERE idU="+finipartie.idJoueur );
                      socket.emit('partieFinie',{'gagnant':pseudos[finipartie.idJoueur]});return}
                      
                      if (winner==false){
                        winner = []
                        var returnegal = [];
                        for (var joueur of partie.joueurségalité){
                          winner.push({"idJoueur":joueur.idJoueur,"pseudo":pseudos[joueur.idJoueur]})
                        }
                        
                        io.emit('tourPasse',{"idPartie":partie.id,"cartesJouees":cartesJouees,"winner":winner,"égalité":true});
                        partie.égalité = true
                        return;
                      }
                      else{
                        io.emit('tourPasse',{"idPartie":partie.id,"cartesJouees":cartesJouees,"winner":pseudos[winner.idJoueur],"égalité":false})
                        partie.égalité = false;
                        //égalité : bool
                        
                        return;
                      }
                    }
                    
                  }
                }
                
                
                
              }
              
            }
            )
            
            
            //Demande d'actualisation des infos bataille
            socket.on('isHost', data=>{
              // console.log("isHost");
              for (var partie of partiesEnCours){
                if (partie.id==data.idPartie){
                  for(var joueur of partie.joueurs){
                    // console.log(joueur);
                    if (joueur.isHost && joueur.idJoueur === socket.data.userId){
                      socket.emit('isHost',true);
                      return;
                      // console.log("true host");
                    }
                    else{
                      socket.emit('isHost',false);
                      return;
                      // console.log("false host");
                    }
                  }
                }
              }
            for (var partie of partiesOuvertes){
              if (partie.id==data.idPartie){
                for(var joueur of partie.joueurs){
                  if (joueur.isHost && joueur.idJoueur === socket.data.userId){
                    socket.emit('isHost',true);
                    return;
                  }
                  else{
                    socket.emit('isHost',false);
                    return;
                  }
                }
              }
            }
          })
            
            socket.on('infosLobby',data=>{
          
              var retour = []; 
              
              for (var partie of partiesOuvertes){//On selectionne la bonne partie
                
                if (partie.id==data.idPartie){
                  
                  for (var j of partie.joueurs){//On renvoie la liste des joueurs
                    
                    retour.push(pseudos[j.idJoueur]);
                  }
                  socket.emit('infosLobby',{'joueurs':retour,'nbJoueurs':partie.joueurs.length,'joueursMax':partie.joueursMax,'host':partie.hosts})
                  return
                }
              }
            })
            
            
            socket.on("joueurQuitte",data=>{  
              
              for (var partie of partiesOuvertes){//enleversi la partie n'a pas commencé
                if (partie.id==data.idPartie){
                  for (var joueur in partie.joueurs){
                    if (partie.joueurs[joueur].idJoueur==socket.data.userId){
                      partie.joueurs.splice[joueur];
                      partie.nbJoueurs--
                      return;
                    }
                  }
                }
              }
              
              for (var partie of partiesEnCours){//Cas où la partie a commencé (plus complexe, heureusement il y a une méthode dans game)
                if (partie.id==data.idPartie){
                  partie.removePlayer(socket.data.userId);
                  var finipartie = partie.existeWinner();
                  
                  if (finipartie!=false){
                    
                    db.run("UPDATE users SET scoreBataille = scoreBataille+1 WHERE idU="+finipartie.idJoueur )
                    
                    socket.emit('partieFinie',{'gagnant':pseudos[finipartie.idJoueur]})}
                    return;
                  }
                }
                
                
                
              })
              
              
              socket.on("quisuisje?",data=>{
                socket.emit("quisuisje",pseudos[socket.data.userId])
              });

              //------------------------------FONCTIONS POUR LE 6QUIPREND--------------------------------------------------
            

              function tryWinner(partie){
             
                if (partie.isOver()==false){return;}

                var classement = partie.rank();
                var retour = [];
                for (var joueur of classement){
                  db.run("UPDATE users SET score6quiprend = score6quiprend+"+((66-joueur.score)*2)+" WHERE idU="+joueur.idJoueur )
                  retour.push({"pseudo":pseudos[joueur.idJoueur],"score":joueur.score})
                  
                }
                console.log(retour)

                io.emit("gameFinished",{"idPartie":partie.id,"classement":retour})
                

                for (var game in partiesEnCours){
                  if (partiesEnCours[game].id == partie.id){partiesEnCours.splice(game,1)}

                }


              }

              async function poursuivreTour(partie){//Fonction essentielle, permet le déroulement asynchrone des tours

                
                var joueur = partie.joueurMin();
                if (joueur==false){return;}
                var valCarte = joueur.choix.valeur

                if (partie.placerCarte(joueur.idJoueur)){//Cas où la carte a été placée, pas de problème, aucun autre joueur à évaluer
                    if (partie.joueurMin()==false){
                      partie.redistrib();
                      io.emit("tourPasse",{"idPartie":partie.id,"carteEval":false,"joueurEval":false,"choixNecessaire":false,"lignes":partie.lignes})
                      partie.tourEnCours = false;
                      tryWinner(partie);
                      return;}
                    else{//Cas où la carte a été placée, aucun problème, on envoie le prochain joueur évalué
                      io.emit("tourPasse",{"idPartie":partie.id,"carteEval":partie.joueurMin().choix.valeur,"joueurEval":pseudos[partie.joueurMin().idJoueur],"choixNecessaire":false,"lignes":partie.lignes})
                    setTimeout(() => {poursuivreTour(partie)},1700)
                    return;}
                  }

                  else{//Cas où un choix de ligne est nécessaire
                    io.emit("tourPasse",{"idPartie":partie.id,"carteEval":valCarte,"joueurEval":pseudos[joueur.idJoueur],"choixNecessaire":true,"lignes":partie.lignes})
                    return;
                  }
                }
              






              socket.on("choixCarte",data=>{
                for (var partie of partiesEnCours){
                  if (partie.id == data.idPartie){
                    if (partie.type=="6quiprend" && partie.tourEnCours!=true){
                      for (var joueur of partie.joueurs){//Renvoi de la main du joueur
                        if (joueur.idJoueur==socket.data.userId){
                          
                          if (joueur.setChoice(data.idCarte,"")!=false){
                            console.log("carte jouée par: "+pseudos[socket.data.userId])
                            console.log(data)
                            socket.emit("choixCarte",data.idCarte);
                          }
                          else{socket.emit("choixCarte",false);}


                            if (partie.canTour()){
                              console.log("un tour passe")
                              partie.tourEnCours = true;
                              io.emit("tourPasse",{"idPartie":partie.id,"carteEval":partie.joueurMin().choix.valeur,"joueurEval":pseudos[partie.joueurMin().idJoueur],"choixNecessaire":false,"lignes":partie.lignes})
                              setTimeout(()=>{poursuivreTour(partie)},1700)

                            }


                        }}}}}})//AFFREUX



              socket.on("choixLigne",data=>{
                  console.log("ligne "+data.idLigne+" choisie par "+pseudos[socket.data.userId])
                let ligne = data.idLigne;
                
                for (var partie of partiesEnCours){
                  if (partie.id == data.idPartie){
                    if (partie.type=="6quiprend"){
                      if ((partie.joueurQuiChoisit == null) || (partie.joueurQuiChoisit!=socket.data.userId)){
                        return;}
                    
                            if (partie.prendreLigne(socket.data.userId,ligne)){
                              console.log(   "  |_choix effectué avec succès_|")
                              partie.joueurQuiChoisit = null;
                              

                              if (partie.joueurMin()!=false){
                                io.emit("tourPasse",{"idPartie":partie.id,"carteEval":partie.joueurMin().choix.valeur,"joueurEval":pseudos[partie.joueurMin().idJoueur],"choixNecessaire":false,"lignes":partie.lignes})
                                setTimeout(()=>{poursuivreTour(partie)},1700)                                
                              }
                              else{
                                io.emit("tourPasse",{"idPartie":partie.id,"carteEval":false,"joueurEval":false,"choixNecessaire":false,"lignes":partie.lignes})
                                partie.tourEnCours = false;
                               
                              }
                             

                              return;
                            }
              }}}})



              
                          //-----------Pour Shadow Hunter (ça va être long)------------------------------
                           
                          //-------Les fonctions-----------------------------------
                          function tourPasseDeCirconstance(partie){//Renvoie un tourPasse selon l'état actuel de la partie. Sert à éviter qu'on soit bloqués si Allie utilise son pouvoir ou si quelqu'un se révèle au mauvais moment
                            testFinPartie(partie)//on sait jamais :)
                           
                           
                            //La fonction va être trèèèèès longue
                            switch (partie.state){
                              //Les dés et système

                              case "choixDavid":
                              console.log(partie.défausseBlanche)
                              console.log(partie.défausseNoire)
                                var boutons = []
                                for (var carte of partie.défausseBlanche){if (carte.type=="équipement"){boutons.push(carte.valeur)}}
                                for (var carte of partie.défausseNoire){if (carte.type=="équipement"){boutons.push(carte.valeur)}}
                                
                              io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" récupère un objet dans l'une des défausses !","rapportAction":{"type":"choix","valeur":{"boutons":boutons,"idJoueur":partie.joueurCourant,"défaut":"David"}}})
                              return
                              break

                              case "CharlesFinTour":
                                for (var joueur of partie.joueurs){
                                  if (joueur.idJoueur==partie.joueurCourant){
                                    if (joueur.hurtPoint<9){
                                      io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" choisit s'il veut terminer son tour.","rapportAction":{"type":"choix","valeur":{"boutons":["terminer son tour.","attaquer de nouveau"],"idJoueur":partie.joueurCourant,"défaut":false}}})
                                    }
                                    else{
                                    io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" choisit s'il veut terminer son tour.","rapportAction":{"type":"choix","valeur":{"boutons":["terminer son tour."],"idJoueur":partie.joueurCourant,"défaut":false}}})
                                    }
                                  }
                                }
                              break
                              case "vision1":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" peut sonder l'âme de quelqu'un... mais qui ? ","rapportAction":{type:"vision1",valeur:{"vision":partie.variableTemp,"idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                              break
                              case "vision2":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" sonde l'âme de "+pseudos[partie.variableTemp.cible],"rapportAction":{"type":"vision2","valeur":{"boutons":["dire la vérité","mentir"],"vision":partie.variableTemp.vision,"idJoueur":partie.variableTemp.cible}},"idPartie":partie.id})
                              break                              

                              case "vision3":
                                io.emit("tourPasse",{"Message":pseudos[partie.variableTemp.cible]+" doit donner un objet à "+pseudos[partie.joueurCourant],"rapportAction":{"type":"vision2","valeur":{"boutons":["refuser"],"vision":partie.variableTemp.vision,"idJoueur":partie.variableTemp.cible}},"idPartie":partie.id})                              


                              case "choixStuff":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit quel objet récupérer.","rapportAction":{"type":"choix","valeur":{"boutons":partie.variableTemp,"défaut":false,"idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                              break
                              case "contre-attaque":
                                io.emit("tourPasse",{"Message":pseudos[partie.variableTemp]+" choisit s'il souhaite contre-attaquer.","rapportAction":{"type":"choix","valeur":{"boutons":["contre-attaquer !","ne rien faire..."],"défaut":"Loup-Garou","idJoueur":partie.variableTemp}},"idPartie":partie.id})
                              break

                              case "choixDestination":
                                io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" est chanceux et peut choisir où aller !","rapportAction":false})

                                break
                              case "débutTour":
                                io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}}})
                              break
                              case "choixPioche":
                                io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" doit cliquer sur la pioche dont il souhaite tirer une carte !","rapportAction":false})
                              break
                              case "finTour":
                                io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" choisit s'il veut terminer son tour.","rapportAction":{"type":"choix","valeur":{"boutons":["terminer son tour."],"idJoueur":partie.joueurCourant,"défaut":false}}})
                                break


                              case "phase_Attaque"://Génère le bon tourPasse pour la phase d'attaque et la skip si impossible
                                var joueur;
                                for (var test of partie.joueurs){if (test.idJoueur==partie.joueurCourant){joueur=test}}

                              if (!partie.existTarget(joueur)){
                                  partie.state = "finTour"
                                  io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" choisit s'il veut terminer son tour.","rapportAction":{"type":"choix","valeur":{"boutons":["terminer son tour."],"idJoueur":partie.joueurCourant}}})
                                  return
                                }
                                var cibles = []
                                for (var j of partie.joueurs){
                                  if (j.idJoueur!=joueur.idJoueur && partie.canAttack(joueur.idJoueur,j.idJoueur)){
                                    cibles.push(pseudos[j.idJoueur])
                                  }                                  
                                }
                                if (!joueur.hasItem("Sabre_Hanté_Masamune")){
                                cibles.push("personne")
                                }
                                io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" choisit qui attaquer.","rapportAction":{"type":"choix","valeur":{"boutons":cibles,"idJoueur":partie.joueurCourant}}})
                                break


                                case "Forêt_Hantée_1":
                                  io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" choisit s'il veut faire le bien... ou faire le mal.","rapportAction":{"type":"choix","valeur":{"boutons":["attaquer","soigner"],"défaut":"Zone5","idJoueur":partie.joueurCourant}}})
                                break
                                case "Forêt_Hantée_2":
                                  io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" clique sur le joueur sur qui utiliser la magie de la forêt.","rapportAction":false})
                                break
                              case "Sanctuaire_Ancien":
                                io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" clique sur un objet d'un autre joueur pour le voler !","rapportAction":false})
                              break
                              //Les noires
                              case "Araignée_Sanguinaire":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a pioché une araignée sanguinaire et clique sur la carte de la personne vers qui l'envoyer !","rapportAction":{type:"cartePiochée",valeur:"Araignée_Sanguinaire"},"idPartie":partie.id})
                                break
                              case "Chauve-Souris_Vampire":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a pioché une chauve-souris vampire et choisit à qui voler son énergie vitale...","rapportAction":{type:"cartePiochée",valeur:"Chauve-Souris_Vampire"},"idPartie":partie.id})
                              break
                            
                              case "Peau_De_Banane_1":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a pioché une peau de banane... L'un de ses équipements lui glisse des mains ! Reste à cliquer pour décider duquel...","rapportAction": {type:"cartePiochée",valeur:"Peau_de_Banane"},"idPartie":partie.id})
                              break
                              case "Peau_De_Banane_2":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit qui trouvera son objet...","rapportAction": {type:"cartePiochée","valeur":partie.variableTemp},"idPartie":partie.id})
                                break
                                case "Poupée_Démoniaque":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a trouvé une poupée étrange et s'amuse avec... Mais l'image d'un autre joueur lui vient en tête. Qui est-ce ?","rapportAction":{type:"cartePiochée",valeur:"Poupée_Démoniaque"},"idPartie":partie.id})
                              break
                              case "Rituel_Diabolique":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" tombe sur les restes d'un vieux rituel maléfique et décide s'il souhaite s'y intéresser de plus près...","rapportAction":{"type":"choix","valeur":{"idJoueur":partie.joueurCourant,"boutons":["S'intéresser au rituel","Le laisser où il est"],"défaut":"Rituel_Diabolique"}},"idPartie":partie.id})
                              break
                              case "Succube_Tentatrice":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a trouvé une succube qui propose de l'aider à voler l'objet d'un joueur. "+pseudos[partie.joueurCourant]+" clique sur l'objet à voler !","rapportAction":{type:"cartePiochée",valeur:"Succube_Tentatrice"},"idPartie":partie.id})
                              break
                                //Les blanches
                              case "Avènement_Suprême":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" est touché d'une lumière bienveillante... Mais cette personne veut-elle révéler la couleur de son âme ?","rapportAction":{"type":"choix","valeur":{"idJoueur":partie.joueurCourant,"boutons":["accepter la lumière","poursuivre son chemin"],"défaut":"Avènement_Suprême"}},"idPartie":partie.id})
                              break
                              case "Barre_De_Chocolat":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a trouvé... une barre de chocolat ?","rapportAction":{"type":"choix","valeur":{"idJoueur":partie.joueurCourant,"boutons":["la manger","l'ignorer"],"défaut":"Barre_De_Chocolat"}},"idPartie":partie.id})
                                break
                                case "Bénédiction":
                                  io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" offre sa bénédiction à un joueur... mais lequel ?","rapportAction": {type:"cartePiochée",valeur:"Bénédiction"},"idPartie":partie.id})
                                break

                                case "Premiers_Secours":
                                  io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit sur qui utiliser la trousse de premiers soins.","rapportAction": {type:"cartePiochée",valeur:"Premiers_Secours"},"idPartie":partie.id})

                                break


                            }
                          }

                         

                          function piocheNoire(partie,joueur){//Fonction serveur pour faire piocher une carte noire au joueur passé en paramètre dans l'environnement de la partie
                            var cartePiochée = partie.drawNoire(joueur.idJoueur)
                            if (cartePiochée.valeur=="Peau_De_Banane" && cartePiochée.data=="noItems"){

                              if (joueur.isDead()){
                              io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" est tombé sur une peau de banane et en est mort !","rapportAction":{type:"cartePiochée",valeur:"Peau_De_Banane"},"idPartie":partie.id})
                              tuer(partie,joueur)
                              partie.testCatherine();partie.testDaniel();testFinPartie(partie)

                              }
                            else{                              
                              io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" est tombé sur une peau de banane et a subit un dégât !","rapportAction":{type:"cartePiochée",valeur:"Peau_De_Banane"},"idPartie":partie.id})
                          }
                              setTimeout(() => {
                                tourPasseDeCirconstance(partie)
                              }, 2500);
                              return
                            }
                              if (cartePiochée.valeur=="Dynamite"){
                                if (cartePiochée.data.victimes>0){
                                  var liste = ""
                                  for (var joueurTué in cartePiochée.data.victimes){
                                    if (joueurTué==cartePiochée.data.victimes.length-1 && cartePiochée.data.victimes.length>1){
                                      liste += "et "+pseudos[cartePiochée.data.victimes[joueurTué]]
                                    }
                                    else{
                                      if (joueurTué==0){
                                      liste += ""+pseudos[cartePiochée.data.victimes[joueurTué]]
                                    }
                                    else{
                                      liste += ", "+pseudos[cartePiochée.data.victimes[joueurTué]]
                                      }
                                    }
                                  }
                                  io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a lancé une dynamite sur "+partie.getNameFromZone(partie.zones[cartePiochée.data.destination])+" et tué "+liste,"rapportAction":{type:"cartePiochée",valeur:"Dynamite"},"idPartie":partie.id})
                                  testFinPartie(partie)
                                }
                                else{
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a lancé une dynamite sur "+partie.getNameFromZone(partie.zones[cartePiochée.data.destination]),"rapportAction":{type:"cartePiochée",valeur:"Dynamite"},"idPartie":partie.id})
                                }
                                setTimeout(() => {
                                  tourPasseDeCirconstance(partie)
                                }, 2500);
                              }

                                else{
                                  tourPasseDeCirconstance(partie)
                               
                                }
                            }//Fin piocheNoire

                            function piocheVision(partie,joueur){
                              partie.drawVision()
                              io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" peut sonder l'âme de quelqu'un... mais qui ? ","rapportAction":{type:"vision1",valeur:{"vision":partie.variableTemp,"idJoueur":partie.joueurCourant}},"idPartie":partie.id})

                            }

                          function piocheBlanche(partie,joueur){//Fonction serveur qui pioche une carte blanche et fait des trucs selon la carte
                            var cartePiochée = partie.drawBlanche(joueur.idJoueur)
                            switch (cartePiochée.valeur){
                             
                              case "Eclair_Purificateur":
                                if (cartePiochée.data.victimes.length>0){
                                 
                                  var liste = ""
                                  for (var joueurTué in cartePiochée.data.victimes){
                                    for (var z of partie.joueurs){
                                      if (z.idJoueur==cartePiochée.data.victimes[joueurTué]){partie.testBryan(joueur,z);partie.testCharles(joueur);partie.testCatherine();partie.testDaniel();testFinPartie(partie)}
                                    }
                                    if (joueurTué==cartePiochée.data.victimes.length-1 && cartePiochée.data.victimes.length>1){
                                      liste += "et "+pseudos[cartePiochée.data.victimes[joueurTué]]
                                    }
                                    else{
                                      if (joueurTué==0){
                                      liste += ""+pseudos[cartePiochée.data.victimes[joueurTué]]
                                    }
                                    else{
                                      liste += ", "+pseudos[cartePiochée.data.victimes[joueurTué]]
                                      }
                                    }
                                  }
                                  io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" invoqué un éclair purificateur et tué "+liste,"rapportAction":{type:"cartePiochée",valeur:"Eclair_Purificateur"},"idPartie":partie.id})
                                }
                                else{
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a invoqué un éclair purificateur et infligé 2 dégâts à tout-le-monde ","rapportAction":{type:"cartePiochée",valeur:"Eclair_Purificateur"},"idPartie":partie.id})
                                }
                                setTimeout(() => {
                                  tourPasseDeCirconstance(partie)
                                }, 2500);
                              break




                              case "Miroir_Divin":
                                if (cartePiochée.data==true){
                                  io.emit("tourPasse",{"Message":(pseudos[joueur.idJoueur]+" est révélé par le miroir !"),"rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":joueur.character,"pseudo":pseudos[joueur.idJoueur]}},"idPartie":partie.id})

                                }
                                else{
                                  io.emit("tourPasse",{"Message":"Rien ne se produit.","rapportAction":{type:"cartePiochée",valeur:"Miroir_Divin"},"idPartie":partie.id})

                                }
                                setTimeout(() => {
                                  tourPasseDeCirconstance(partie)
                                }, 2500);
                              break
                              case "Eau_Bénite":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" est soigné de deux points de vie.","rapportAction":{type:"cartePiochée",valeur:"Eau_Bénite"},"idPartie":partie.id})
                                partie.state = "phase_Attaque"
                              setTimeout(() => {
                                tourPasseDeCirconstance(partie)
                              }, 2500);
                              break
                              case "Savoir_Ancestral":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" obtient un savoir ancestral lui permettant de rejouer un tour.","rapportAction":{type:"cartePiochée",valeur:"Savoir_Ancestral"},"idPartie":partie.id})
                                  partie.state = "phase_Attaque"
                                setTimeout(() => {
                                  tourPasseDeCirconstance(partie)
                                }, 2500);
                                break

                                case "Ange_Gardien":
                                  io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" est sous la protection de son ange gardien jusqu'à son prochain tour.","rapportAction":{type:"cartePiochée",valeur:"Ange_Gardien"},"idPartie":partie.id})
                                  partie.state = "phase_Attaque"
                                setTimeout(() => {
                                  tourPasseDeCirconstance(partie)
                                }, 2500);
                                break

                              default:
                                tourPasseDeCirconstance(partie)
                                break
                              }
                          }


                          function tuer(partie,joueur){//Tue un joueur, skip au prochain tour s'Il s'agissait de  joueur courant et envoie tous ses objets dans les défausses. Ne gère pas les tourPasse
                              for (var z of joueur.objets){//Renvoi objets dans la défausse
                                switch (z){

                                  case "Hache_Tueuse":
                                  case "Sabre_Hanté_Masamune":
                                  case "Revolver_Des_Ténèbres":
                                  case "Hachoir_Maudit":
                                  case "Mitrailleuse_Funeste":
                                  case "Tronçonneuse_Du_Mal":
                                    partie.défausseNoire.push(new CarteShadowHunter(z,"équipement"))
                                    break

                                  case "Boussole_Mystique":
                                  case "Broche_De_Chance":
                                  case "Amulette":
                                  case "Toge_Sainte":
                                  case "Lance_De_Longinus":
                                  case "Crucifix_En_Argent":
                                    partie.défausseBlanche.push(new CarteShadowHunter(z,"équipement"))
                                    break
                                  }
                                
                            }//Fin renvoi
                          
                            joueur.éliminé=true
                            if (joueur.idJoueur==partie.joueurCourant){partie.state="débutTour"; partie.nextPlayer()}  
                          }

                         
  
  
                          function effetCase(joueur,partie){//Selon la case courante du joueur, fait des effets différents
                            //Problème: c'est pas le bon joueur qui arrive en param, à résoudre elouand
                            switch (partie.zones[joueur.position]){
                              case "zone1":

                              piocheVision(partie,joueur)

                              break

                              case "zone2":
                                partie.state = "choixPioche"
                                tourPasseDeCirconstance(partie)
                                break

                              case "zone3":
                                piocheBlanche(partie,joueur)

                                break

                                case "zone4":
                                  piocheNoire(partie,joueur)

                                  break
                                  
                                
                              case "zone5":
                                partie.state="Forêt_Hantée_1"
                                tourPasseDeCirconstance(partie)
                                break

                                case "zone6":
                                  if (partie.canSteal(joueur.idJoueur)){
                                  partie.state="Sanctuaire_Ancien"}
                                  else {partie.state="phase_Attaque";}
                                  tourPasseDeCirconstance(partie)
                                  break
                                
                            }
                          }
                          

                          function testFinPartie(partie){//Fonction qui teste si la partie est terminée et, si c'est le cas, qui envoie un socket.emit("partieFinie",data), data étant un tableau contenant le pseudo des joueurs qui ont gagné. La fonction ajoutera aussi du score à ces joueurs
                            if (partie.state=="finished"){return}
                            if (partie.finPartie()){
                              var retour = []
                              for (var j of (partie.joueurs)){
                                if (partie.winners.includes(j.idJoueur)){
                                  retour.push({"pseudo":pseudos[j.idJoueur],"carte":j.character})
                                }
                              }
                                 retour = retour.filter((value, index, self) => {
                                 return self.indexOf(value) === index;
                               });

                              
                              console.log("partie "+partie.id+ "finie. Gagnants:")
                              console.log(retour)
                              partie.state = "finished"
                              io.emit("gameFinished",{"idPartie":partie.id,"gagnants":retour})
                              for (var v of partie.winners){
                                db.run("UPDATE users SET scoreshadowHunter = scoreshadowHunter+"+1+" WHERE idU="+v )
                              }
                              setTimeout(() => {
                                for (var test in partiesEnCours){
                                  if (partiesEnCours[test].id==partie.id){
                                    partiesEnCours.splice(test,1)
                                  }
                                }
                              }, 2500);
        
                              return
                            }

                          }

                          function testAprèsKill(partie,attaquant,victime){
                         
                            partie.testCatherine()
                            partie.testDaniel()
                            partie.testCharles(attaquant)
                            partie.testBryan(attaquant,victime)
                            partie.hasDied = true
                            testFinPartie(partie)                          }
                          //-------Les socket-----------------------------------
                        socket.on("reveleCarte",data=>{
                          
                          for (var partie of partiesEnCours){
                            if (partie.id == data.idPartie){
                              console.log(partie.state)
                              console.log(pseudos[partie.joueurCourant])
                              console.log("Le joueur "+ pseudos[socket.data.userId]+ " s'est révélé avec le personnage "+data.capacite)
                              for (var joueur of partie.joueurs){
                                if (joueur.idJoueur == socket.data.userId){
                                  if (joueur.character==data.capacite && joueur.révélé==false){
                                var datarenvoyee = {"Message":(pseudos[socket.data.userId]+" s'est révélé en tant que "+data.capacite),"rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":data.capacite,"pseudo":pseudos[socket.data.userId]}},"idPartie":data.idPartie}
                                io.emit("tourPasse",datarenvoyee)
                                  joueur.révélé = true;
                                  console.log("    | révélation faite avec succès")
                                    setTimeout(() => {
                                      tourPasseDeCirconstance(partie)
                                      return
                                    }, 2500);
                                  
                                }
                                if (joueur.révélé==true){
                                  console.log("    | joueur déjà révélé !")
                                  
                                  
                                  return
                                }
                                console.log("    | révélation échouée")
                              }}
                            }
                          }
                        })


                        socket.on("choixCarte",data=>{

                          console.log(data)
                          for (var partie of partiesEnCours){
                            if (partie.id == data.idPartie){

                              if (partie.state=="vision3" &&socket.data.userId==partie.variableTemp.cible && data.type=="stuffSelf"&&(partie.variableTemp.vision=="Vision_Enivrante" || partie.variableTemp.vision=="Vision_Cupide"||partie.variableTemp.vision=="Vision_Furtive")){
                                var receveur;
                                var donneur;
                                for (var test of partie.joueurs){
                                  if (test.idJoueur==partie.joueurCourant){receveur=test}
                                  if (test.idJoueur==partie.variableTemp.cible){donneur=test}
                                }
                                if (test==null||receveur==null){return}
                                for (var z in donneur.objets){
                                  if (donneur.objets[z]==data.idCarte){
                                    receveur.objets.push(donneur.objets[z])
                                    donneur.objets.splice(z,1)
                                    io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[donneur.idJoueur]+" a donné son objet à "+pseudos[receveur.idJoueur],"rapportAction":false})
                                    partie.state="phase_Attaque"
                                    setTimeout(() => {
                                      tourPasseDeCirconstance(partie)
                                    }, 2500);
                                    return
                                  }
                                }

                              }

                              if (partie.state=="vision3" && socket.data.userId==partie.variableTemp.cible && data.type=="choix"){//Cas de don d'objet en cas de vision traîté ici car sinon le check l'empêche
                                if (data.text=="refuser"){
                                  var cible
                                  for (var test of partie.joueurs){
                                    if (test.idJoueur==partie.variableTemp.cible){cible=test}
                                  }
                                  partie.state = "phase_Attaque"
                                  cible.hurtPoint++
                                  if (cible.isDead()){
                                    tuer(partie,cible)
                                    testAprèsKill(partie,partie.getJoueurCourant(),cible)

                                    io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a tué "+pseudos[cible.idJoueur]+" qui était " +cible.character.replace(/_/g," ")+ " grâce à sa vision","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":cible.character,"pseudo":pseudos[cible.idJoueur]}},"idPartie":data.idPartie})
                                  }
                                  else{
                                  io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 1 dégât !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                  
                                }
                                setTimeout(() => {
                                  tourPasseDeCirconstance(partie)
                                }, 2500);
                                }
                                return
                              }


                              if (partie.state=="vision2" && socket.data.userId==partie.variableTemp.cible && data.type=="choix"){//Cas de REPONSE à une vision. Traîté ici car sinon le check l'empêche
                                var cible
                                for (var test of partie.joueurs){
                                  if (test.idJoueur==partie.variableTemp.cible){cible=test}
                                }
                                var mentir = false
                                if (cible.character=="Métamorphe"&&!cible.pouvoirUtilisé&&data.text=="mentir"){mentir=true}
                         
                                  
                                    
                                  if (!(data.text=="mentir" || data.text=="dire la vérité")){return}
                                    console.log(partie.variableTemp)
                                    switch (partie.variableTemp.vision){
                                      //D'abord les cas où c'est juste du heal/des dégâts

                                      case "Vision_Suprême":
                                        if (mentir){//Si mensonge, on renvoie qu'il se passe rien
                                          io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                        }
                                        else{
                                          io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" voit la carte de "+ pseudos[partie.variableTemp.cible]+".","rapportAction":{type:"vision1",valeur:{"vision":cible.character,"idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                        }
                                        partie.state = "phase_Attaque"
                                        break
                                        case "Vision_Destructrice":
                                          if (cible.hp>=12 || mentir){
                                            cible.hurtPoint+=2
                                            io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 2 dégâts !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                          }
                                          else{
                                            io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                          }
                                          partie.state = "phase_Attaque"
                                          break

                                          case "Vision_Clairvoyante":
                                            if (cible.hp<=11 && !mentir){
                                              cible.hurtPoint+=2
                                              io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 2 dégâts !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                            }
                                            else{
                                              io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                            }
                                            partie.state = "phase_Attaque"
                                            break

                                      case "Vision_Foudroyante":
                                        if (partie.shadowsBase.includes(cible.character) && !mentir){
                                          cible.hurtPoint++
                                          io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 1 dégât !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                        }
                                        else{
                                          io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                        }
                                        partie.state = "phase_Attaque"
                                        break

                                        case "Vision_Lugubre":
                                          if (partie.shadowsBase.includes(cible.character) && !mentir && cible.hurtPoint>0){
                                            cible.hurtPoint-=2
                                            if (cible.hurtPoint<=0){cible.hurtPoint=0}
                                            io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a été soigné de 2 points de vie !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                          }
                                          else{
                                             if (partie.shadowsBase.includes(cible.character) && !mentir && cible.hurtPoint<=0){
                                              cible.hurtPoint++
                                              io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 1 dégât !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})

                                            }
                                            else{
                                            io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                            }
                                          }
                                            partie.state = "phase_Attaque"
                                          break

                                          case "Vision_Mortifère":
                                            if (partie.hunterBase.includes(cible.character) || mentir){
                                              cible.hurtPoint++
                                              io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 1 dégât !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                            }
                                            else{
                                              io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                            }
                                            partie.state = "phase_Attaque"
                                            break

                                            case "Vision_Réconfortante":
                                          if ((partie.neutresBase.includes(cible.character) || mentir) && cible.hurtPoint>0){
                                            cible.hurtPoint-=1
                                            if (cible.hurtPoint<=0){cible.hurtPoint=0}
                                            io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a été soigné de 1 point de vie !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                          }
                                          else{
                                             if ((partie.neutresBase.includes(cible.character) || mentir) && cible.hurtPoint<=0){
                                              cible.hurtPoint++
                                              io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 1 dégât !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})

                                            }
                                            else{
                                            io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                            }
                                          }
                                            partie.state = "phase_Attaque"
                                          break

                                          case "Vision_Purificatrice":
                                            if (partie.shadowsBase.includes(cible.character) && !mentir){
                                              cible.hurtPoint+=2
                                              io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 2 dégâts !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                            }
                                            else{
                                              io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                            }
                                            partie.state = "phase_Attaque"
                                            break

                                            case "Vision_Divine":
                                              if ((partie.hunterBase.includes(cible.character) || mentir) && cible.hurtPoint>0){
                                                cible.hurtPoint-=2
                                                if (cible.hurtPoint<=0){cible.hurtPoint=0}
                                                io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a été soigné de 1 point de vie !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                              }
                                              else{
                                                 if ((partie.hunterBase.includes(cible.character) || mentir) && cible.hurtPoint<=0){
                                                  cible.hurtPoint++ 
                                                  io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 1 dégât !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                                }
                                                else{
                                                io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                                }
                                              }


                                      case "Vision_Furtive":
                                        if ((partie.hunterBase.includes(cible.character)||partie.shadowsBase.includes(cible.character))&&!mentir){
                                          if (cible.objets.length<=0){
                                            cible.hurtPoint++
                                            io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 1 dégât !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                            partie.state = "phase_Attaque"
                                          }
                                          else{
                                            partie.state="vision3"
                                            io.emit("tourPasse",{"Message":pseudos[partie.variableTemp.cible]+" doit donner un objet à "+pseudos[partie.joueurCourant],"rapportAction":{"type":"vision2","valeur":{"boutons":["refuser"],"vision":partie.variableTemp.vision,"idJoueur":partie.variableTemp.cible}},"idPartie":partie.id})                              
                                            return
                                          }

                                        }
                                        else{
                                          io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                          partie.state = "phase_Attaque"

                                        }

                                      break

                                      case "Vision_Cupide":
                                        if ((partie.neutresBase.includes(cible.character)||partie.shadowsBase.includes(cible.character))&&!mentir){
                                          if (cible.objets.length<=0){
                                            cible.hurtPoint++
                                            io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 1 dégât !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                            partie.state = "phase_Attaque"
                                          }
                                          else{
                                            partie.state="vision3"
                                            io.emit("tourPasse",{"Message":pseudos[partie.variableTemp.cible]+" doit donner un objet à "+pseudos[partie.joueurCourant],"rapportAction":{"type":"vision2","valeur":{"boutons":["refuser"],"vision":partie.variableTemp.vision,"idJoueur":partie.variableTemp.cible}},"idPartie":partie.id})                              
                                          return
                                          }

                                        }
                                        else{
                                          io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                          partie.state = "phase_Attaque"

                                        }

                                      break
                                      case "Vision_Enivrante":
                                        if ((partie.hunterBase.includes(cible.character)||partie.neutresBase.includes(cible.character)) || mentir){
                                          if (cible.objets.length<=0){
                                            cible.hurtPoint++
                                            io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a subit 1 dégât !","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                            partie.state = "phase_Attaque"
                                          }
                                          else{
                                            partie.state="vision3"
                                            io.emit("tourPasse",{"Message":pseudos[partie.variableTemp.cible]+" doit donner un objet à "+pseudos[partie.joueurCourant],"rapportAction":{"type":"vision2","valeur":{"boutons":["refuser"],"vision":partie.variableTemp.vision,"idJoueur":partie.variableTemp.cible}},"idPartie":partie.id})                              
                                            return
                                          }

                                        }
                                        else{
                                          io.emit("tourPasse",{"Message":"Rien ne se passe","rapportAction":{type:"vision1",valeur:{"vision":"Carte_Vision","idJoueur":partie.joueurCourant}},"idPartie":partie.id})
                                          partie.state = "phase_Attaque"

                                        }

                                      break

                                    }
                                    
                                    partie.state = "phase_Attaque"
                                    if (cible.isDead()){
                                  tuer(partie,cible)
                                  testAprèsKill(partie,partie.getJoueurCourant(),cible)

                                  io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a tué "+pseudos[cible.idJoueur]+" qui était " +cible.character.replace(/_/g," ")+ " grâce à sa vision","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":cible.character,"pseudo":pseudos[cible.idJoueur]}},"idPartie":data.idPartie})
                                }

                                setTimeout(() => {
                                  tourPasseDeCirconstance(partie)
                                }, 2500);
                                return 
                              }
                              
                                                
                              


                              if (socket.data.userId==partie.variableTemp &&data.type=="choix"&&partie.state=="contre-attaque"){//Cas de contre-attaque tra^tié avant le reste
                               

                                for (var joueur of partie.joueurs){
                                  if (joueur.idJoueur==socket.data.userId){
                                if (data.text=="contre-attaquer !"){//Cas de contre-attaque
                                  for (var cible of partie.joueurs){
                                    if (cible.idJoueur==partie.joueurCourant){
                                         var d6 =  Math.floor(Math.random()*6)+1
                                          var d4 =  Math.floor(Math.random()*4)+1 
                                     
                                  var dmg =  Math.abs(d6-d4);
                                  if (partie.takeDamage(cible,dmg)==false){//ça ne tue pas
                                  if (cible.révélé){io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+pseudos[partie.joueurCourant],"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible.idJoueur],"dégâts":dmg,"personnages":[joueur.character,cible.character]}},"idPartie":data.idPartie})}
                                  else{io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+pseudos[partie.joueurCourant],"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible.idJoueur],"dégâts":dmg,"personnages":[joueur.character,false]}},"idPartie":data.idPartie})}
                                  partie.variableTemp=""
                                  partie.state = "finTour"
                                  for (var j of partie.joueurs){
                                  if(joueur.character=="Charles"&&joueur.révélé&&!joueur.pouvoirUtilisé && j.idJoueur==partie.joueurCourant){
                                    partie.variableTemp=socket.data.userId
                                    partie.state="CharlesFinTour"}
                                  }
                                  setTimeout(() => {
                                    tourPasseDeCirconstance(partie)
                                  }, 2500);
                                  return
                                }
                                else{//Cas où on a tué
                                  
                                  tuer(partie,cible)
                                  testAprèsKill(partie,partie.getJoueurCourant(),cible)

                                  io.emit("tourPasse",{"Message":pseudos[joueur.idJoueur]+" a tué "+pseudos[cible.idJoueur]+" qui était " +cible.character.replace(/_/g," ")+ " lors de la contre-attaque. Ses objets partent à la défausse.","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":cible.character,"pseudo":pseudos[cible.idJoueur]}},"idPartie":data.idPartie})

                                  setTimeout(() => {
                                      tourPasseDeCirconstance(partie)
                                    }, 2500);
                                }//Fin cas de kill
                              }
                            }
                                }
                                else{//Cas de non contre-attaque
                                  partie.state = "finTour"
                                  for (var j of partie.joueurs){
                                    if(joueur.character=="Charles"&&joueur.révélé&&!joueur.pouvoirUtilisé && j.idJoueur==partie.joueurCourant){
                                      partie.variableTemp=socket.data.userId
                                      partie.state="CharlesFinTour"}
                                    }
                                  tourPasseDeCirconstance(partie)
                                  return
                                }
                              }
                              }}//Fin du cas contre-attaque
                             


                              if (partie.type=="shadowHunter" && partie.joueurCourant==socket.data.userId){
                                for (var joueur of partie.joueurs){//Renvoi de la main du joueur
                                  if (joueur.idJoueur==socket.data.userId){
                                    //Le code
                                    if (data.type=="zone"){
                                      switch (partie.state){
                                        case "pouvoirEmi":

                                          var départ = joueur.position
                                          var arrivée = partie.getIndexFromZone(data.carte)
                                          if (arrivée==(départ+1)||(arrivée==(départ-1))||((départ==0)&&(arrivée==5))||((départ==5)&&(arrivée==0))){
                                          joueur.position = parseInt(partie.getIndexFromZone(data.carte))
                                          io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" s'est déplacé vers "+partie.getNameFromZone(data.carte),"rapportAction":false,"idPartie":data.idPartie})

                                          effetCase(joueur,partie)
                                        }
                                        break;
                                        case "choixDestination":
                                          joueur.position = parseInt(partie.getIndexFromZone(data.carte))
                                          io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" s'est déplacé vers "+partie.getNameFromZone(data.carte),"rapportAction":false,"idPartie":data.idPartie})
                                          effetCase(joueur,partie)
                                          break
                                        
                                      }
                                      
                                    }
                                    if (data.type=="CartePersonnage"){//-----------------------------------------------------------------------------
                                      switch (partie.state){
                                        case "vision1"://Un joueur choisit de donner une vision à un autre
                                        partie.state = "vision2"
                                        partie.variableTemp = {"vision":partie.variableTemp,"cible":getIdFromPseudo(data.joueurConcerne)}
                                        var cible
                                        for (var z of partie.joueurs){if (z.idJoueur==partie.variableTemp.cible){
                                          cible = z
                                        }}
                                        


                                        if (z.character=="Métamorphe"&&!z.pouvoirUtilisé){
                                          io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" sonde l'âme de "+data.joueurConcerne,"rapportAction":{"type":"vision2","valeur":{"boutons":["dire la vérité","mentir"],"vision":partie.variableTemp.vision,"idJoueur":getIdFromPseudo(data.joueurConcerne)}},"idPartie":data.idPartie})
                                        }
                                        else{
                                        io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" sonde l'âme de "+data.joueurConcerne,"rapportAction":{"type":"vision2","valeur":{"boutons":["dire la vérité"],"vision":partie.variableTemp.vision,"idJoueur":getIdFromPseudo(data.joueurConcerne)}},"idPartie":data.idPartie})
                                        }
                                        break

                                        case "Forêt_Hantée_2":
                                          for (var joueur of partie.joueurs){if (joueur.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueur}}
                                          if (partie.variableTemp=="attaquer"){
                                            if (cible.hasItem("Broche_De_Chance")){
                                              io.emit("tourPasse",{"Message":data.joueurConcerne+" a reçu la protection de sa broche de chance !","rapportAction":false,"idPartie":data.idPartie})
                                            }
                                            else{
                                            if (cible.protected==false){
                                              cible.hurtPoint+=2
                                            if (cible.hasItem("Toge_Sainte")){cible.hurtPoint--}}
                                            if (cible.isDead()){
                                              tuer(partie,cible)
                                              
                                              testAprèsKill(partie,partie.getJoueurCourant(),cible)
                                              io.emit("tourPasse",{"Message":pseudos[cible.idJoueur]+" a été achevé par la magie de la forêt. Il s'agissait de  " +cible.character.replace(/_/g," ")+ ".","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":cible.character,"pseudo":pseudos[cible.idJoueur]}},"idPartie":data.idPartie})                                     
                                            }
                                            else{
                                            io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a blessé "+data.joueurConcerne+" grâce à la forêt.","rapportAction":false,"idPartie":data.idPartie})
                                            }
                                          }
                                        }
                                          if (partie.variableTemp=="soigner"){
                                            
                                            cible.hurtPoint-=1
                                            if (cible.hurtPoint<0){cible.hurtPoint=0}
                                            io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a soigné "+data.joueurConcerne+" grâce à la forêt.","rapportAction":false,"idPartie":data.idPartie})
                                          } 
                                          partie.state = "phase_Attaque"
                                          setTimeout(() => {
                                            tourPasseDeCirconstance(partie)
                                          }, 2500);
                                          break

                                          //Cartes piochées

                                          case "Peau_De_Banane_2":
                                            if (partie.joueurCourant!=getIdFromPseudo(data.joueurConcerne)){
                                              for (var test of partie.joueurs){
                                                if (test.idJoueur==partie.joueurCourant){
                                                  for (var z in test.objets){
                                                    if (test.objets[z]==partie.variableTemp){test.objets.splice(z,1)}
                                                  }
                                                  }
                                                }
                                                for (var test of partie.joueurs){
                                                  if (test.idJoueur==getIdFromPseudo(data.joueurConcerne)){
                                                    test.objets.push(partie.variableTemp)
                                                    partie.state = "phase_Attaque"
                                                    io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" a donné son objet à "+data.joueurConcerne,"rapportAction":false})
                                                    setTimeout(() => {tourPasseDeCirconstance(partie)}, 2500);
                                                    partie.variableTemp=""
                                                  }
                                                }
                                            }

                                          break
                                          
                                        case "Chauve-Souris_Vampire":
                                          
                                          for (var joueu of partie.joueurs){if (joueu.idJoueur==partie.joueurCourant){cible=joueu}}
                                          cible.hurtPoint-=1
                                          if (cible.hurtPoint<0){cible.hurtPoint=0}
                                          
                                          for (var joueu of partie.joueurs){if (joueu.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueu}}
                                          if (cible.protected==false  && !cible.hasItem("Amulette")){
                                            cible.hurtPoint+=2
                                            if (cible.hasItem("Toge_Sainte")){cible.hurtPoint--}
                                          }
                                          partie.state = "phase_Attaque"
                                


                                          if (cible.isDead()){
                                            tuer(partie,cible)
                                            io.emit("tourPasse",{"Message":pseudos[joueur.idJoueur]+" a tué "+pseudos[cible.idJoueur]+" qui était " +cible.character.replace(/_/g," ")+ " avec la chauve-souris. Ses objets partent à la défausse.","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":cible.character,"pseudo":pseudos[cible.idJoueur]}},"idPartie":data.idPartie})
                                            testAprèsKill(partie,partie.getJoueurCourant(),cible)

                                          }
                                          else{
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a volé de la vie à "+data.joueurConcerne,"rapportAction":false,"idPartie":partie.id})
                                          }


                                          setTimeout(() => {
                                            tourPasseDeCirconstance(partie)
                                          }, 2500);
                                          break

                                          case "Araignée_Sanguinaire":
                                           var cible
                                            for (var joueu of partie.joueurs){if (joueu.idJoueur==partie.joueurCourant){cible=joueu}}
                                            if (joueu.protected==false && !cible.hasItem("Amulette")){
                                            cible.hurtPoint+=2
                                            if (cible.hasItem("Toge_Sainte")){cible.hurtPoint--}
                                          }
                                          for (var joueu of partie.joueurs){if (joueu.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueu}}
                                          if (cible.protected==false && !cible.hasItem("Amulette")){
                                            cible.hurtPoint+=2
                                            if (cible.hasItem("Toge_Sainte")){cible.hurtPoint--}
                                          }
                                            partie.state = "phase_Attaque"
                                          
                                            if (cible.isDead()||joueur.isDead()){//Si un mort

                                            if (cible.isDead()){
                                            tuer(partie,cible) 
                                            
                                          }
                                          if (joueur.isDead()){
                                            tuer(partie,joueur)
                                        }
                                        testAprèsKill(partie,partie.getJoueurCourant(),cible)        
                                        if (cible.isDead()&&joueur.isDead()){//Cas double mort
                                          io.emit("tourPasse",{"Message":pseudos[joueur.idJoueur]+" et "+pseudos[cible.idJoueur]+" sont tous les deux morts. Ils étaient " +cible.character.replace(/_/g," ")+ " et "+joueur.character.replace(/_/g," "),"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[joueur.idJoueur],"dégâts":9999,"personnages":[joueur.character,cible.character]}},"idPartie":data.idPartie})                                      
                                        }
                                        else{
                                          if (cible.isDead()){//Cas où seule la cible est morte
                                            io.emit("tourPasse",{"Message":pseudos[joueur.idJoueur]+" a tué "+pseudos[cible.idJoueur]+" qui était " +cible.character.replace(/_/g," ")+ " avec l'araignée. Ses objets partent à la défausse.","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":cible.character,"pseudo":pseudos[cible.idJoueur]}},"idPartie":data.idPartie})                                                                                 
                                          }
                                          else{//Cas où seul le lanceur est mort
                                            io.emit("tourPasse",{"Message":pseudos[joueur.idJoueur]+" a succombé l'araignée. Il s'agissait de  " +joueur.character.replace(/_/g," ")+ ". Ses objets partent à la défausse.","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":joueur.character,"pseudo":pseudos[joueur.idJoueur]}},"idPartie":data.idPartie})                                     
                                          }
                                        }
                                      }//Fin si un mort

                                            else{
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" et "+data.joueurConcerne+" ont été victimes de l'araignée ! Ils subissent 2 dégâts.","rapportAction":false,"idPartie":partie.id})
                                          }
                                            setTimeout(() => {
                                              tourPasseDeCirconstance(partie)
                                            }, 2500);
                                            break

                                            case "Poupée_Démoniaque":
                                              partie.state =  "phase_Attaque"
                                              var chance = Math.floor(Math.random()*6)
                                              console.log(chance)
                                              if (chance>=4){//Cas de backfire
                                                for (var joueur of partie.joueurs){
                                                  if (joueur.idJoueur==partie.joueurCourant){
                                                    if (joueur.protected==false && !joueur.hasItem("Amulette")){
                                                      joueur.hurtPoint+=3
                                                      if (joueur.isDead()){//Le joueur s'est tué avec la poupée
                                                        tuer(partie,joueur)
                                                        testAprèsKill(partie,partie.getJoueurCourant(),cible)
                                                        io.emit("tourPasse",{"Message":pseudos[joueur.idJoueur]+" a été violemment assassiné par la poupée. Il s'agissait de  " +joueur.character.replace(/_/g," ")+ ".","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":joueur.character,"pseudo":pseudos[joueur.idJoueur]}},"idPartie":data.idPartie})                                     
                                                        setTimeout(() => {
                                                          tourPasseDeCirconstance(partie)
                                                        }, 2500);
                                                        return
                                                      }
                                                      else{//Le joueur est simplement attaqué
                                                        io.emit("tourPasse",{"Message":"La poupée se retourne contre "+pseudos[partie.joueurCourant]+" et lui inflige 3 dégâts !","rapportAction":false,"idPartie":partie.id})
                                                        setTimeout(() => {
                                                          tourPasseDeCirconstance(partie)
                                                        }, 2500);
                                                        return
                                                      }
                                                  
                                              }
                                                else{
                                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a reçu une protection contre la poupée lorsqu'elle a tenté de l'attaquer.","rapportAction":false,"idPartie":partie.id})
                                                setTimeout(() => {
                                                  tourPasseDeCirconstance(partie)
                                                }, 2500);
                                                return
                                              }
                                            }}}

                                              else{//Cas où ça se passe bien pour l'utilisateur
                                                for (var jou of partie.joueurs){
                                                  if (jou.idJoueur==getIdFromPseudo(data.joueurConcerne)){
                                                    if (jou.protected==false && !jou.hasItem("Amulette")){//Cas où la poupée attaque
                                                      jou.hurtPoint+=3

                                                      if (jou.isDead()){
                                                        tuer(partie,jou)
                                                        testAprèsKill(partie,partie.getJoueurCourant(),cible)

                                                        io.emit("tourPasse",{"Message":pseudos[jou.idJoueur]+" est mis en pièce par la poupée. Il s'agissait de  " +jou.character.replace(/_/g," ")+ ".","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":jou.character,"pseudo":pseudos[jou.idJoueur]}},"idPartie":data.idPartie})                                     
                                                      }
                                                      else{
                                                        io.emit("tourPasse",{"Message":"La poupée est prise d'une pulsion vengeresse et s'attaque à "+data.joueurConcerne+"  ! Il subit 3 dégâts !","rapportAction":false,"idPartie":partie.id})
                                                      }

                                                    }
                                                    else{//Cas où la cible était protégée
                                                      io.emit("tourPasse",{"Message":data.joueurConcerne+" a été protégé de la poupée envoyée par "+pseudos[partie.joueurCourant]+" !","rapportAction":false,"idPartie":partie.id})
                                                    }
                                                  }
                                                }
                                              }
                                              setTimeout(() => {
                                                tourPasseDeCirconstance(partie)
                                              }, 2500);
                                              break//Fin poupée

                                              case "Bénédiction":
                                                if (getIdFromPseudo(data.joueurConcerne)==partie.joueurCourant){return}
                                                var chance = Math.floor(Math.random()*6)+1
                                                for (var joueur of partie.joueurs){
                                                  if (joueur.idJoueur==getIdFromPseudo(data.joueurConcerne)){
                                                    joueur.hurtPoint-=chance
                                                    if (joueur.hurtPoint<=0){joueur.hurtPoint=0}
                                                    partie.state = "phase_Attaque"
                                                    io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a soigné "+data.joueurConcerne+" de "+chance+" points de vie.","rapportAction":{"type":"jetsDeDés","valeur":[chance,false]},"idPartie":partie.id})
                                                    setTimeout(() => {
                                                      tourPasseDeCirconstance(partie)
                                                    }, 2500);

                                                  }
                                                }
                                                break//Fin cas bénédiction

                                                case "Premiers_Secours":
                                                  for (var jou of partie.joueurs){
                                                    if (jou.idJoueur==getIdFromPseudo(data.joueurConcerne)){
                                                      jou.hurtPoint=7
                                                      partie.state="phase_Attaque"
                                                      io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a fixé les dégâts de "+data.joueurConcerne+" à 7.","rapportAction":false,"idPartie":partie.id})

                                                      setTimeout(() => {
                                                        tourPasseDeCirconstance(partie)
                                                      }, 2500);
                                                    }
                                                  }
                                                break//Fin cas premiers soins


                                            
                                          //Personnages
                                        case "pouvoirFu-ka":

                                        var cible;
                                        for (var joueu of partie.joueurs){if (joueu.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueu}}
                                        cible.hurtPoint = 7
                                        joueur.pouvoirUtilisé = true
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a ciblé "+data.joueurConcerne+" avec le pouvoir de Fu-ka !","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":"Fu-Ka","pseudo":pseudos[socket.data.userId]}},"idPartie":data.idPartie})
                                        partie.state="débutTour"
                                        setTimeout(() => {
                                          io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}},"idPartie":data.idPartie})
                                        }, 2500);
                                        break;

                                        case "pouvoirFranklin":
                                          partie.state="débutTour"

                                          var cible;
                                          joueur.pouvoirUtilisé = true
                                          for (var joueu of partie.joueurs){if (joueu.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueu}}
                                          var dmg = Math.floor(Math.random()*5)+1
                                          if (cible.protected){dmg=0}
                                          partie.takeDamage(cible,dmg)
                                          
                                          if (cible.isDead()){
                                              tuer(partie,cible)
                                              testAprèsKill(partie,partie.getJoueurCourant(),cible)
                                              io.emit("tourPasse",{"Message":pseudos[joueur.idJoueur]+" a tué "+pseudos[cible.idJoueur]+" avec sa foudre. Il s'agissait de  " +cible.character.replace(/_/g," ")+ ".","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":cible.character,"pseudo":pseudos[cible.idJoueur]}},"idPartie":data.idPartie})                                     

                                          }
                                          else{
                                          if (cible.révélé){io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+data.joueurConcerne,"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,cible.character]}},"idPartie":data.idPartie})}
                                          else{io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+data.joueurConcerne,"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,false]}},"idPartie":data.idPartie})}
                                      }
                                          setTimeout(() => {
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}},"idPartie":data.idPartie})
                                          }, 2500);
                                          break;

                                          case "pouvoirGeorges":
                                            partie.state="débutTour"
                                            joueur.pouvoirUtilisé = true
                                          var cible;
                                          for (var joueu of partie.joueurs){if (joueu.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueu}}
                                          var dmg = Math.floor(Math.random()*3)+1
                                          if (cible.protected){dmg=0}
                                          partie.takeDamage(cible,dmg)
                                          if (cible.isDead()){
                                            tuer(partie,cible)
                                            io.emit("tourPasse",{"Message":pseudos[joueur.idJoueur]+" a tué "+pseudos[cible.idJoueur]+" grâce a démolition. Il s'agissait de  " +cible.character.replace(/_/g," ")+ ".","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":cible.character,"pseudo":pseudos[cible.idJoueur]}},"idPartie":data.idPartie})                                     
                                            testAprèsKill(partie,partie.getJoueurCourant(),cible)

                                          }
                                        else{
                                          if (cible.révélé){io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+pseudos[getIdFromPseudo(data.joueurConcerne)],"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,cible.character]}},"idPartie":data.idPartie})}
                                          else{io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+data.joueurConcerne,"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,false]}},"idPartie":data.idPartie})}
                                        }
                                          
                                          setTimeout(() => {
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}},"idPartie":data.idPartie})
                                          }, 2500);
                                          break;

                                          case "pouvoirEllen":

                                          var cible;
                                          joueur.pouvoirUtilisé = true
                                          for (var joueu of partie.joueurs){if (joueu.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueu}}
                                          cible.pouvoirUtilisé = true
                                          io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a privé "+pseudos[getIdFromPseudo(data.joueurConcerne)]+" de sa capacité !","rapportAction":false,"idPartie":data.idPartie})
                                          partie.state="débutTour"
                                          setTimeout(() => {
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}},"idPartie":data.idPartie})
                                          }, 2500);
                                          break;

                                          case "pouvoirMomie":
                                            
                                          var cible;
                                          joueur.pouvoirCeTour= true
                                          for (var joueu of partie.joueurs){if (joueu.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueu}}
                                          if (cible.position!=partie.getIndexFromZone("zone2")){return}
                                          partie.state="débutTour"
                                          var dmg = 3
                                          if (cible.protected){dmg=0}
                                          partie.takeDamage(cible,dmg)
                                          if (cible.isDead()){
                                            tuer(partie,cible)
                                            io.emit("tourPasse",{"Message":pseudos[joueur.idJoueur]+" a tué "+pseudos[cible.idJoueur]+" avec son maléfice. Il s'agissait de  " +cible.character.replace(/_/g," ")+ ".","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":cible.character,"pseudo":pseudos[cible.idJoueur]}},"idPartie":data.idPartie})                                     
                                            testAprèsKill(partie,partie.getJoueurCourant(),cible)

                                          }
                                            else{
                                          if (cible.révélé){io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+data.joueurConcerne,"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,cible.character]}},"idPartie":data.idPartie})}
                                          else{io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+data.joueurConcerne,"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,false]}},"idPartie":data.idPartie})}
                                            }
                                          setTimeout(() => {
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}},"idPartie":data.idPartie})
                                          }, 2500);
                                          break;


                                      }//Fin switch  

                                    }
                                    if (data.type=="stuffOther"){
                                      if (partie.state=="Succube_Tentatrice" || partie.state=="Sanctuaire_Ancien"){
                                        for (var joueur of partie.joueurs){
                                          if (joueur.idJoueur==getIdFromPseudo(data.joueurConcerne)){
                                            for (var item in joueur.objets){
                                              if (joueur.objets[item]==data.carte){
                                                joueur.objets.splice(item,1)
                                            }
                                          }
                                        }
                                      }
                                            for (var joueur of partie.joueurs){
                                              if (joueur.idJoueur==partie.joueurCourant){
                                                joueur.objets.push(data.carte)
                                              }
                                            }
                                          io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a volé un objet à "+data.joueurConcerne,"rapportAction":{type:"cartePiochée","valeur":data.carte},"idPartie":data.idPartie})
                                          partie.state = "phase_Attaque"
                                          setTimeout(() => {
                                            tourPasseDeCirconstance(partie)
                                          }, 2500);

                                      }//Fin du cas de vol via succube OU sanctuaire

                                 
                                    }



                                    if (data.type=="stuffSelf"){

                                      




                                      if (partie.state=="Peau_De_Banane_1"){
                                        for (var joueur of partie.joueurs){
                                          if (joueur.hasItem(data.idCarte)){
                                              partie.state="Peau_De_Banane_2"
                                              partie.variableTemp=data.idCarte
                                              tourPasseDeCirconstance(partie)
                                          }
                                        }

                                      }
                                    }

                                    if (data.type=="pioche"){
                                        if (partie.state!="choixPioche"){return}
                                        console.log("carte piochée")
                                        switch (data.carte){
                                          case "Lumiere":
                                            piocheBlanche(partie,joueur)
                                            break

                                          case "Tenebres":
                                            piocheNoire(partie,joueur)
                                          break//Fin du case tenebres

                                          case "Vision":
                                            piocheVision(partie,joueur)
                                          break

                                        }
                                    }

                                    if (data.type=="choix"){
                                      //cas de la boussole 
                                      
                                      if (partie.state=="choixDavid"){
                                        if (socket.data.userId==partie.joueurCourant){
                                          for (var joueur of partie.joueurs){
                                            if (joueur.idJoueur==partie.joueurCourant){
                                              var renvoyé;
                                          switch (data.text){
                                              case "Hache_Tueuse":
                                              case "Sabre_Hanté_Masamune":
                                              case "Revolver_Des_Ténèbres":
                                              case "Hachoir_Maudit":
                                              case "Mitrailleuse_Funeste":
                                              case "Tronçonneuse_Du_Mal":
                                                
                                              for (var z in partie.défausseNoire){
                                                if (partie.défausseNoire[z].valeur==data.text){
                                                  renvoyé = partie.défausseNoire[z].valeur
                                                  joueur.objets.push(partie.défausseNoire[z].valeur)
                                                  partie.défausseNoire.splice(z,1)
                                                }
                                              }
                                              joueur.pouvoirUtilisé=true
                                              partie.state="finTour"
                                              io.emit("tourPasse",{"Message":pseudos[partie.variableTemp]+" a récupéré l'objet "+data.text.replace(/_/g," "),"rapportAction":{"type":"cartePiochée","valeur":data.text},"idPartie":partie.id})
                                                setTimeout(() => {
                                                  tourPasseDeCirconstance(partie)
                                                }, 2500);
                                                return
            

                                              case "Boussole_Mystique":
                                              case "Broche_De_Chance":
                                              case "Amulette":
                                              case "Toge_Sainte":
                                              case "Lance_De_Longinus":
                                              case "Crucifix_En_Argent":
                                                for (var z in partie.défausseBlanche){
                                                  if (partie.défausseBlanche[z].valeur==data.text){
                                                    renvoyé = partie.défausseBlanche[z].valeur
                                                    joueur.objets.push(partie.défausseBlanche[z].valeur)
                                                    partie.défausseBlanche.splice(z,1)
                                                  }
                                                }
                                                joueur.pouvoirUtilisé=true
                                                partie.state="finTour"
                                                
                                                io.emit("tourPasse",{"Message":pseudos[partie.variableTemp]+" a récupéré l'objet "+data.text.replace(/_/g," "),"rapportAction":{"type":"cartePiochée","valeur":data.text},"idPartie":partie.id})
                                                setTimeout(() => {
                                                  tourPasseDeCirconstance(partie)
                                                }, 2500);
                                                return
                                                
                                         
                                              }
                                          }
                                        }
                                      }
                                      }


                                    
                                      if (partie.state=="Boussole_Mystique"){
                                        if (!partie.variableTemp.includes(data.text)){console.log(data.text);console.log(partie.variableTemp);return}
                                        var destination

                                        for (var i in partie.zones){ 
                                          if (partie.getNameFromZone(partie.zones[i])==data.text){
                                            joueur.position=i
                                            destination = partie.getNameFromZone(partie.zones[i])
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a été guidé vers "+destination,"rapportAction":false,"idPartie":data.idPartie})
                                            effetCase(joueur,partie)
                                            return
                                          }
                                        }
                                        
                                      }
                                      
                                      if (partie.state=="choixStuff"){
                                          if (partie.variableTemp.includes(data.text)){
                                            joueur.objets.push(data.text)
                                            io.emit("tourPasse",{"Message":pseudos[partie.variableTemp]+" a récupéré l'objet "+data.text.replace(/_/g," "),"rapportAction":{"type":"cartePiochée","valeur":data.text},"idPartie":partie.id})
                                            partie.state = "finTour"
                                            setTimeout(() => {
                                              tourPasseDeCirconstance(partie)
                                            }, 2500);
                                            for (var z of partie.variableTemp){//Renvoi objets dans la défausse
                                              if (z!=data.text){
                                                switch (z){

                                                  case "Hache_Tueuse":
                                                  case "Sabre_Hanté_Masamune":
                                                  case "Revolver_Des_Ténèbres":
                                                  case "Hachoir_Maudit":
                                                  case "Mitrailleuse_Funeste":
                                                  case "Tronçonneuse_Du_Mal":
                                                    partie.défausseNoire.push(new CarteShadowHunter(z,"équipement"))
                                                    break

                                                  case "Boussole_Mystique":
                                                  case "Broche_De_Chance":
                                                  case "Amulette":
                                                  case "Toge_Sainte":
                                                  case "Lance_De_Longinus":
                                                  case "Crucifix_En_Argent":
                                                    partie.défausseBlanche.push(new CarteShadowHunter(z,"équipement"))
                                                  break
                                                }
                                              }
                                            }//Fin renvoi
                                            return
                                          }//fin du cas
                                      }


                                      //----------------------Charles
                                      
                                      

                                      if (partie.state=="CharlesFinTour"){
                                        if (data.text=="terminer son tour."){
                                          if (partie.state!="finTour"&&partie.state!="CharlesFinTour"){return}
                                          joueur.turnsToPlay--
                                          if (joueur.turnsToPlay<=0){
                                            partie.nextPlayer()
                                          }
                                          partie.state = "débutTour"
                                          tourPasseDeCirconstance(partie)
                                        return
                                        }

                                        if (data.text=="attaquer de nouveau"){
                                          partie.state = "finTour"
                                          var c = partie.variableTemp
                                          joueur.hurtPoint +=2
                                          if (joueur.hasItem("Toge_Sainte")){joueur.hurtPoint--}
                                          var resultat = partie.attaquer(socket.data.userId,partie.variableTemp)

                                          if (resultat.killed==true){//Cas où on a tué
                                         
                                            //Pas de crucifix, le joueur choisit un item
                                              for (var test of partie.joueurs){
                                                if (partie.variableTemp==test.idJoueur){
                                                    var boutons = []
                                                    
                                           
                                                    if (joueur.hasItem("Mitrailleuse_Funeste")){
                                                      io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a tué au moins une personne.","rapportAction":false,"idPartie":data.idPartie})
                                                    }
                                                    else{
                                                    io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a tué "+pseudos[test.idJoueur]+" qui était " +test.character.replace(/_/g," ")+".","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":test.character,"pseudo":pseudos[test.idJoueur]}},"idPartie":data.idPartie})
                                                    }
                                                    test.éliminé=true
                                                    partie.state = "finTour"
                                                    testAprèsKill(partie,partie.getJoueurCourant(),test)

                                                  setTimeout(() => {
                                                    tourPasseDeCirconstance(partie)
                                                  }, 2500);
                                                  return
                                                  }
                                                  
                                              }
                                            
                                          }
                                          else{
                                           
                                            var joueurQuiAttaque
                                            for (var zz of partie.joueurs){
                                              if (zz.idJoueur==partie.joueurCourant){joueurQuiAttaque=zz}
                                            }
                                            if (joueurQuiAttaque.hasItem("Mitrailleuse_Funeste")){
                                              io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a infligé "+resultat.dégâts+" dégâts à tout-le-monde à portée","rapportAction":false,"idPartie":data.idPartie})
                                              
                                              setTimeout(() => {
                                                tourPasseDeCirconstance(partie)
                                              }, 2500);
                                              
                                            }
                                            else{ 
                                            var atk,def;
                                            for (var z of partie.joueurs){if (z.idJoueur==socket.data.userId){atk=z} else{if(z.idJoueur==partie.variableTemp){def = z}}}
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a infligé "+resultat.dégâts+" dégâts à "+pseudos[def.idJoueur],"rapportAction":{"type":"attaque","valeur":[((atk.révélé)?atk.character:false),((def.révélé)?def.character:false)]},"idPartie":data.idPartie})
                                            setTimeout(() => {
                                              tourPasseDeCirconstance(partie)
                                            }, 2500);
                                            partie.variableTemp = c
                                            
                                            
                                            
                                          }
                                          partie.state ="CharlesFinTour"
                                          return
                                      }
                                      //----------------------finCharles

                                      
                                      
                                      
                                      
                                      
                                        }
                                      }

                                      //Quand on attaque
                                      if (partie.state=="phase_Attaque"){//Cas où le joueur est supposé choisir une personne à attaquer
                                        if (data.text=="personne"){
                                          partie.state="finTour"
                                          tourPasseDeCirconstance(partie)
                                          return
                                        }
                                        if (getIdFromPseudo(data.text)!=false){
                                          var resultat = partie.attaquer(socket.data.userId,getIdFromPseudo(data.text))
                                          if (resultat.killed==true){//Cas où on a tué
                                            if (joueur.hasItem("Crucifix_En_Argent")){//On raffle la mise
                                              for (var test of partie.joueurs){
                                                if (getIdFromPseudo(data.text)==test.idJoueur){
                                                    for (var z of test.objets){
                                                      joueur.objets.push(z)
                                                    }
                                                    test.éliminé=true
                                                    io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a tué "+pseudos[test.idJoueur]+" qui était " +test.character.replace(/_/g," ")+ " et volé tous ses objets","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":test.character,"pseudo":pseudos[test.idJoueur]}},"idPartie":data.idPartie})
                                                    partie.state = "finTour"
                                                    setTimeout(() => {
                                                      tourPasseDeCirconstance(partie)
                                                    }, 2500);
                                                    return
                                                }
                                              }
                                            }
                                            else{//Pas de crucifix, le joueur choisit un item
                                              for (var test of partie.joueurs){
                                                if (getIdFromPseudo(data.text)==test.idJoueur){
                                                    var boutons = []
                                                    if (test.objets.length>0 && !joueur.hasItem("Mitrailleuse_Funeste")){
                                                      for (var z of test.objets){
                                                      boutons.push(z)
                                                    }
                                                    partie.variableTemp=boutons
                                                    partie.state="choixStuff"
                                                    if (joueur.hasItem("Mitrailleuse_Funeste")){
                                                      io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a tué au moins une personne.","rapportAction":false,"idPartie":data.idPartie})
                                                    }
                                                    else{
                                                      io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a tué "+pseudos[test.idJoueur]+" qui était " +test.character.replace(/_/g," ")+".","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":test.character,"pseudo":pseudos[test.idJoueur]}},"idPartie":data.idPartie})
                                                    }
                                                      setTimeout(() => {
                                                      tourPasseDeCirconstance(partie)                                                    
                                                    }, 2500);
                                                  }
                                                  else{
                                                    if (joueur.hasItem("Mitrailleuse_Funeste")){
                                                      io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a tué au moins une personne.","rapportAction":false,"idPartie":data.idPartie})
                                                    }
                                                    else{
                                                    io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a tué "+pseudos[test.idJoueur]+" qui était " +test.character.replace(/_/g," ")+".","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":test.character,"pseudo":pseudos[test.idJoueur]}},"idPartie":data.idPartie})
                                                    }
                                                    partie.state = "finTour"
                                                    test.éliminé=true
                                                    testAprèsKill(partie,partie.getJoueurCourant(),test)

                                                  setTimeout(() => {
                                                    tourPasseDeCirconstance(partie)
                                                  }, 2500);
                                                  }
                                                    
                                                    return
                                                }
                                              }
                                            }
                                          }

                                          if (resultat.lg==true){
                                            io.emit("tourPasse",{"Message":pseudos[partie.variableTemp]+" choisit s'il souhaite contre-attaquer.","rapportAction":{"type":"choix","valeur":{"boutons":["contre-attaquer !","ne rien faire..."],"défaut":"Loup-Garou","idJoueur":partie.variableTemp}},"idPartie":data.idPartie})
                                            break
                                          }
                                          else{
                                            var joueurQuiAttaque
                                            for (var zz of partie.joueurs){
                                              if (zz.idJoueur==partie.joueurCourant){joueurQuiAttaque=zz}
                                            }
                                            if (joueurQuiAttaque.hasItem("Mitrailleuse_Funeste")){
                                              io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a infligé "+resultat.dégâts+" dégâts à tout-le-monde à portée","rapportAction":false,"idPartie":data.idPartie})
                                              partie.state="finTour"
                                              if(joueur.character=="Charles"&&!joueur.pouvoirUtilisé&&joueur.révélé){
                                                partie.variableTemp=getIdFromPseudo(data.text)
                                                partie.state="CharlesFinTour"
                                              }
                                              setTimeout(() => {
                                                tourPasseDeCirconstance(partie)
                                              }, 2500);
                                              break
                                            }
                                            else{ 
                                            var atk,def;
                                            for (var z of partie.joueurs){if (z.idJoueur==socket.data.userId){atk=z} else{if(z.idJoueur==getIdFromPseudo(data.text)){def = z}}}
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a infligé "+resultat.dégâts+" dégâts à "+data.text,"rapportAction":{"type":"attaque","valeur":[((atk.révélé)?atk.character:false),((def.révélé)?def.character:false)]},"idPartie":data.idPartie})
                                            partie.state="finTour"
                                            if(joueur.character=="Charles"&&!joueur.pouvoirUtilisé&&joueur.révélé){
                                              partie.variableTemp=getIdFromPseudo(data.text)
                                              partie.state="CharlesFinTour"
                                            }
                                            setTimeout(() => {
                                              tourPasseDeCirconstance(partie)
                                            }, 2500);
                                            break
                                          }
                                        }
                                        }

                                        return
                                      }

                                      switch (data.text){
                                        //Cas de la forêt hanté
                                        case "attaquer":
                                          if (partie.state!="Forêt_Hantée_1"){return;}
                                          partie.variableTemp = "attaquer"
                                          partie.state = "Forêt_Hantée_2"
                                          tourPasseDeCirconstance(partie)
                                        break
                                        case "soigner":
                                        if (partie.state!="Forêt_Hantée_1"){return;}
                                        partie.variableTemp = "soigner"
                                        partie.state = "Forêt_Hantée_2"
                                        tourPasseDeCirconstance(partie)
                                        break

                                                
                                        case "lancer les dés !"://Cas de lancer de dés en début de tour. Est nécessaire pour laisser le temps à certains personnages, dont le pouvoir marche seulement en début de tour, d'utiliser leur pouvoir
                                          if (partie.state!="débutTour"){return}
                                          joueur.protected = false
                                          if (joueur.character=="Momie"){joueur.pouvoirCeTour=false}
                                          if (!joueur.hasItem("Boussole_Mystique")){
                                          var destination;
                                          var posDébut = partie.getNameFromZone(partie.zones[joueur.position])
                                          var roll1 = Math.floor(Math.random()*6)+1
                                          var roll2 = Math.floor(Math.random()*4)+1
                                          switch (roll1+roll2){
                                            case 2:
                                            case 3:
                                              destination = partie.getNameFromZone("zone1")
                                              joueur.position = partie.getIndexFromZone("zone1")
                                              break
                                            case 4:
                                            case 5:
                                              destination = partie.getNameFromZone("zone2")
                                              joueur.position = partie.getIndexFromZone("zone2")
                                              break
                                            case 6:
                                              destination = partie.getNameFromZone("zone3")
                                              joueur.position = partie.getIndexFromZone("zone3")
                                              break
                                            case 7:
                                            partie.state = "choixDestination"
                                            io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" est chanceux et peut choisir où aller !","rapportAction":{"type":"jetsDeDés","valeur":[roll1,roll2]} ,"idPartie":data.idPartie})
                                            return
                                            case 8:
                                              destination = partie.getNameFromZone("zone4")
                                              joueur.position = partie.getIndexFromZone("zone4")
                                              break
                                            case 9:
                                                destination = partie.getNameFromZone("zone5")
                                                joueur.position = partie.getIndexFromZone("zone5")
                                                break
                                            case 10:
                                                  destination = partie.getNameFromZone("zone6")
                                                  joueur.position = partie.getIndexFromZone("zone6")
                                                  break
                                          }
                                    
                                         if (destination!=posDébut){
                                          io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" se déplace vers "+destination+" !","rapportAction":{"type":"jetsDeDés","valeur":[roll1,roll2]} ,"idPartie":data.idPartie})
                                         }
                                         else{io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" reste sur "+destination+" !","rapportAction":{"type":"jetsDeDés","valeur":[roll1,roll2]} ,"idPartie":data.idPartie})
                                        }
                                          partie.state = "~"
                                          var g = joueur
                                          setTimeout(() => {
                                            effetCase(g,partie)
                                          }, 2500);
                                        }
                                        else{//cas de la boussole mystique JE VAIS ME TUER


                                          var destinations = []
                                         
                                          for (var i=0;i<=1;i++){
                                            var roll1 = Math.floor(Math.random()*6)+1
                                            var roll2 = Math.floor(Math.random()*4)+1
                                          switch (roll1+roll2){
                                            case 2:
                                            case 3:
                                              destination = partie.getNameFromZone("zone1")
                                              break
                                            case 4:
                                            case 5:
                                              destination = partie.getNameFromZone("zone2")
                                            break
                                            case 6:
                                              destination = partie.getNameFromZone("zone3")                                              
                                              break
                                            case 7:
                                            partie.state = "choixDestination"
                                            io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" est chanceux et peut choisir où aller !","rapportAction":{"type":"jetsDeDés","valeur":[roll1,roll2]} ,"idPartie":data.idPartie})
                                            return
                                            case 8:
                                              destination = partie.getNameFromZone("zone4")

                                              break
                                            case 9:
                                                destination = partie.getNameFromZone("zone5")
                                                break
                                            case 10:
                                                  destination = partie.getNameFromZone("zone6")
                                                  break
                                          }
                                            destinations.push(destination)
                                        }
                                        partie.variableTemp=destinations
                                        io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit où la boussole le mènera","rapportAction":{"type":"choix","valeur":{"boutons":[destinations[0],destinations[1]],"idJoueur":partie.joueurCourant,"défaut":"Boussole_Mystique"}},"idPartie":data.idPartie})
                                        partie.state = "Boussole_Mystique"
                                        }
                                 
                                        break//Fin du cas où c'est un lancer de dés pour se déplacer.

                                        //Pour les pouvoirs marchant en fin de tour (principalement grégor)
                                        case "terminer son tour.":
                                          if (partie.state!="finTour"){return}
                                          joueur.turnsToPlay--
                                          if (joueur.turnsToPlay<=0){
                                            partie.nextPlayer()
                                            
                                          }
                                          partie.state = "débutTour"
                                          tourPasseDeCirconstance(partie)
                                          break
                                      
                                          //Rituel diabolique
                                      case "S'intéresser au rituel":
                                        if (partie.state!="Rituel_Diabolique"){return}
                                        for (var joueur of partie.joueurs){
                                          if (joueur.idJoueur==partie.joueurCourant){
                                        if (partie.shadowsBase.includes(joueur.character)){
                                          joueur.hurtPoint=0
                                          joueur.révélé = true
                                          partie.state = "phase_Attaque"
                                          io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" soigne toutes ses blessures grâce au rituel !","rapportAction":false ,"idPartie":data.idPartie})
                                          setTimeout(() => {
                                            tourPasseDeCirconstance(partie)
                                          }, 2500);
                                          return
                                          }
                                          else{
                                            socket.emit("tourPasse",{"Message":"Seul un être malveillant y verrait de l'intérêt...","rapportAction":false ,"idPartie":data.idPartie})
                                            setTimeout(() => {
                                              tourPasseDeCirconstance(partie)
                                            }, 2500);
                                          }
                                          }
                                        }
                                      break

                                      case "Le laisser où il est":
                                        if (partie.state!="Rituel_Diabolique"){return}
                                        partie.state = "phase_Attaque"

                                        io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" passe son chemin...","rapportAction":false ,"idPartie":data.idPartie})
                                            setTimeout(() => {
                                            tourPasseDeCirconstance(partie)
                                          }, 2500);
                                          return
                                      
                                          case "accepter la lumière":
                                            if (partie.state!="Avènement_Suprême"){return}
                                            for (var joueur of partie.joueurs){
                                              if (joueur.idJoueur==partie.joueurCourant){
                                      
                                            if (partie.hunterBase.includes(joueur.character)){
                                              joueur.hurtPoint=0
                                              partie.state = "phase_Attaque"
                                              joueur.révélé = true
                                              io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" est soigné par la lumière divine.","rapportAction":false ,"idPartie":data.idPartie})
                                              setTimeout(() => {
                                                tourPasseDeCirconstance(partie)
                                              }, 2500);
                                              return
                                              }
                                              else{
                                                socket.emit("tourPasse",{"Message":"Seul un croyant saurait être béni de la sorte...","rapportAction":false ,"idPartie":data.idPartie})
                                                setTimeout(() => {
                                                  tourPasseDeCirconstance(partie)
                                                }, 2500);
                                              }
                                              }
                                            }
                                          break
    
                                          case "poursuivre son chemin":
                                            if (partie.state!="Avènement_Suprême"){return}
                                            partie.state = "phase_Attaque"
    
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" ne préfère pas tenter sa chance.","rapportAction":false ,"idPartie":data.idPartie})
                                                setTimeout(() => {
                                                tourPasseDeCirconstance(partie)
                                              }, 2500);
                                              return
                                              //LA SUPER BARRE DE CHOCOLAT MIAM
                                              case "la manger":
                                                if (partie.state!="Barre_De_Chocolat"){return}
                                                for (var joueur of partie.joueurs){
                                                  if (joueur.idJoueur==partie.joueurCourant){
                                          
                                                if (joueur.hp<12){
                                                  joueur.hurtPoint=0
                                                  partie.state = "phase_Attaque"
                                                  joueur.révélé = true
                                                  io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" mange la barre de chocolat, ce qui suffit largement à soigner totalement quelqu'un d'aussi frêle !","rapportAction":false ,"idPartie":data.idPartie})
                                                  setTimeout(() => {
                                                    tourPasseDeCirconstance(partie)
                                                  }, 2500);
                                                  return
                                                  }
                                                  else{
                                                    socket.emit("tourPasse",{"Message":"Vous n'y voyez que peu d'intérêt","rapportAction":false ,"idPartie":data.idPartie})
                                                    setTimeout(() => {
                                                      tourPasseDeCirconstance(partie)
                                                    }, 2500);
                                                  }
                                                  }
                                                }
                                                break

                                              case "l'ignorer":
                                                if (partie.state!="Barre_De_Chocolat"){return}
                                                partie.state = "phase_Attaque"
        
                                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" ignore la barre de chocolat et retourne à ses affaires.","rapportAction":false ,"idPartie":data.idPartie})
                                                    setTimeout(() => {
                                                    tourPasseDeCirconstance(partie)
                                                  }, 2500);
                                                  return
                                                


                                      }//Fin du switch

                                    }//Fin du cas où data.type == "choix"

                        }}}}}})



                          socket.on("utiliseCapacite",data=>{
                            console.log(data)
                            for (var partie of partiesEnCours){
                              if (partie.id==data.idPartie){
                      
                                if (partie.getIdFromCharacter(data.capacite)!=socket.data.userId){return}
                                for (var joueur of partie.joueurs){
                                  if (joueur.idJoueur==socket.data.userId){
                                  if ((joueur.révélé==false||joueur.pouvoirUtilisé==true)){return}
                                  }}
                                switch (data.capacite){

                                  case "David":
                                    if (partie.joueurCourant!=socket.data.userId){return}
                                    if ((partie.getJoueurCourant().character!="David")||(partie.state!="finTour")){return}
                                    if (partie.défausseBlanche.length<=0&&partie.défausseNoire.length<=0){return}
                                    partie.state = "choixDavid"
                                    partie.getJoueurCourant().pouvoirUtilisé=true
                                    tourPasseDeCirconstance(partie)
                                    return

                                  break

                                  case "Bob":
                                    if (partie.joueurCourant!=socket.data.userId){return}
                                   
                                    if ((partie.getJoueurCourant().character!="Bob")||(partie.state!="phase_Attaque")){return}
                                    if (joueur.vol==false){
                                      io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" utilise son pouvoir et volera un objet s'il inflige assez de dégâts à sa prochaine attaque !","rapportAction":false,"idPartie":data.idPartie})
                                      joueur.vol=true
                                    }
                                    else{
                                      io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" se reconcentre pour attaquer normalement.","rapportAction":false,"idPartie":data.idPartie})
                                      joueur.vol=false
                                    }
                                    setTimeout(() => {
                                      tourPasseDeCirconstance(partie)
                                    }, 2500);
                                    return
                                    
                                  break
                                  case "Agnès":
                                  for (var zzz in partie.joueurs){
                                    if (partie.joueurs[zzz].idJoueur==socket.data.userId&&partie.joueurs[zzz].character=="Agnès"){
                                      if (parseInt(zzz)<=0){
                                        partie.joueurs[zzz].conditionVictoire = partie.joueurs[partie.joueursMax-1].idJoueur
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" utilise le pouvoir d'agnès et se bat désormais aux côtés de "+pseudos[ partie.joueurs[zzz].conditionVictoire]+" !","rapportAction":false,"idPartie":data.idPartie})
                                        
                                      }
                                      else{
                                        partie.joueurs[zzz].conditionVictoire = partie.joueurs[parseInt(zzz)-1].idJoueur
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" utilise le pouvoir d'agnès et se bat désormais aux côtés de "+pseudos[partie.joueurs[zzz].conditionVictoire]+" !","rapportAction":false,"idPartie":data.idPartie})

                                      }
                                      setTimeout(() => {
                                          tourPasseDeCirconstance(partie)
                                      }, 2500);
                                      return
                                    }
                                  }
                                  break
                                  case "Emi":
                                    if (partie.joueurCourant==socket.data.userId && partie.state=="débutTour"){
                                      partie.state = "pouvoirEmi"
                                      io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" utilise le pouvoir d'Emi !","rapportAction":false,"idPartie":data.idPartie})
                                      return
                                    }
                                    break

                                    case "Fu-ka":
                                      if (partie.joueurCourant==socket.data.userId && partie.state=="débutTour"){
                                        partie.state = "pouvoirFu-ka"
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" utilise le pouvoir de Fu-ka !","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":"Fu-Ka","pseudo":pseudos[socket.data.userId]}},"idPartie":data.idPartie})
                                        return
                                }
                                break

                                case "Franklin":
                                      if (partie.joueurCourant==socket.data.userId && partie.state=="débutTour"){
                                        partie.state = "pouvoirFranklin"
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" invoque la foudre !","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":"Franklin","pseudo":pseudos[socket.data.userId]}},"idPartie":data.idPartie})
                                        return
                                }
                                break
                                case "Georges":
                                      if (partie.joueurCourant==socket.data.userId && partie.state=="débutTour"){
                                        partie.state = "pouvoirGeorges"
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" est sur le point de démolir quelqu'un !","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":"Georges","pseudo":pseudos[socket.data.userId]}},"idPartie":data.idPartie})
                                        return
                                }
                                break

                                case "Ellen":
                                      if (partie.joueurCourant==socket.data.userId && partie.state=="débutTour"){
                                        partie.state = "pouvoirEllen"
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" s'apprête à priver quelqu'un de sa capacité !","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":"Ellen","pseudo":pseudos[socket.data.userId]}},"idPartie":data.idPartie})
                                        return
                                }
                                break

                                case "Allie":
                                  for (var joueur of partie.joueurs){if (joueur.idJoueur==socket.data.userId){joueur.hurtPoint=0;joueur.pouvoirUtilisé=true}}
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" se soigne de toutes ses blessures !","rapportAction":{"type":"carteRévélée","valeur":{"carteRévélée":"Allie","pseudo":pseudos[socket.data.userId]}},"idPartie":data.idPartie})
                                        setTimeout(() => {
                                          tourPasseDeCirconstance(partie)
                                        }, 2500);
                                        break

               
                                  case "Momie":

                                    if (partie.joueurCourant==socket.data.userId && partie.state=="débutTour" && partie.getJoueurCourant().pouvoirCeTour==false){
                                      var possible = false//Check pour voir si il y a une cible potentielle
                                      for (var joueu of partie.joueurs) {if (parseInt(joueu.position)==partie.getIndexFromZone("zone2") && joueu.idJoueur!=partie.joueurCourant){possible = true}}
                                      if (possible==false){return}
                                      console.log(partie.state)
                                      io.emit("tourPasse", { "Message": pseudos[socket.data.userId] + " canalise son énergie de momie et se prépare à frapper une cible sur la porte de l'outremonde!", "rapportAction": {"type":"carteRévélée","valeur":{"carteRévélée":"Momie","pseudo":pseudos[socket.data.userId]}}, "idPartie": data.idPartie })
                                      partie.state = "pouvoirMomie"
                                      console.log(partie.state)
                                    return
                                  }
                                    break

                                    case "Liche":
                                      if (partie.joueurCourant==socket.data.userId){
                                        var j
                                        var t = 0
                                        for (var joueur of partie.joueurs){if (joueur.idJoueur==partie.joueurCourant){j = joueur}}
                                        for (var joueur of partie.joueurs){if (joueur.éliminé==true){t++}}
                                        j.turnsToPlay+=t
                                        io.emit("tourPasse", { "Message": pseudos[socket.data.userId] + " relève les morts et rejouera "+t+" fois.", "rapportAction": {"type":"carteRévélée","valeur":{"carteRévélée":"Liche","pseudo":pseudos[socket.data.userId]}}, "idPartie": data.idPartie })
                                        setTimeout(() => {
                                          tourPasseDeCirconstance(partie)
                                        }, 2500);

                                      }
                                    break

                                    case "Gregor":
                                      if (partie.joueurCourant==socket.data.userId && partie.state=="finTour"){
                                        for (var joueur of partie.joueurs){
                                          if (joueur.idJoueur==partie.joueurCourant){
                                            joueur.protected=true
                                            io.emit("tourPasse", { "Message": pseudos[socket.data.userId] + " se protège jusqu'à son prochain tour", "rapportAction": {"type":"carteRévélée","valeur":{"carteRévélée":"Gregor","pseudo":pseudos[socket.data.userId]}}, "idPartie": data.idPartie })
                                            setTimeout(() => {
                                              tourPasseDeCirconstance(partie)
                                            }, 2500);
                                          }
                                        }
                                      }
                                    break


                              }
                            }

                          }}//Fin utiliser capacité
                        )


                          socket.on("disconnect",()=>{
                            for (var partie of partiesEnCours){
                              for (var test of partie.joueurs){
                                if (test.idJoueur==socket.data.userId){
                                    console.log("partie "+partie.id+" quittée par "+pseudos[socket.data.userId])
                           
                                    switch (partie.type){

                                      case "shadowHunter":
                                      
                                        tuer(partie,test)
                                        io.emit("tourPasse", { "Message": pseudos[socket.data.userId] + " a quitté la partie.", "rapportAction": {"type":"carteRévélée","valeur":{"carteRévélée":test.character,"pseudo":pseudos[socket.data.userId]}}, "idPartie": partie.id })
                                        partie.testCatherine()
                                        partie.testDaniel()
                                        partie.hasDied = true
                                        testFinPartie(partie)  
                                        setTimeout(() => {
                                          tourPasseDeCirconstance(partie)
                                        }, 2500);
                                      break

                                      case "6quiprend":

                                      for (var test in partie.joueurs){
                                        if (partie.joueurs[test].idJoueur==socket.data.userId){
                                          partie.joueurs.splice(test,1)
                                        }
                                      }

                                      if (partie.joueurs.length<=1){
                                        var retour = []
                                        for (var zz of partie.joueurs){
                                          retour.push({"pseudo":pseudos[zz.idJoueur],"score":zz.score})
                                          db.run("UPDATE users SET score6quiprend = score6quiprend+"+((66-zz.score)*2)+" WHERE idU="+zz.idJoueur )
                                        }
                                        io.emit("gameFinished",{"idPartie":partie.id,"classement":retour})
                                        return
                                      }



                                        if (partie.canTour()){
                                          console.log("test3")
                                          console.log("un tour passe")
                                          partie.tourEnCours = true;
                                          io.emit("tourPasse",{"idPartie":partie.id,"carteEval":partie.joueurMin().choix.valeur,"joueurEval":pseudos[partie.joueurMin().idJoueur],"choixNecessaire":false,"lignes":partie.lignes})
                                          setTimeout(()=>{poursuivreTour(partie)},1700)
                                        }

                                      break
                                      default:

                                      break

                                    }
                                    return
                                  }
                              }
                            }
                          }
                          )


                          
                             socket.on("quittePartie",data=>{
                              console.log("partie "+data.idPartie+" quittée par "+pseudos[socket.data.userId])
                      
                              for (var partie of partiesEnCours){

                                if (partie.id==data.idPartie){
                                  for (var test of partie.joueurs){
                                    if (test.idJoueur==socket.data.userId){
                             
                                      switch (partie.type){

                                        case "shadowHunter":
                                          if(data.typePartie!="shadowHunter"){return}
                                        
                                          tuer(partie,test)
                                          io.emit("tourPasse", { "Message": pseudos[socket.data.userId] + " a quitté la partie.", "rapportAction": {"type":"carteRévélée","valeur":{"carteRévélée":test.character,"pseudo":pseudos[socket.data.userId]}}, "idPartie": data.idPartie })
                                          partie.testCatherine()
                                          partie.testDaniel()
                                          partie.hasDied = true
                                          testFinPartie(partie)  
                                          setTimeout(() => {
                                            tourPasseDeCirconstance(partie)
                                          }, 2500);
                                        break

                                        case "6quiprend":

                                        for (var test in partie.joueurs){
                                          if (partie.joueurs[test].idJoueur==socket.data.userId){
                                            partie.joueurs.splice(test,1)
                                          }
                                        }

                                        if (partie.joueurs.length<=1){
                                          var retour = []
                                          for (var zz of partie.joueurs){
                                            retour.push({"pseudo":pseudos[zz.idJoueur],"score":zz.score})
                                            db.run("UPDATE users SET score6quiprend = score6quiprend+"+((66-zz.score)*2)+" WHERE idU="+zz.idJoueur )
                                          }
                                          io.emit("gameFinished",{"idPartie":partie.id,"classement":retour})
                                          return
                                        }



                                          if (partie.canTour()){
                                            console.log("test3")
                                            console.log("un tour passe")
                                            partie.tourEnCours = true;
                                            io.emit("tourPasse",{"idPartie":partie.id,"carteEval":partie.joueurMin().choix.valeur,"joueurEval":pseudos[partie.joueurMin().idJoueur],"choixNecessaire":false,"lignes":partie.lignes})
                                            setTimeout(()=>{poursuivreTour(partie)},1700)
                                          }

                                        break
                                        default:

                                        break

                                      }
                                      return
                                    }
                                  }
                                }
                              }
                            }


                             



                             )

            
            });
            
            















            process.on('SIGINT', () => {
              db.close((err) => {
                if (err) {
                  console.error(err.message);
                }
                console.log('Connexion à la base de données SQLite fermée.');
                process.exit();
              });
            });
