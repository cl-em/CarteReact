import '../App.css';
import React, { useEffect, useState } from 'react';
import SocketContext from '../SocketContext.js';
import Chat from '../Chat.js';
import {
    useNavigate
} from "react-router-dom";
import CarteJeu from './boeuf.js';

function Connecte() {
  let urlP = new URL(document.location).searchParams;
  let idPartie = urlP.get("idPartie");
  let socket = React.useContext(SocketContext);

  const [pseudo, setPseudo] = useState("...");

  useEffect(() => {
      socket.emit("quisuisje?");
      socket.on("quisuisje", (data) => {
          // console.log("Pseudo reçu :", data.pseudos);
          setPseudo(data);
      })
      return () => {
          socket.off("quisuisje");
      };
  }, [])

  return (
      <div id="sauvegarde-btn" className="quisuisje">
          <p>Connecté en tant que {pseudo}</p>
      </div>
  )
}

function ProgressBar({progress}){

  // progress = progress*100/66;

  const getColor = (p)=>{
    if(p < 40)
      return "#2ecc71";
    else if (p < 70) 
      return "#ffa500";
    else return "#ff0000";
  }

  return(
    <div className='container'>
      <div className='progress-bar' >
        <div className='progress-bar-fill' style={{width: progress>0 && progress<5 ? "5%" : `${parseInt(progress*100/66)}%` , backgroundColor: getColor(parseInt(progress*100/66)), textAlign:"center"}}>
            {progress}/66
        </div>
      </div>
    </div>
  )
}

function AfficherStats({infosJoueursFun}){
  return(
    <div className='afficherStats'>
      {infosJoueursFun.map((element,index)=>(
        <div key={index} className='infoJoueur6'>
          <p className='labelStats'>{element.pseudo} a joué : {!element.doitJouer? "oui" : "non"}</p>
          <ProgressBar progress={element.tetes} />
        </div>
      ))}
    </div>
  )
}


function Main6QuiPrend({ listeNombre }) { //Pour afficher la main (prend en param une liste d'int)

  const socket = React.useContext(SocketContext);

  let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
  let idPartie =  parseInt(urlP.get("idPartie"));
  listeNombre.sort();

    return (
      <div className='divSVG'>
        {listeNombre.map((numCarte, index) => (
          <div key={index} onClick={()=>{
            socket.emit("choixCarte",{idPartie:idPartie,idCarte:numCarte});
            
          }}>
            <CarteJeu  numeroCarte={numCarte} />
          </div>
        ))}
      </div>
    );
}

function AfficherLigne({listeLignes}){ //Pour afficher les 4 lignes du jeu (prend en param une liste de listes)

  const socket = React.useContext(SocketContext);

  let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
  let idPartie =  urlP.get("idPartie");

  return (
    <div className='lignesTable'>
    <table>
      <tbody>
        {listeLignes.map((ligne,index)=>(

            <tr key={index} onClick={()=>{
              // // console.log("ligne"+ index);
              socket.emit("choixLigne",{idPartie:idPartie,idLigne:index});
            }}>
              {ligne.map((numCarte,idx)=>(
                <td key={idx+index*ligne.lenght}><CarteJeu  numeroCarte={numCarte}/></td>
              ))}
            </tr>
      
        ))}
      </tbody>
    </table>
    </div>
  )
}


function AvantJeu(){
  return(
    <div>
      <h3 style={{ color: 'aliceblue' }}>En attente des joueurs</h3>
    </div>
  )
}

