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




//-------------------------------Classes-----------------------------------------------
const { Game,Bataille,sixquiprend } = require('./Game.js');
const { Joueur } = require('./Joueur.js');
const { Carte } = require('./Carte.js');



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
var partie = new sixquiprend(1,7);

console.log("-----------------TESTS-------------------")

console.log("-----------------TESTS-------------------")





//Demarrage d'une partie

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
// function reprendrePartie(idPartie){
//   for (var partie in partiesReprises){
//     if (partiesReprises[partie].id==idPartie){
//       partiesReprises[partie].initGame();
//       partiesEnCours.push(partiesReprises[partie]);
//       partiesReprises.splice(partie)
//       console.log("reprise de la partie "+idPartie)
//     }
//   }
// }

// CREATE TABLE "Batailles" (
// 	"idB"	INTEGER NOT NULL UNIQUE,
// 	"idH"	INTEGER NOT NULL,
// 	"Bataille"	TEXT,
// 	PRIMARY KEY("idB")
// );
function sauvegarderPartieBataille(idPartie, idHost, Bataille){
  Bataille = JSON.stringify(Bataille);
  db.run("INSERT INTO Batailles(idB,idH,Bataille) VALUES(?,?,?)",[idPartie, idHost, Bataille],(err)=>{
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

function supprimerPartieBataille(idPartie){
  db.run("DELETE FROM Batailles WHERE idB = ?",[idPartie],(err)=>{
    console.log(err);
  });
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
  socket.on('sauvegarderPartieBataille',data=>{
    //data : {idPartie}
    for (var partie of partiesEnCours){
      if (partie.id==data.idPartie){
        sauvegarderPartieBataille(data.idPartie,socket.data.userId,partie);
        return;
      }
    }
  })

  socket.on('loadPartieBataille', data => {
    //data : {idPartie}
    loadPartieBataille(data.idPartie).then((partie) => {
      socket.emit('partieChargee',partie);
      lancerPartie(data.idPartie);
    }).catch((err) => {
      // Gérez l'erreur ici
    });
  }
  )

  socket.on('supprimerPartieBataille',data=>{
    //data : {idPartie}
    supprimerPartieBataille(data.idPartie);
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

  socket.on('demandepartiesRejointes',data=>{
    var retour = []
    for (var partie of partiesEnCours){
      // recupérer la liste des parties dans lesquelles le joueur socket.data.userId est présent
      for (joueur of partie.joueurs){
        if (joueur.idJoueur==socket.data.userId){
        retour.push({"id":partie.id,"joueursActuels":partie.joueurs.length,"joueursMax":partie.joueursMax})
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
                  for (var joueur of partie.joueurs){listejoueurs.push(pseudos[joueur.idJoueur])}
                  io.emit("gameStarting",{"idPartie":data.idPartie,"lignes":partie.lignes,"joueurs":listejoueurs})}
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
              console.log("isHost");
              for (var partie of partiesEnCours){
                if (partie.id==data.idPartie){
                  for(var joueur of partie.joueurs){
                    // console.log(joueur);
                    if (joueur.isHost && joueur.idJoueur === socket.data.userId){
                      socket.emit('isHost',true);
                      console.log("true host");
                    }
                    else{
                      socket.emit('isHost',false);
                      console.log("false host");
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
