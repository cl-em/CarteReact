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


function ProgressBar(){
  return(
    <div className='container'>
      <div className='progress-bar'>
        <div className='progress-bar-fill'>
            ProgressBar
        </div>
      </div>
      <div className='progress-label'>
        50%
      </div>
      <button>Progress</button>
      <button>reset</button>
    </div>
  )
}



function Main6QuiPrend({ listeNombre }) { //Pour afficher la main (prend en param une liste d'int)

  const socket = React.useContext(SocketContext);

  let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
  let idPartie =  urlP.get("idPartie");
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

function afficherEtat({listeEtats}){
// liste d'objets {pseudo:String,tetes:Number,aJouer:Boolean}

  return(
    <div>
      {listeEtats.forEach((joueur,index)=>(
        <p>{joueur.pseudo} : a joué {joueur.aJouer? "oui" : "non"}</p>
      ))}
    </div>
  )
}

function Jouer(){

  const socket = React.useContext(SocketContext); //Pour les sockets

  let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
  let idPartie =  urlP.get("idPartie");


  // INFO RECU PAR LE SERVEUR

  // Recuperation avec les socket
  // si y a des *** c'est que c'est important sinon on peut le supprimer en vrai 
  const [listeCartes, setListeCartes] = useState([]); // *** Création de la variable listeCartes ainsi que de son setter.
  const [listeLignes, setListeLignes] = useState([]);  // *** Création de la variable recevant les lignes ainsi que son setter. Tableau de tableau

  const [numeroCarteEval,setnumeroCarteEval] = useState(false); // *** carte en train d'être evaluée
  const [listeJoueurs,setListeJoueurs] = useState([]); //  listes de joueurs {pseudo,carteJouée,tetes}
  const [choixNecessaire,setChoixNecessaire] = useState(""); // *** demande à un joueur de  cliquer sur une ligne 
  const [joueurEval,setJourEval] = useState("");


  // Formatage pour correspondre aux fonctions
  const [nouvelleMain, setNouvelleMain] = useState([]); // ***
  const [nouvelleListeLignes,setNouvelleListeLignes] = useState([]); // *** 



  useEffect(()=>{
    
    socket.on("gameStarting", (data) => { //Faire pareil avec tourpasse (!=gamestarting)
       console.log("la partie a commencé")
      // console.log(data.idPartie)
      // console.log(idPartie)
      if (data.idPartie == idPartie) {
         console.log("la partie a commencé ET C EST LA MIENNE")
        setListeLignes(data.lignes); //Liste de listes de Carte [{valeur}]

         console.log("ouai je demande les cartes");

        socket.emit("wantCarte", { "idPartie": urlP.get("idPartie")}); //Demande de la main. 
        socket.on("getCarte", (data) => { //Récupération des cartes (de la main)
           console.log("ouai j'ai les cartes");
          setListeCartes(data.main); //Set la main (liste de cartes) [{valeur}]
        });
      }  
    });

    socket.on("wantCarte",data=>{
      if (data==true){
        //AFFICHAGE DU FAIT DE POSER UNE CARTE
      }

    });

    return () => {
      socket.off("getCarte");
      socket.off("gamestarting");
    }
    
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
      socket.emit("wantCarte", { "idPartie": urlP.get("idPartie")});

      if(data!=false){
        setnumeroCarteEval(data);
        console.log(data);
      }
    })
    

  }, []);


  useEffect(()=>{
    socket.on("tourPasse",(info)=>{
      console.log("je recoit le tourPasse")
      // setListeJoueurs(info.joueurs);
      // nouvelle carte à afficher sur la gauche 
      setListeLignes(info.lignes);
      // choixNecessaire c'est un boolean 
      setChoixNecessaire(info.choixNecessaire);
      /* c'est là */ setnumeroCarteEval(info.carteEval); 
      setJourEval(info.joueurEval);
    });
  },[]);

  // INFO ENVOYEES AU SERVEUR

  //let J = ["Joueur1", "Joueur2", "Joueur3", "Joueur4", "Joueur5", "Joueur1", "Joueur2", "Joueur3", "Joueur4", "Joueur5"]
  
  return(
    <div>


      <AfficherLigne listeLignes={nouvelleListeLignes} />
      <Main6QuiPrend listeNombre={nouvelleMain.sort()} />
      <div className='infopartie'>
          {choixNecessaire? 
          <h3 style={{ color: 'aliceblue' }}>{joueurEval}, clique sur une ligne</h3>:
          (numeroCarteEval && joueurEval)?
            <div>
              <h3 style={{ color: 'aliceblue' }}>{joueurEval} joue la carte :</h3>
              <CarteJeu numeroCarte={numeroCarteEval} />
            </div> : <h3 style={{ color: 'aliceblue' }}>En attente que tout les joueurs placent une carte</h3>}
        </div>
    </div>  
  )
}

export const SixQuiPrend = () => {
    return (
        <div>
            {/* <AfficherLigne listeLignes={AAA}/>
            <Main6QuiPrend listeNombre={[5,11,20,35,2,5,89,57,35,2]}/>
            <Boeuf width="25%"/> */}
            <Chat />
            <Jouer /> 
        </div>
    );
};