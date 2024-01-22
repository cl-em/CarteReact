import './App.css';
// import {idJoueur} from './App.js';
// import {io} from "socket.io-client";
import React, { useEffect, useState } from 'react';
import SocketContext from './SocketContext';
import Chat from './Chat';
import {
    useNavigate
} from "react-router-dom";
import CarteJeu from './boeuf';
import { Lobby } from './Bataille';
import Boeuf from "./Boeuf.jsx"


function Main6QuiPrend({ listeNombre }) {
    return (
      <div className='divSVG'>
        {listeNombre.map((numCarte, index) => (
          <CarteJeu key={index} numeroCarte={numCarte} />
        ))}
      </div>
    );
}

// liste de listes de nombres
function AfficherLigne({listeLignes}){
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

let AAA = [[67,79,89],[9,6,104,98],[76,45,35,92, 20],[77,31,94,51]]
//let onlyJoueurs = ["Joueur1", "Joueur2"];


export const SixQuiPrend = () => {
    return (
        <div>
            <AfficherLigne listeLignes={AAA}/>
            <Main6QuiPrend listeNombre={[5,11,20,35,2,5,89,57,35,2]}/>
            <Boeuf width="25%"/>
        </div>
    );
};

// localhost:3000/6quiprendJeu