function ApresJeu({tableauFin}){

  const navigate = useNavigate();

  // [{pseudo,score}]

  return (
    <div>
      <center><h1 style={{ color: 'aliceblue' }}>Classement de la partie:</h1></center> <br></br>
      <div className="leaderboard">
        {
          <table>
            <thead>
              <tr>
                <th>Pseudo</th>
                <th>Nombre de têtes de boeuf</th>
                <th>Classement</th>
              </tr>
            </thead>
            <tbody>
              {tableauFin.map((player, index) => (
                <tr key={index}>
                  <td>{player.pseudo}</td>
                  <td>{player.score}</td>
                  <td>{index+1}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
      <br></br>
      {<button class="joliebouton" onClick={()=>navigate("/games")}>Revenir à l'écran de sélection des jeux</button>}
    </div>
  );


}


function Jouer(){

  const socket = React.useContext(SocketContext); //Pour les sockets

  let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
  let idPartie =  urlP.get("idPartie");


  const navigate = useNavigate();
  
  // INFO RECU PAR LE SERVEUR

  // Recuperation avec les socket
  // si y a des *** c'est que c'est important sinon on peut le supprimer en vrai 
  const [listeCartes, setListeCartes] = useState([]); // *** Création de la variable listeCartes ainsi que de son setter.
  const [listeLignes, setListeLignes] = useState([]);  // *** Création de la variable recevant les lignes ainsi que son setter. Tableau de tableau

  const [numeroCarteEval,setnumeroCarteEval] = useState(false); // *** carte en train d'être evaluée
  const [listeJoueurs,setListeJoueurs] = useState([]); //  listes de joueurs {pseudo,carteJouée,tetes}
  const [choixNecessaire,setChoixNecessaire] = useState(""); // *** demande à un joueur de  cliquer sur une ligne 
  const [joueurEval,setJourEval] = useState("");
  const [gameStart, setgameStart] = useState(false);
  const [gameFinish, setFinish] = useState(false);


  // Formatage pour correspondre aux fonctions
  const [nouvelleMain, setNouvelleMain] = useState([]); // ***
  const [nouvelleListeLignes,setNouvelleListeLignes] = useState([]); // *** 

  
  // Affichage des statistiques de la partie en direct 
  const [infosJoueurs,setInfosJoueurs] = useState([]);

  // Infos de fin de partie
  const [infosFinPartie,setInfosFinPartie]= useState([]);

  const [host, setHost] = useState(false);

  useEffect(() => {
    const handleGameStarting = data => {
      // console.log("gameStarting");
      if (data.idPartie === idPartie) {
        setgameStart(true);
        // setHost(data.Host);
        // console.log(data);
        setListeLignes(data.lignes);
        socket.emit("wantCarte", { "idPartie": idPartie}); //Demande de la main. 
        socket.on("getCarte", (data) => { //Récupération des cartes (de la main)
          setListeCartes(data.main); //Set la main (liste de cartes) [{valeur}]
        });
      }
    };
  
    const handleGameFinished = data => {
      // console.log("gameFinished");
      if (data.idPartie === idPartie) {
        setFinish(true);
        setInfosFinPartie(data.classement);
      }
    };

    const handleGetScores = data => {
      // console.log("getScores");
      if(data.idPartie===idPartie){
        setInfosJoueurs(data.infosJoueurs);
      }
    };

    const handleChoixCarte = data => {
      // console.log("choixCarte");
      socket.emit("wantCarte", { "idPartie": idPartie});
      if(data!==false){
        setnumeroCarteEval(data);
      }
    };

    const handleTourPasse = data => {
      // console.log("tourPasse");
      if (data.idPartie === idPartie) {
        if (data.lignes) {
          setListeLignes(data.lignes);
        }
        setChoixNecessaire(data.choixNecessaire);
        setnumeroCarteEval(data.carteEval);
        setJourEval(data.joueurEval);
        socket.emit("wantCarte", { "idPartie": idPartie});
      }
    };

    const handleIsHost = data => {
      // console.log("isHost");
      // console.log(data);
      if (data === true){
        setHost(true);
    }}
    
    socket.on("gameStarting", handleGameStarting);
    socket.on("gameFinished", handleGameFinished);
    socket.on("getScores", handleGetScores);
    socket.on("choixCarte", handleChoixCarte);
    socket.on("tourPasse", handleTourPasse);
    socket.emit("isHost",{"idPartie": idPartie});
    socket.on("isHost", handleIsHost);

    // Nettoyage
    return () => {
      socket.off("gameStarting", handleGameStarting);
      socket.off("gameFinished", handleGameFinished);
      socket.off("getCarte");
      socket.off("wantCarte");
      socket.off("partieSauvegardee");
      socket.off("isHost", handleIsHost);
    };
  }, []); // Dépendances

  useEffect(() => {
    const handlePartieSauvegardee = data => {
      // console.log("partieSauvegardee");
      if(data.idPartie === idPartie){
        navigate("/6quiprend");
      }
    };
    socket.on("partieSauvegardee", handlePartieSauvegardee);
    return () => {
      socket.off("partieSauvegardee", handlePartieSauvegardee);
    }
  }, []);

  useEffect(()=>{
    // console.log("isloaded")
      socket.emit('isloaded', {idPartie: idPartie});
      socket.on('isloaded', (data) => {
      if(data !== false){
        setgameStart(true);
        setListeLignes(data.lignes);
        socket.emit("wantCarte", { "idPartie": idPartie});
        socket.on("getCarte", (data) => {
          if (data.main){
            setListeCartes(data.main);
          }
        });
      }
    }
    );
  },[]);


useEffect(()=>{
  // console.log("listeCartes");
  let nouvelleMain2 =[]; //Futur liste d'entiers
  listeCartes.forEach((element,index)=>{ //C'est une boucle sur liste listeCartes
    nouvelleMain2.push(element.valeur); //Tout les elements de listeCartes sont mits dans la liste nouvelle main
  });
  setNouvelleMain(nouvelleMain2);

  // // console.log(nouvelleMain);

}, [listeCartes]); //S'effectue a chaque changement de listeCartes


useEffect(()=>{
  // console.log("listeLignes");
  let nouvelleListeLignes2 = []; //Futur liste de listes d'entiers
  
  listeLignes.forEach((ligne,index)=>{
    nouvelleListeLignes2.push([]); //Initialisation des sous tableaux
    ligne.forEach((carte,idx)=>{ //Boucle dans chaque ligne
      nouvelleListeLignes2[index].push(carte.valeur); //
    });
  });
  setNouvelleListeLignes(nouvelleListeLignes2);
  
  // // console.log(nouvelleListeLignes);

},[listeLignes]); //S'effectue a chaque chanement de listeLignes

  // INFO ENVOYEES AU SERVEUR

  function sauvegarderPartie(){
    // // console.log("coucou")
    socket.emit("sauvegarderPartieSixQuiPrend",{"idPartie":idPartie});
    navigate("/6quiprend")
}
  let cansave = true;
  for (let i = 0; i < infosJoueurs.length; i++){
    if (infosJoueurs[i].doitJouer === false){
      cansave = false;
    }
  }
  return (
    <div>
      {gameStart ? (
        gameFinish ? (
          <ApresJeu tableauFin={infosFinPartie}/>
        ) : (
          <>
          
            <Connecte/>
            <Chat/>
            <AfficherStats infosJoueursFun={infosJoueurs} />
            <AfficherLigne listeLignes={nouvelleListeLignes} />
            <Main6QuiPrend listeNombre={nouvelleMain.sort()} />
            { host && cansave && (
                <button id="sauvegarde-btn" className="joliebouton"onClick={() => sauvegarderPartie()}>Sauvegarder la partie</button>
            )}
            <div className='infopartie'>
              {choixNecessaire ? 
                <h3 style={{ color: 'aliceblue' }}>{joueurEval}, clique sur une ligne</h3> :
                (numeroCarteEval && joueurEval) ?
                  <div>
                    <h3 style={{ color: 'aliceblue' }}>{joueurEval} joue la carte :</h3>
                    <CarteJeu numeroCarte={numeroCarteEval} />
                  </div> :
                  <h3 style={{ color: 'aliceblue' }}>En attente que tous les joueurs placent une carte</h3>
              }
            </div>
          </>
        )
      ) : (
        <AvantJeu />
      )}
    </div>  
  );
}  
  
export function QuittePartie({typePartie,ajoutStyle={},className="joliebouton"}){
  
  let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
  let idPartie =  urlP.get("idPartie");
  
  
  
  const socket = React.useContext(SocketContext); //Pour les sockets
  const navigate = useNavigate();


  return (<div className={className} style={{position:'absolute',top:1,alignItems:'center',zIndex:12,...ajoutStyle}}
  onClick={()=>{  
    socket.emit("quittePartie",{idPartie:idPartie,typePartie:typePartie})
    navigate("/games")}}>
    Quitter la partie
  </div>)
}


export const SixQuiPrend = () => {



    return (
        <div>
          
          <QuittePartie typePartie={"6quiprend"} />
          <Jouer />
        </div>
    );
};