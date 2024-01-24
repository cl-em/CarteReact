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

//listesjoueurs c'est une listes de d'objet joueur {pseudo,carteJouée,tetes}
export function Lobby6qui({listesjoueurs, nbjoueurs , joueursmax}) {
  // const socket = React.useContext(SocketContext);
  // listesjoueurs : liste de string,
  
  function Emplacement(element, a) {
    element.style.left = 50 + 50 * Math.cos(a) + '%';
    element.style.top = 50 + 50 * Math.sin(a) + '%';
  }
  
  useEffect(() => {
      const pos = document.querySelectorAll('.pos');
  
      pos.forEach((cercle, index) => {
      let angle = (Math.PI * 2 * index) / pos.length;
      Emplacement(cercle, angle);
      });
  }, [listesjoueurs]); //chaque changement de listesjoueurs


  return (
      <div>
          <div className='Table6qui' id='Table6qui'>
              {listesjoueurs.map((joueur, index) => (
                <div className='pos' id={joueur.pseudo} key={index}>
                    {joueur.pseudo}
                    <CarteJeu numeroCarte={55} />
                </div>
              
              ))}
          </div>
      </div>
  );
}



function afficherCarteJouee({numCarte}){
  return(
    <div className='ouaicgreg'>
      <h3> Carte jouée</h3>
      <CarteJeu numeroCarte={numCarte} />
    </div>
  )
}


function Main6QuiPrend({ listeNombre }) { //Pour afficher la main (prend en param une liste d'int)

  const socket = React.useContext(SocketContext);

  let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
  let idPartie =  urlP.get("idPartie");

    return (
      <div className='divSVG'>
        {listeNombre.map((numCarte, index) => (
          <div key={index} onClick={()=>{
            // console.log("envoie carte");
            socket.emit("choixCarte",{idPartie:idPartie,idCarte:numCarte});
            // console.log("carte envoyée");
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
      {listeLignes.map((ligne,index)=>(

          <tr onClick={()=>{
            console.log("ligne"+ index);
            socket.emit("choixLigne",{idPartie:idPartie,idLigne:index});
          }}>
            {ligne.map((numCarte,idx)=>(
              <td><CarteJeu key={idx} numeroCarte={numCarte}/></td>
            ))}
          </tr>
     
      ))}
    </table>
    </div>
  )
}

function AfficherCartesJouee({listeCartes}){
  // liste unidimensionnel
  // doit devenir une liste bi dimensionnel 

  let listeJoueurCarte = [];
  let indicedeliste = 0;
  let indicedeCarte = 0;

  for(let i=0;i<2;++i){
    listeJoueurCarte.push([]);
    for(let j=0;j<5;++j){
      listeJoueurCarte[indicedeliste].push(listeCartes[indicedeCarte]);
      indicedeCarte++;
      
    }
    indicedeliste++;
  }

  return(
    <div className='joueurCarte'>
      <table>
      {listeJoueurCarte.map((ligne,index)=>(

          <tr >
            {ligne.map((numCarte,idx)=>(
              <td><CarteJeu key={idx} numeroCarte={numCarte}/></td>
            ))}
          </tr>
     
      ))}
    </table>
    </div>
  )
  


}

function Jouer(){

  const socket = React.useContext(SocketContext); //Pour les sockets

  let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.
  let idPartie =  urlP.get("idPartie");


  // INFO RECU PAR LE SERVEUR

  // Recuperation avec les socket
  const [listeCartes, setListeCartes] = useState([]); //Création de la variable listeCartes ainsi que de son setter.
  const [listeLignes, setListeLignes] = useState([]);  //Création de la variable recevant les lignes ainsi que son setter. Tableau de tableau

  const [numeroCarteEval,setnumeroCarteEval] = useState(false); // carte en train d'être evaluée
  const [listeJoueurs,setListeJoueurs] = useState([]); // listes de joueurs {pseudo,carteJouée,tetes}
  const [choixNecessaire,setChoixNecessaire] = useState(""); // demande à un joueur de  cliquer sur une ligne 


  // Formatage pour correspondre aux fonctions
  const [nouvelleMain, setNouvelleMain] = useState([]);
  const [nouvelleListeLignes,setNouvelleListeLignes] = useState([]);



  useEffect(()=>{
    
    socket.on("gameStarting", (data) => { //Faire pareil avec tourpasse (!=gamestarting)
      console.log("la partie a commencé")
      console.log(data.idPartie)
      console.log(idPartie)
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

    console.log(nouvelleMain);

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
    
    console.log(nouvelleListeLignes);

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
      setListeJoueurs(info.joueurs);
      setListeLignes(info.lignes);
      setChoixNecessaire(info.choixNecessaire);
      setnumeroCarteEval(info.carteEval);

    });
  },[]);

  let listeCartesJouee = [];
  listeJoueurs.forEach((joueur,index)=>{
    carteJouee.push(joueur.carteJouée);
  });

  // INFO ENVOYEES AU SERVEUR

  //let J = ["Joueur1", "Joueur2", "Joueur3", "Joueur4", "Joueur5", "Joueur1", "Joueur2", "Joueur3", "Joueur4", "Joueur5"]
  

  return(
    <div>
      {/* <Chat /> */}
      <AfficherLigne listeLignes={nouvelleListeLignes} />
      <AfficherCartesJouee listeCartes={listeCartesJouee} />
      <Main6QuiPrend listeNombre={nouvelleMain} />
      <div className = "Lobby6qui ">
      uuu
      </div>
    </div>  
  )
}

let AAA = [[67,79,89],[9,6,104,98],[76,45,35,92, 20],[77,31,94,51]]

export const SixQuiPrend = () => {
    return (
        <div>
            {/* <AfficherLigne listeLignes={AAA}/>
            <Main6QuiPrend listeNombre={[5,11,20,35,2,5,89,57,35,2]}/>
            <Boeuf width="25%"/> */}
            <Jouer /> 
        </div>
    );
};