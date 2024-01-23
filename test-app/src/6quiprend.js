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


function Main6QuiPrend({ listeNombre }) { //Pour afficher la main (prend en param une liste d'int)
    return (
      <div className='divSVG'>
        {listeNombre.map((numCarte, index) => (
          <CarteJeu key={index} numeroCarte={numCarte} />
        ))}
      </div>
    );
}

function AfficherLigne({listeLignes}){ //Pour afficher les 4 lignes du jeu (prend en param une liste de listes)
  return (
    <div className='lignesTable'>
    <table>
      {listeLignes.map((ligne,index)=>(
        <tr>
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

  //Recuperation avec les socket
  const [listeCartes, setListeCartes] = useState([]); //Création de la variable listeCartes ainsi que de son setter.
  const [listeLignes, setListeLignes] = useState([]);  //Création de la variable recevant les lignes ainsi que son setter. Tableau de tableau
  
  //Formatage pour correspondre aux fonctions
  const [nouvelleMain, setNouvelleMain] = useState([]);
  const [nouvelleListeLignes,setNouvelleListeLignes] = useState([]);


  let urlP = new URL(document.location).searchParams; //Permet de récupérer les paramètres dans l'url.

  useEffect(()=>{
    
    socket.on("gameStarting", (data) => { //Faire pareil avec tourpasse (!=gamestarting)
      if (data.idPartie === urlP.get("idPartie")) {

        setListeLignes(data.lignes); //Liste de listes de Carte [{valeur}]
        socket.emit("wantCarte", { "idPartie": urlP.get("idPartie")}); //Demande de la main. 
        socket.on("getCarte", (data) => { //Récupération des cartes (de la main)

          setListeCartes(data.main); //Set la main (liste de cartes) [{valeur}]
        });
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



  // demande carte
  // recupère les cartese

  // attribut lignes dans datas
  // socket.on("gamestarting") 


  return(
    <div>
      {/* <Chat /> */}
      <AfficherLigne listeLignes={nouvelleListeLignes} />
      <Main6QuiPrend listeNombre={nouvelleMain} />
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