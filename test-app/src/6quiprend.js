import './App.css';
import React, { useEffect, useState } from 'react';
import SocketContext from './SocketContext';
import Chat from './Chat';
import {
    useNavigate
} from "react-router-dom";
import CarteJeu from './boeuf';
import { Lobby } from './Bataille';
import Boeuf from "./Boeuf.jsx"


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
              // console.log("ligne"+ index);
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

  useEffect(()=>{
    socket.on("gameStarting", (data) => { //Faire pareil avec tourpasse (!=gamestarting
      if (data.idPartie == idPartie) {
        setgameStart(true); //AAAAAAAAAAA
        socket.emit("isHost",{idPartie:urlP.get("idPartie")});
            socket.on("isHost", (data) => {
                if (data === true){
                    setHost(true);
                }
            });
     
        setListeLignes(data.lignes); //Liste de listes de Carte [{valeur}]

         console.log("ouai je demande les cartes");

        socket.emit("wantCarte", { "idPartie": idPartie}); //Demande de la main. 
        socket.on("getCarte", (data) => { //Récupération des cartes (de la main)
          //console.log("ouai j'ai les cartes");
          setListeCartes(data.main); //Set la main (liste de cartes) [{valeur}]
        });
      }  
    });

    socket.on("wantCarte",data=>{
      if (data==true){
        //AFFICHAGE DU FAIT DE POSER UNE CARTE
      }

    });

    // return () => {
    //   socket.off("getCarte");
    //   socket.off("gameStarting");
    // }
    
  },[]);

  useEffect(()=>{
    socket.on("partieChargee", (data) => {
      console.log("cc");
      if (data.id == idPartie) {
        setgameStart(true);
        socket.emit("isHost",{idPartie:urlP.get("idPartie")});
              socket.on("isHost", (data) => {
                  if (data === true){
                      setHost(true);
                  }
              });
        setListeLignes(data.lignes);
        socket.emit("wantCarte", { "idPartie": idPartie});
        socket.on("getCarte", (data) => {
          setListeCartes(data.main);
        });
        
      }
    }
    );
  },[]);

  useEffect(()=>{
    socket.emit('isloaded', {idPartie: idPartie});
    socket.on('isloaded', (data) => {
      if(data !== false){
        setgameStart(true);
        setListeLignes(data.lignes);
        socket.emit("wantCarte", { "idPartie": idPartie});
        socket.on("getCarte", (data) => {
          setListeCartes(data.main);
        });
        socket.emit("isHost",{idPartie:urlP.get("idPartie")});
              socket.on("isHost", (data) => {
                  if (data === true){
                      setHost(true);
                  }
              });
      }
    }
    );
  },[]);

  useEffect(()=>{
    socket.on("getScores",(data)=>{
      // console.log(idPartie);
      // console.log(data.idPartie);
      if(data.idPartie==idPartie){
        setInfosJoueurs(data.infosJoueurs);
      }
    });
  },[]);

  useEffect(()=>{

    let nouvelleMain2 =[]; //Futur liste d'entiers
    listeCartes.forEach((element,index)=>{ //C'est une boucle sur liste listeCartes
      nouvelleMain2.push(element.valeur); //Tout les elements de listeCartes sont mits dans la liste nouvelle main
    });
    setNouvelleMain(nouvelleMain2);

    // console.log(nouvelleMain);

  }, [listeCartes]); //S'effectue a chaque changement de listeCartes


  useEffect(()=>{

    let nouvelleListeLignes2 = []; //Futur liste de listes d'entiers
    listeLignes.forEach((ligne,index)=>{
      nouvelleListeLignes2.push([]); //Initialisation des sous tableaux
      ligne.forEach((carte,idx)=>{ //Boucle dans chaque ligne
        nouvelleListeLignes2[index].push(carte.valeur); //
      });
    });
    setNouvelleListeLignes(nouvelleListeLignes2);
    
    // console.log(nouvelleListeLignes);

  },[listeLignes]); //S'effectue a chaque chanement de listeLignes

  
  useEffect(()=>{
    socket.on("choixCarte", (data) => {
      
      socket.emit("wantCarte", { "idPartie": idPartie});

      if(data!=false){
        setnumeroCarteEval(data);
        // console.log(data);
      }
    
    })
    

  }, []);


  useEffect(()=>{
    socket.on("tourPasse",(info)=>{

      if (info.idPartie == idPartie) {
        
      // setListeJoueurs(info.joueurs);
      // nouvelle carte à afficher sur la gauche 
      setListeLignes(info.lignes);
      // choixNecessaire c'est un boolean 
      setChoixNecessaire(info.choixNecessaire);
      /* c'est là */ setnumeroCarteEval(info.carteEval); 
      setJourEval(info.joueurEval);
      socket.emit("wantCarte", { "idPartie": idPartie});
      }
    });
  },[]);


  // info de fin de partie
  useEffect(()=>{
    socket.on("gameFinished", (data)=>{
      if (data.idPartie == idPartie) {
        setFinish(true);
        setInfosFinPartie(data.classement);
      }
    })
  }, []);

  useEffect(()=>{
    socket.on("partiesauvegardee",(data)=>{
        console.log(data);
        if(data.idPartie == urlP.get("idPartie")){
            navigate("/6quiprend"); // regler
        }
    });
},[socket, urlP]);

  // INFO ENVOYEES AU SERVEUR

  function sauvegarderPartie(){
    // console.log("coucou")
    socket.emit("sauvegarderPartieSixQuiPrend",{"idPartie":urlP.get("idPartie")})
    navigate("/6quiprend")
}
  
  return (
    <div>
      {gameStart ? (
        gameFinish ? (
          <ApresJeu tableauFin={infosFinPartie}/>
        ) : (
          <>
            <Chat/>
            <AfficherStats infosJoueursFun={infosJoueurs} />
            <AfficherLigne listeLignes={nouvelleListeLignes} />
            <Main6QuiPrend listeNombre={nouvelleMain.sort()} />
            { host && (
                <button onClick={() => sauvegarderPartie()}>Sauvegarder la partie</button>
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
  



export const SixQuiPrend = () => {
    return (
        <div>
            {/* <AfficherLigne listeLignes={AAA}/>
            <Main6QuiPrend listeNombre={[5,11,20,35,2,5,89,57,35,2]}/>
            <Boeuf width="25%"/> */}
            {/* <GereJeu/> */}
            <Jouer />
        </div>
    );
};