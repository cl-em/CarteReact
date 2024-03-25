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
const { Carte } = require('./Carte.js');
const { Console } = require('console');
const { setTimeout } = require('timers');



//-------------------------------Fonctions-----------------------------------------------
//Obtension de la liste des pseudos des joueurs
const getpseudos = () => {
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
  db.run("INSERT INTO Batailles(idB,idH,Bataille) VALUES(?,?,?)",[idPartie, idHost, Bataille],(err)=>{
    console.log(err);
  });
}

function sauvegarderPartieSixQuiPrend(idPartie, idHost, SixQuiPrend){
  SixQuiPrend = JSON.stringify(SixQuiPrend);
  db.run("INSERT INTO SixQuiPrend(id6,idH,SixQuiPrend) VALUES(?,?,?)",[idPartie, idHost, SixQuiPrend],(err)=>{
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
      partiesEnCours.push(partie);
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
      partiesEnCours.push(partie);
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
    });
    // db.close();
    
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
            if (!Number.isInteger(parseInt(joueursMax))||joueursMax>8||joueursMax<2){
              joueursMax=8
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
                  joueurCourant = {"idJoueur":joueur.idJoueur,"dégats":joueur.hurtPoint,"révélé":joueur.révélé,"position":partie.zones[joueur.position][4],"personnage":joueur.character,"stuff":joueur.objets,"pouvoirUtilisé":joueur.pouvoirUtilisé}
                  if (joueur.éliminé==false){
                  if (joueur.révélé==false){joueurs.push({"pseudo":pseudos[joueur.idJoueur],"dégats":joueur.hurtPoint,"position":partie.zones[joueur.position][4],"révélé":false,"stuff":joueur.objets,"pouvoirUtilisé":joueur.pouvoirUtilisé})}
                  else{joueurs.push({"pseudo":pseudos[joueur.idJoueur],"position":partie.zones[joueur.position][4],"dégats":joueur.hurtPoint,"révélé":joueur.character,"stuff":joueur.objets,"pouvoirUtilisé":joueur.pouvoirUtilisé})}
                  }
                }
                else{//Autres joueurs
                  if (joueur.éliminé==false){
                  if (joueur.révélé==false){joueurs.push({"pseudo":pseudos[joueur.idJoueur],"dégats":joueur.hurtPoint,"position":partie.zones[joueur.position][4],"révélé":false,"stuff":joueur.objets,"pouvoirUtilisé":joueur.pouvoirUtilisé})}
                  else{joueurs.push({"pseudo":pseudos[joueur.idJoueur],"position":partie.zones[joueur.position][4],"dégats":joueur.hurtPoint,"révélé":joueur.character,"stuff":joueur.objets,"pouvoirUtilisé":joueur.pouvoirUtilisé})
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
        console.log("| Le joueur "+socket.data.userId+" ("+pseudos[socket.data.userId]+") a rejoint la partie "+data.idPartie)
        for (var partie of partiesOuvertes){ 
          if (data.idPartie==partie.id && partie.joueurs.length<partie.joueursMax){
            
            if (partie.addPlayer(socket.data.userId)!=false){
              socket.emit("rejoindrePartie",partie.id);
              if (partie.joueurs.length==partie.joueursMax){
                lancerPartie(partie.id);
                //Renvoi de choses différentes selon le type de partie
                if (partie.type=="Bataille"){io.emit("gameStarting",{"idPartie":data.idPartie})}
                
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
                  io.emit("gameStarting",{"idPartie":data.idPartie,"joueurs":listejoueurs,"zones":partie.zones})}
                  setTimeout(()=>{
                    io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}},"idPartie":data.idPartie})
                    },200)
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
              
              socket.on("joueurQuitte",data=>{  
                
                for (var partie of partiesOuvertes){//enleversi la partie n'a pas commencé
                  if (partie.id==data.idPartie){
                    for (var joueur in partie.joueurs){
                      if (partie.joueurs[joueur].idJoueur==socket.data.userId){
                        partie.joueurs.splice[joueur];
                        return;
                      }
                    }
                  }
                }
                
                for (var partie of partiesEnCours){//Cas où la partie a commencé (plus complexe, heureusement il y a une méthode dans game)
                  if (partie.id==data.idPartie){
                    partie.removePlayer(socket.data.userId);
                    var finipartie = partie.existeWinner();
                    if (finipartie!=false){ db.run("UPDATE users SET scoreBataille = scoreBataille+1 WHERE idU="+finipartie.idJoueur );
                    socket.emit('partieFinie',{'gagnant':pseudos[finipartie.idJoueur]})}
                    return;
                  }
                }
                
                
                
              })
              

              //------------------------------FONCTIONS POUR LE 6QUIPREND--------------------------------------------------
            

              function tryWinner(partie){
             
                if (partie.isOver()==false){return;}

                var classement = partie.rank();
                var retour = [];
                for (var joueur of classement){
                  db.run("UPDATE users SET score6quiprend = score6quiprend+"+(66-joueur.score*2)+" WHERE idU="+joueur.idJoueur )
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
                            //La fonction va être trèèèèès longue
                            switch (partie.state){
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
                                io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" choisit s'il veut terminer son tour.","rapportAction":{"type":"choix","valeur":{"boutons":["terminer son tour."],"idJoueur":partie.joueurCourant}}})
                                break
                              case "phase_Attaque"://Génère le bon tourPasse pour la phase d'attaque et la skip si impossible
                                var joueur;
                                for (var test of partie.joueurs){if (test.idJoueur==partie.joueurCourant){joueur=test}}

                              if (!partie.existTarget(joueur)){
                                  partie.state = "finTour"
                                  console.log("je mets fin au tour 1")
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
                                  io.emit("tourPasse",{"idPartie":partie.id,"Message":pseudos[partie.joueurCourant]+" choisit s'il veut faire le bien... ou faire le mal.","rapportAction":{"type":"choix","valeur":{"boutons":["attaquer","soigner"],"idJoueur":partie.joueurCourant}}})
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
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit qui trouvera son objet...","rapportAction": {type:"cartePiochée",valeur:partie.variableTemp},"idPartie":partie.id})
                                break
                                case "Poupée_Démoniaque":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a trouvé une poupée étrange et s'amuse avec... Mais l'image d'un autre joueur lui vient en tête. Qui est-ce ?","rapportAction":{type:"cartePiochée",valeur:"Poupée_Démoniaque"},"idPartie":partie.id})
                              break
                              case "Rituel_Diabolique":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" tombe sur les restes d'un vieux rituel maléfique et décide s'il souhaite s'y intéresser de plus près...","rapportAction":{"type":"choix","valeur":{"idJoueur":partie.joueurCourant,"boutons":["S'intéresser au rituel","Le laisser où il est"]}},"idPartie":partie.id})
                              break
                              case "Succube_Tentatrice":
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a trouvé une succube qui propose de l'aider à voler l'objet d'un joueur. "+pseudos[partie.joueurCourant]+" clique sur l'objet à voler !","rapportAction":{type:"cartePiochée",valeur:"Succube_Tentatrice"},"idPartie":partie.id})



                            }
                          }

                          function tourPasseDeMort(){

                          }

                          function piocheNoire(partie,joueur){//Fonction serveur pour faire piocher une carte noire au joueur passé en paramètre dans l'environnement de la partie
                            var cartePiochée = partie.drawNoire(joueur.idJoueur)
                              if (cartePiochée.valeur=="Dynamite"){
                                io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a lancé une dynamite sur "+partie.getNameFromZone(partie.zones[cartePiochée.data]),"rapportAction":{type:"cartePiochée",valeur:"Dynamite"},"idPartie":partie.id})
                                partie.state = "phase_Attaque"
                                setTimeout(() => {
                                  tourPasseDeCirconstance(partie)
                                }, 2500);
                              }
                                else{
                                  tourPasseDeCirconstance(partie)
                                  setTimeout(() => {
                                    tourPasseDeCirconstance(partie)
                                  }, 2500);
                                }
                            }//Fin piocheNoire

                          

                          function piocheBlanche(partie,joueur){

                          }

                          function piocheVerte(partie,joueur){

                          }

  
  
                          function effetCase(joueur,partie){//Selon la case courante du joueur, fait des effets différents
                            //Problème: c'est pas le bon joueur qui arrive en param, à résoudre elouand
                            switch (partie.zones[joueur.position]){
                              case "zone1":

                              piocheNoire(partie,joueur)

                              break

                              case "zone2":
                                partie.state = "choixPioche"
                                tourPasseDeCirconstance(partie)
                                break

                              case "zone3":
                                piocheNoire(partie,joueur)

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

                          }
                          //-------Les socket-----------------------------------
                        socket.on("reveleCarte",data=>{
                          
                          for (var partie of partiesEnCours){
                            if (partie.id == data.idPartie){
                              console.log(partie.state)
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
                                        
                                        case "Forêt_Hantée_2":
                                          for (var joueur of partie.joueurs){if (joueur.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueur}}
                                          if (partie.variableTemp=="attaquer"){
                                            if (cible.protected==false){
                                              cible.hurtPoint+=2}
                                            io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a blessé "+data.joueurConcerne+" grâce à la forêt.","rapportAction":false,"idPartie":data.idPartie})
                                            
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
                                            }

                                          break
                                          
                                        case "Chauve-Souris_Vampire":
                                          for (var joueur of partie.joueurs){if (joueur.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueur}}
                                          if (cible.protected==false){
                                            cible.hurtPoint+=2}
                                          for (var joueur of partie.joueurs){if (joueur.idJoueur==partie.joueurCourant){cible=joueur}}
                                          cible.hurtPoint-=1
                                          if (cible.hurtPoint<0){cible.hurtPoint=0}
                                          io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a volé 2 points de vie à "+data.joueurConcerne,"rapportAction":false,"idPartie":partie.id})
                                          partie.state = "phase_Attaque"
                                
                                          setTimeout(() => {
                                            tourPasseDeCirconstance(partie)
                                          }, 2500);
                                          break

                                          case "Araignée_Sanguinaire":
                                            for (var joueur of partie.joueurs){if (joueur.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueur}}
                                            if (joueur.protected==false){
                                              cible.hurtPoint+=2}
                                            for (var joueur of partie.joueurs){if (joueur.idJoueur==partie.joueurCourant){cible=joueur}}
                                            if (joueur.protected==false){
                                            cible.hurtPoint+=2}
                                            partie.state = "phase_Attaque"
                                          
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" et "+data.joueurConcerne+" ont été victimes de l'araignée ! Ils subissent 2 dégâts.","rapportAction":false,"idPartie":partie.id})
                                            setTimeout(() => {
                                              tourPasseDeCirconstance(partie)
                                            }, 2500);
                                            break

                                            case "Poupée_Démoniaque":
                                              partie.state =  "phase_Attaque"
                                              var chance = Math.floor(Math.random()*6)
                                              if (chance>=4){
                                                for (var joueur of partie.joueurs){
                                                  if (joueur.idJoueur==partie.joueurCourant){
                                              io.emit("tourPasse",{"Message":"La poupée se retourne contre "+pseudos[partie.joueurCourant]+" et lui inflige 3 dégâts !","rapportAction":false,"idPartie":partie.id})
                                              if (joueur.protected==false){
                                              joueur.hurtPoint+=3}
                                            }}}
                                              else{
                                                for (var jou of partie.joueurs){
                                                  if (jou.idJoueur==getIdFromPseudo(data.joueurConcerne)){
                                                    if (jou.protected==false){
                                                    jou.hurtPoint+=3}
                                                  }
                                                }
                                              io.emit("tourPasse",{"Message":"La poupée est prise d'une pulsion vengeresse et s'attaque à "+data.joueurConcerne+"  ! Il subit 3 dégâts !","rapportAction":false,"idPartie":partie.id})
                                              }
                                              setTimeout(() => {
                                                tourPasseDeCirconstance(partie)
                                              }, 2500);
                                              
                                              return
                                              break



                                            
                                          //Personnages
                                        case "pouvoirFu-ka":

                                        var cible;
                                        for (var joueur of partie.joueurs){if (joueur.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueur}}
                                        cible.hurtPoint = 7
                                        joueur.pouvoirUtilisé = true
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a ciblé "+data.joueurConcerne+" avec le pouvoir de Fu-ka !","rapportAction":false,"idPartie":data.idPartie})
                                        partie.state="débutTour"
                                        setTimeout(() => {
                                          io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}},"idPartie":data.idPartie})
                                        }, 2500);
                                        break;

                                        case "pouvoirFranklin":

                                          var cible;
                                          for (var joueur of partie.joueurs){if (joueur.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueur}}
                                          joueur.pouvoirUtilisé = true
                                          var dmg = Math.floor(Math.random()*5)+1
                                          partie.takeDamage(cible,dmg)
                                          if (!testFinPartie(partie.id)){
                                          if (cible.révélé){io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+data.joueurConcerne,"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,cible.character]}},"idPartie":data.idPartie})}
                                          else{io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+data.joueurConcerne,"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,false]}},"idPartie":data.idPartie})}
                                          partie.state="débutTour"
                                          setTimeout(() => {
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}},"idPartie":data.idPartie})
                                          }, 2500);
                                          break;}

                                          case "pouvoirGeorges":

                                          var cible;
                                          for (var joueur of partie.joueurs){if (joueur.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueur}}
                                          joueur.pouvoirUtilisé = true
                                          var dmg = Math.floor(Math.random()*3)+1
                                          partie.takeDamage(cible,dmg)
                                          if (!testFinPartie(partie.id)){
                                          if (cible.révélé){io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+pseudos[getIdFromPseudo(data.joueurConcerne)],"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,cible.character]}},"idPartie":data.idPartie})}
                                          else{io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+data.joueurConcerne,"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,false]}},"idPartie":data.idPartie})}
                                          partie.state="débutTour"
                                          setTimeout(() => {
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}},"idPartie":data.idPartie})
                                          }, 2500);
                                          break;}

                                          case "pouvoirEllen":

                                          var cible;
                                          for (var joueur of partie.joueurs){if (joueur.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueur}}
                                          joueur.pouvoirUtilisé = true
                                          cible.pouvoirUtilisé = true
                                          io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a privé "+pseudos[getIdFromPseudo(data.joueurConcerne)]+" de sa capacité !","rapportAction":false,"idPartie":data.idPartie})
                                          partie.state="débutTour"
                                          setTimeout(() => {
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}},"idPartie":data.idPartie})
                                          }, 2500);
                                          break;

                                          case "pouvoirMomie":
                                          var cible;
                                          for (var joueur of partie.joueurs){if (joueur.idJoueur==getIdFromPseudo(data.joueurConcerne)){cible=joueur}}
                                          if (cible.position!=partie.getIndexFromZone("Zone2")){return}
                                          joueur.pouvoirUtilisé = true
                                          var dmg = 3
                                          partie.takeDamage(cible,dmg)
                                          if (!testFinPartie(partie.id)){
                                          if (cible.révélé){io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+pseudos[partie.getIdFromCharacter(socket.data.carte)],"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,cible.character]}},"idPartie":data.idPartie})}
                                          else{io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" a infligé "+dmg+" dégâts à "+pseudos[getIdFromPseudo(data.joueurConcerne)],"rapportAction":{"type":"dégatsSubits","valeur":{"pseudo":pseudos[cible],"dégâts":dmg,"personnages":[joueur.character,false]}},"idPartie":data.idPartie})}
                                          partie.state="débutTour"
                                          setTimeout(() => {
                                            io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" choisit s'il veut lancer les dés","rapportAction":{"type":"choix","valeur":{"boutons":["lancer les dés !"],"idJoueur":partie.joueurCourant}},"idPartie":data.idPartie})
                                          }, 2500);
                                          break;}


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
                                          io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" a volé un objet à "+data.joueurConcerne,"rapportAction":false,"idPartie":data.idPartie})
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
                                            break

                                          case "Tenebres":
                                            console.log("carte noire piochée")
                                            piocheNoire(partie,joueur)
                                          break//Fin du case tenebres

                                          case "Vision":
                                          break

                                        }
                                    }

                                    if (data.type=="choix"){
                                      
                                      //Quand on attaque
                                      if (partie.state=="phase_Attaque"){//Cas où le joueur est supposé choisir une personne à attaquer
                                        if (data.text=="personne"){
                                          partie.state="finTour"
                                          
                                          tourPasseDeCirconstance(partie)
                                        }
                                        if (getIdFromPseudo(data.text)!=false){
                                          var resultat = partie.attaquer(socket.data.userId,getIdFromPseudo(data.text))
                                          if (resultat.lg==true){
                                            io.emit("tourPasse",{"Message":pseudos[partie.variableTemp]+" choisit s'il souhaite contre-attaquer.","rapportAction":{"type":"choix","valeur":{"boutons":["contre-attaquer !","ne rien faire..."],"idJoueur":partie.variableTemp}},"idPartie":data.idPartie})
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
                                      
                                      case "S'intéresser au rituel":
                                        for (var joueur of partie.joueurs){
                                          if (joueur.idJoueur==partie.joueurCourant){
                                          console.log(joueur.character)
                                          console.log(partie.shadowsBase)
                                        if (partie.shadowsBase.includes(joueur.character)){
                                          joueur.hurtPoint=0
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
                                        partie.state = "phase_Attaque"

                                        io.emit("tourPasse",{"Message":pseudos[partie.joueurCourant]+" passe son chemin...","rapportAction":false ,"idPartie":data.idPartie})
                                            setTimeout(() => {
                                            tourPasseDeCirconstance(partie)
                                          }, 2500);
                                          return
                                      break
                                      }

                                    }//Fin du cas où data.type == "choix"

                        }}}}}})



                          socket.on("utiliseCapacite",data=>{
                            console.log(data)
                            for (var partie of partiesEnCours){
                              if (partie.id==data.idPartie){
                                if (partie.getIdFromCharacter(data.capacite)!=socket.data.userId){return}
                                for (var joueur of partie.joueurs){
                                  if (joueur.idJoueur==socket.data.userId){
                                  if ( (joueur.révélé==false||joueur.pouvoirUtilisé==true)){{socket.emit("tourPasse",{"Message":"Révélez-vous pour utiliser votre pouvoir","rapportAction":false,"idPartie":data.idPartie});return;}}
                                  }}
                                switch (data.capacite){
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
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" utilise le pouvoir de Fu-ka !","rapportAction":false,"idPartie":data.idPartie})
                                        return
                                }
                                break

                                case "Franklin":
                                      if (partie.joueurCourant==socket.data.userId && partie.state=="débutTour"){
                                        partie.state = "pouvoirFranklin"
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" s'apprête à utiliser le pouvoir de Franklin !","rapportAction":false,"idPartie":data.idPartie})
                                        return
                                }
                                break
                                case "Georges":
                                      if (partie.joueurCourant==socket.data.userId && partie.state=="débutTour"){
                                        partie.state = "pouvoirGeorges"
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" s'apprête à utiliser le pouvoir de Georges !","rapportAction":false,"idPartie":data.idPartie})
                                        return
                                }
                                break

                                case "Ellen":
                                      if (partie.joueurCourant==socket.data.userId && partie.state=="débutTour"){
                                        partie.state = "pouvoirEllen"
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" s'apprête à utiliser le pouvoir d'Ellen !","rapportAction":false,"idPartie":data.idPartie})
                                        return
                                }
                                break

                                case "Allie":
                                  for (var joueur of partie.joueurs){if (joueur.idJoueur==socket.data.userId){joueur.hurtPoint=0;joueur.pouvoirUtilisé=true}}
                                        io.emit("tourPasse",{"Message":pseudos[socket.data.userId]+" se soigne de toutes ses blessures !","rapportAction":false,"idPartie":data.idPartie})
                                        setTimeout(() => {
                                          tourPasseDeCirconstance(partie)
                                        }, 2500);
                                        break

               
                                  case "Momie":
                                    console.log("Tentative d'utilisation de son pouvoir par "+pseudos[socket.data.userId]+" qui est "+data.capacite)
                                    console.log(partie.state)
                                    console.log(partie.joueurCourant)
                                    partie.joueurs[1].position = partie.getIndexFromZone("Zone2")
                                    if (partie.joueurCourant==socket.data.userId && partie.state=="débutTour"){
                                      var possible = false//Check pour voir si il y a une cible potentielle
                                      for (var joueur of partie.joueurs) {if (joueur.position==partie.getIndexFromZone("Zone2")){possible = true}}
                                      if (possible==false){return}

                                    partie.state = "pouvoirMomie"
                                    io.emit("tourPasse", { "Message": pseudos[socket.data.userId] + " canalise son énergie de momie et se prépare à frapper une cible sur la porte de l'outremonde!", "rapportAction": false, "idPartie": data.idPartie })
                                    return}
                                    break

                                    case "Liche":
                                      if (partie.joueurCourant==socket.data.userId){
                                        var j
                                        var t = 0
                                        for (var joueur of partie.joueurs){if (joueur.idJoueur==partie.joueurCourant){j = joueur}}
                                        for (var joueur of partie.joueurs){if (joueur.éliminé==true){t++}}
                                        j.turnsToPlay+=t
                                        io.emit("tourPasse", { "Message": pseudos[socket.data.userId] + " relève les morts et rejouera "+t+" fois.", "rapportAction": false, "idPartie": data.idPartie })
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
                                            io.emit("tourPasse", { "Message": pseudos[socket.data.userId] + " se protège jusqu'à son prochain tour", "rapportAction": false, "idPartie": data.idPartie })
                                            setTimeout(() => {
                                              tourPasseDeCirconstance(partie)
                                            }, 2500);
                                          }
                                        }
                                      }
                                    break


                              }
                            }
                             }})
            
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
